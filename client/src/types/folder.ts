export type Folder = {
  _id: string
  name: string
  parent: string | null
  totalSize: number
  createdAt: string
  updatedAt: string
}

export type Image = {
  _id: string
  name: string
  url: string
  size: number
  folder: string
  createdAt: string
  updatedAt: string
}

export type BreadcrumbItem = {
  id: string
  name: string
}

export type FolderContents = {
  folder: Folder
  subfolders: Folder[]
  images: Image[]
  breadcrumb: BreadcrumbItem[]
}