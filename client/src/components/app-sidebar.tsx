import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ChevronRight, Folder, FolderOpen, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { getAllFolders } from "@/api/folders"
import { useAuth } from "@/hooks/useAuth"
import type { Folder as FolderType } from "@/types/folder"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

type FolderNode = FolderType & { children: FolderNode[] }

function buildTree(
  folders: FolderType[],
  parentId: string | null = null
): FolderNode[] {
  return folders
    .filter((f) => f.parent === parentId)
    .map((f) => ({ ...f, children: buildTree(folders, f._id) }))
}

function FolderTreeItem({
  node,
  depth = 0,
}: {
  node: FolderNode
  depth?: number
}) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isActive = id === node._id
  const hasChildren = node.children.length > 0

  return (
    <Collapsible defaultOpen={isActive}>
      <SidebarMenuItem>
        <div
          className="flex items-center"
          style={{ paddingLeft: `${depth * 12}px` }}
        >
          <CollapsibleTrigger asChild>
            <button
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-sm ${hasChildren ? 'hover:bg-sidebar-accent' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              {hasChildren ? (
                <ChevronRight className="size-3.5 transition-transform duration-200 in-data-[state=open]:rotate-90" />
              ) : (
                <span className="w-3.5" />
              )}
            </button>
          </CollapsibleTrigger>

          <SidebarMenuButton
            isActive={isActive}
            onClick={() => navigate(`/folder/${node._id}`)}
            className="min-w-max flex-1"
          >
            {isActive ? (
              <FolderOpen className="size-4 shrink-0" />
            ) : (
              <Folder className="size-4 shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </SidebarMenuButton>
        </div>

        {hasChildren && (
          <CollapsibleContent>
            <div>
              {node.children.map((child) => (
                <FolderTreeItem
                  key={child._id}
                  node={child}
                  depth={depth + 1}
                />
              ))}
            </div>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  )
}

function UserCard({ user }: { user: ReturnType<typeof useAuth>["user"] }) {
  if (!user) return null

  return (
    <>
      <Avatar className="size-8 shrink-0">
        <AvatarFallback>
          {user.name?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col text-left">
        <span className="truncate text-sm font-medium">{user.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {user.email}
        </span>
      </div>
    </>
  )
}

export function AppSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [folders, setFolders] = useState<FolderType[]>([])

  useEffect(() => {
    getAllFolders().then((data) => setFolders(data.folders || []))
  }, [])

  const tree = buildTree(folders)

  return (
    <Sidebar>
      <SidebarHeader className="p-4 text-lg font-semibold">
        Dobby Ads
      </SidebarHeader>

      <SidebarContent className="overflow-x-auto overflow-y-auto p-2">
        <SidebarMenu className="min-w-max">
          {tree.map((node) => (
            <FolderTreeItem key={node._id} node={node} />
          ))}
          {tree.length === 0 && (
            <p className="px-2 text-sm text-muted-foreground">No folders yet</p>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="flex flex-row items-center justify-between border-t p-2 py-3">
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-sm p-1 hover:bg-sidebar-accent/50">
              <UserCard user={user} />
            </div>
          </HoverCardTrigger>
          <HoverCardContent side="top" className="flex w-60 items-center gap-3">
            <UserCard user={user} />
          </HoverCardContent>
        </HoverCard>

        <button
          onClick={() => {
            logout()
            navigate("/login")
          }}
          className="shrink-0 rounded-md p-1 hover:bg-sidebar-accent"
          title="Sign out"
        >
          <LogOut className="size-4 text-muted-foreground hover:text-foreground" />
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
