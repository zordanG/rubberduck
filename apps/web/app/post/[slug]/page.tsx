import { Badge } from '@/components/ui/badge';
import { dateFormatted } from '@/lib/utils';
import { Post } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const postRes = await fetch(`${API_URL}/posts/slug/${slug}`, { cache: 'no-store' });
  if (!postRes.ok) {
    throw new Error(`Falha ao carregar dados do post. Status: ${postRes.status}`);
  }

  const post: Post = await postRes.json();

  return (
    <div className='container mx-auto px-4 lg:px-40 xl:px-70 py-10'>
      <h1 className='text-3xl font-bold'>{post.title}</h1>

      <p className='text-sm text-muted-foreground font-semibold'>{dateFormatted(post.created_at)}</p>

      <Badge variant='custom' className='w-fit p-4 rounded-lg mb-3 font-semibold'>
        {post.language}
      </Badge>

      <p className='text-base'>{post.description}</p>
    </div>
  );
}
