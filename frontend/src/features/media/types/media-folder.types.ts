export interface MediaFolderTreeNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: MediaFolderTreeNode[];
  mediaCount: number;
}

export interface CreateMediaFolderInput {
  name: string;
  parentId?: string | null;
}

export interface UpdateMediaFolderInput {
  name?: string;
  parentId?: string | null;
}
