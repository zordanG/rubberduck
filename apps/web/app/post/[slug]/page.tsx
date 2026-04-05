import { CommentsSection } from '@/components/comments/comments-section';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const response = await fetch(`${API_URL}/posts/slug/${slug}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    notFound(); // tela 404 do nextjs
  }
  const post = await response.json();

  return (
    <div>
      <CommentsSection postId={post.id} />
    </div>
  );
}
