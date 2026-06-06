// hooks/useFolders.ts
import useSWR from "swr"
import { getAllFolders, getRootFolders, getFolderById, createFolder, deleteFolder } from "@/api/folders"
import type { Folder, Image } from "@/types/folder"


function makeTempFolder(name: string, parentId?: string | null): Folder {
  return {
    _id: `temp-${Date.now()}`,
    name,
    parent: parentId ?? null,
    totalSize: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function flatFolderMutate(mutate: Function, folders: Folder[]) {
  return {
    async create(name: string, parentId: string | undefined, fetcher: () => Promise<any>) {
      const temp = makeTempFolder(name, parentId)
      await mutate(
        async () => { await createFolder(name, parentId); return fetcher() },
        {
          optimisticData: { folders: [...folders, temp] },
          revalidate: false,
          rollbackOnError: true,
        }
      )
    },
    async delete(id: string, fetcher: () => Promise<any>) {
      await mutate(
        async () => { await deleteFolder(id); return fetcher() },
        {
          optimisticData: { folders: folders.filter((f) => f._id !== id) },
          revalidate: false,
          rollbackOnError: true,
        }
      )
    },
  }
}

export function useAllFolders() {
  const { data, error, isLoading, mutate } = useSWR("folders/all", getAllFolders)
  const folders: Folder[] = data?.folders ?? []
  const { create, delete: del } = flatFolderMutate(mutate, folders)

  return {
    folders,
    isLoading,
    error,
    mutate,
    optimisticCreate: (name: string, parentId?: string) => create(name, parentId, getAllFolders),
    optimisticDelete: (id: string) => del(id, getAllFolders),
  }
}

export function useRootFolders() {
  const { data, isLoading, mutate } = useSWR("folders", getRootFolders)
  const folders: Folder[] = data?.folders ?? []
  const { create, delete: del } = flatFolderMutate(mutate, folders)

  return {
    folders,
    isLoading,
    mutate,
    optimisticCreate: (name: string, parentId?: string) => create(name, parentId, getRootFolders),
    optimisticDelete: (id: string) => del(id, getRootFolders),
  }
}

export function useFolder(id: string | undefined) {
  const { data, isLoading, mutate } = useSWR(
    id ? `folders/${id}` : null,
    () => getFolderById(id!)
  )

  const subfolders: Folder[] = data?.subfolders ?? []
  const images: Image[] = data?.images ?? []

  async function optimisticCreateSubfolder(name: string) {
    const temp = makeTempFolder(name, id)
    await mutate(
      async () => { await createFolder(name, id); return getFolderById(id!) },
      {
        optimisticData: (current: any) => ({
          ...current,
          subfolders: [...(current?.subfolders ?? []), temp],
        }),
        revalidate: false,
        rollbackOnError: true,
      }
    )
  }

  async function optimisticDeleteSubfolder(folderId: string) {
    await mutate(
      async () => { await deleteFolder(folderId); return getFolderById(id!) },
      {
        optimisticData: (current: any) => ({
          ...current,
          subfolders: current?.subfolders?.filter((f: Folder) => f._id !== folderId) ?? [],
        }),
        revalidate: false,
        rollbackOnError: true,
      }
    )
  }

  return {
    subfolders,
    images,
    breadcrumb: data?.breadcrumb,
    isLoading,
    mutate,
    optimisticCreateSubfolder,
    optimisticDeleteSubfolder,
  }
}