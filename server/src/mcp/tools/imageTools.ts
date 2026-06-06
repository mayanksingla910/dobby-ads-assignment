import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Image from "../../models/Image";
import Folder from "../../models/Folder";

export function registerImageTools(server: McpServer, userId: string) {
  server.registerTool(
    "list_images",
    {
      title: "List Images",
      description:
        "List all images inside a specific folder owned by the current user.",
      inputSchema: {
        folderId: z
          .string()
          .describe("MongoDB ObjectId of the folder to list images from"),
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

      const images = await Image.find({ folder: folderId, owner: userId }).lean();

      const result = images.map((img) => ({
        id: String(img._id),
        name: img.name,
        url: img.url,
        size: img.size,
      }));

      return {
        content: [
          {
            type: "text",
            text:
              result.length === 0
                ? "No images found in this folder."
                : JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    "delete_image",
    {
      title: "Delete Image",
      description:
        "Delete a specific image by its ID. The image must belong to the current user.",
      inputSchema: {
        imageId: z.string().describe("MongoDB ObjectId of the image to delete"),
      },
    },
    async ({ imageId }) => {
      const image = await Image.findOneAndDelete({
        _id: imageId,
        owner: userId,
      });

      if (!image) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Image "${imageId}" not found or does not belong to you.`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Image "${image.name}" deleted successfully.`,
          },
        ],
      };
    }
  );

  server.registerTool(
    "move_image",
    {
      title: "Move Image",
      description:
        "Move an image from its current folder to a different folder.",
      inputSchema: {
        imageId: z.string().describe("MongoDB ObjectId of the image to move"),
        targetFolderId: z
          .string()
          .describe("MongoDB ObjectId of the destination folder"),
      },
    },
    async ({ imageId, targetFolderId }) => {
      const targetFolder = await Folder.findOne({
        _id: targetFolderId,
        owner: userId,
      });
      if (!targetFolder) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Target folder "${targetFolderId}" not found or does not belong to you.`,
            },
          ],
          isError: true,
        };
      }

      const image = await Image.findOneAndUpdate(
        { _id: imageId, owner: userId },
        { folder: targetFolderId },
        { new: true }
      );

      if (!image) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Image "${imageId}" not found or does not belong to you.`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Image "${image.name}" moved to folder "${targetFolder.name}" successfully.`,
          },
        ],
      };
    }
  );
}