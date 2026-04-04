export interface Post {
  id: string;
  title: string;
  slug: string;
  language: string;
  code: string;
  description: string | null;
  view_count: number;
  is_resolved: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PostList {
  itens: Post[];
  totalItens: number;
  totalPages: number;
}
