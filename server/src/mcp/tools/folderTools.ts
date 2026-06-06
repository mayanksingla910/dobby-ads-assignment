import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Folder from "../../models/Folder";
import Image from "../../models/Image";

async function computeFolderSize(folderId: string): Promise<number> {
  const images = await Image.find({ folder: folderId });
  const imageSize = images.reduce((sum, img) => sum + (img.size ?? 0), 0);

  const subFolders = await Folder.find({ parent: folderId });
  const subSizes = await Promise.all(
    subFolders.map((f) => computeFolderSize(String(f._id)))
  );

  return imageSize + subSizes.reduce((sum, s) => sum + s, 0);
}

export function registerFolderTools(server: McpServer, userId: string) {
  server.registerTool(
    "list_folders",
    {
      title: "List Folders",
      description:
        "List folders owned by the current user. Pass a parentId to list sub-folders inside a specific folder, or omit it to list root folders.",
      inputSchema: {
        parentId: z
          .string()
          .optional()
          .describe("MongoDB ObjectId of the parent folder (omit for root)"),
      },
    },
    async ({ parentId }) => {
      const folders = await Folder.find({
        owner: userId,
        parent: parentId ?? null,
      }).lean();

      const withSizes = await Promise.all(
        folders.map(async (f) => ({
          id: String(f._id),
          name: f.name,
          parent: f.parent ? String(f.parent) : null,
          totalSize: await computeFolderSize(String(f._id)),
        }))
      );

      return {
        content: [{ type: "text", text: JSON.stringify(withSizes, null, 2) }],
      };
    }
  );

  server.registerTool(
    "create_folder",
    {
      title: "Create Folder",
      description:
        "Create a new folder for the current user. Optionally nest it inside an existing folder by providing parentId.",
      inputSchema: {
        name: z.string().min(1).describe("Name of the new folder"),
        parentId: z
          .string()
          .optional()
          .describe(
            "MongoDB ObjectId of the parent folder. Omit to create at root."
          ),
      },
    },
    async ({ name, parentId }) => {
      if (parentId) {
        const parent = await Folder.findOne({ _id: parentId, owner: userId });
        if (!parent) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Parent folder "${parentId}" not found or does not belong to you.`,
              },
            ],
            isError: true,
          };
        }
      }

      const folder = await Folder.create({
        name,
        owner: userId,
        parent: parentId ?? null,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                id: String(folder._id),
                name: folder.name,
                parent: folder.parent ? String(folder.parent) : null,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.registerTool(
    "rename_folder",
    {
      title: "Rename Folder",
      description: "Rename an existing folder owned by the current user.",
      inputSchema: {
        folderId: z
          .string()
          .describe("MongoDB ObjectId of the folder to rename"),
        newName: z.string().min(1).describe("New name for the folder"),
      },
    },
    async ({ folderId, newName }) => {
      const folder = await Folder.findOneAndUpdate(
        { _id: folderId, owner: userId },
        { name: newName },
        { new: true }
      );

      if (!folder) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Folder "${folderId}" not found or does not belong to you.`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Folder renamed successfully to "${folder.name}".`,
          },
        ],
      };
    }
  );

  server.registerTool(
    "delete_folder",
    {
      title: "Delete Folder",
      description:
        "Delete a folder and ALL of its contents (sub-folders and images) recursively. This is irreversible.",
      inputSchema: {
        folderId: z
          .string()
          .describe("MongoDB ObjectId of the folder to delete"),
      },
    },
    async ({ folderId }) => {
      const folder = await Folder.findOne({ _id: folderId, owner: userId });
      if (!folder) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Folder "${folderId}" not found or does not belong to you.`,
            },
          ],
          isError: true,
        };
      }

      async function deleteRecursive(id: string) {
        const children = await Folder.find({ parent: id });
        for (const child of children) await deleteRecursive(String(child._id));
        await Image.deleteMany({ folder: id });
        await Folder.findByIdAndDelete(id);
      }

      await deleteRecursive(folderId);

      return {
        content: [
          {
            type: "text",
            text: `Folder "${folder.name}" and all its contents have been deleted.`,
          },
        ],
      };
    }
  );
}