import PaginationConfigured from '@/components/pagination-configured';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { dateFormatted } from '@/lib/utils';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api`;

export interface Post {
  itens: {
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
  }[];
  totalItens: number;
  totalPages: number;
}

type SearchParams = Promise<{ page: string }>;

export default async function IndexPage({ searchParams }: { searchParams: SearchParams }) {
  const { page } = await searchParams;

  let currentPage = 1;
  if (page) {
    const parsedPage = parseInt(page, 10);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      currentPage = parsedPage;
    } else {
      redirect('?page=1');
    }
  }

  const limit = 6;
  const postsRes = await fetch(`${API_URL}/posts?page=${currentPage}&limit=${limit}`, { cache: 'no-store' });
  const posts: Post = await postsRes.json();

  const totalPages = posts.totalPages;

  if (totalPages > 0 && currentPage > totalPages) {
    redirect(`?page=${totalPages}`);
  }

  return (
    <div className='container mx-auto px-4 py-10'>
      <div className='grid grid-cols-[repeat(auto-fit,minmax(300px,380px))] justify-center gap-6'>
        {posts.itens.map((post) => (
          <Card
            key={post.slug}
            size='default'
            className='flex h-[390px] w-full flex-col shadow-sm transition-shadow hover:shadow-md'
          >
            <CardHeader>
              <Badge variant='custom' className='w-fit p-4 rounded-lg mb-3 font-semibold'>
                {post.language}
              </Badge>
              <CardTitle className='line-clamp-2 text-xl font-bold'>
                <Link href={`/posts/${post.slug}`}>{post.title}</Link>
              </CardTitle>
              <CardDescription className='text-sm'>{dateFormatted(post.created_at)}</CardDescription>
            </CardHeader>

            <CardContent className='flex-1'>
              <p className='text-muted-foreground line-clamp-6 text-base'>{post.description}</p>
            </CardContent>

            <CardFooter className='p-4'>
              <Link href={`/post/${post.slug}`} className='w-full'>
                <Button variant='custom' size='default' className='w-full'>
                  Ler Mais
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <PaginationConfigured currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
