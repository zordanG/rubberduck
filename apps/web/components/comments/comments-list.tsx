'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommentItem } from './comment-item';
import type { Comment } from '@/types/comments';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
const COMMENTS_PER_PAGE = 5;

type CommentsListProps = {
  postId: string;
  refreshKey?: number;
};

function CommentSkeleton() {
  return (
    <div className='flex gap-3 py-4 border-b border-border animate-pulse'>
      <div className='size-8 rounded-full bg-muted shrink-0 mt-0.5' />
      <div className='flex flex-col gap-2 flex-1'>
        <div className='flex gap-2 items-center'>
          <div className='h-3.5 w-20 rounded bg-muted' />
          <div className='h-3 w-24 rounded bg-muted ml-auto' />
        </div>
        <div className='h-3 w-full rounded bg-muted' />
        <div className='h-3 w-4/5 rounded bg-muted' />
        <div className='h-3 w-3/5 rounded bg-muted' />
      </div>
    </div>
  );
}

export function CommentsList({ postId, refreshKey = 0 }: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(
    async (pageToLoad: number, reset: boolean, silent: boolean = false) => {
      if(!silent) {
        reset ? setIsLoading(true) : setIsLoadingMore(true);
      }
      setError(null);

      try {
        const response = await fetch(`${API_URL}/comments?page=${pageToLoad}&limit=${COMMENTS_PER_PAGE}&post_id=${postId}`, {
          cache: 'no-store',
        });

        if (!response.ok) throw new Error('Erro ao carregar comentários!');

        const data: Comment[] = await response.json();
        setComments((prev) => {
          if (reset) return data;
          
          const newComments = data.filter(
            (newItem) => !prev.some((oldItem) => oldItem.id === newItem.id)
          );
          return [...prev, ...newComments];
        });
        setHasMore(data.length === COMMENTS_PER_PAGE);
        setPage(pageToLoad);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido!');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [postId],
  );

  useEffect(() => {
    fetchComments(1, true);
  }, [refreshKey, fetchComments]);

  const handleLoadMore = () => {
    fetchComments(page + 1, false);
  };

  if (isLoading && comments.length===0) {
    return (
      <div className='flex flex-col'>
        {Array.from({ length: 3 }).map((_, i) => <CommentSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center gap-2 py-8 text-center'>
        <p className='text-sm text-destructive'>{error}</p>
        <Button variant='outline' size='sm' onClick={() => fetchComments(1, true)}>
          Tentar novamente!
        </Button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className='flex flex-col items-center gap-2 py-10 text-center text-muted-foreground'>
        <p className='text-sm'>Nenhum comentário ainda. Seja o primeiro.</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      <div className='flex items-center gap-2 mb-2'>
        <MessageSquare className='size-4 text-muted-foreground' />
        <span className='text-sm font-medium text-muted-foreground'>
          {comments.length} {comments.length === 1 ? 'comentário' : 'comentários'} exibidos
        </span>
      </div>

      <div className='flex flex-col'>
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} onUpdate={() => fetchComments(1, true, true)} />
        ))}
      </div>

      {hasMore && (
        <div className='flex justify-center mt-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className='gap-2'
          >
            {isLoadingMore ? 'Carregando...' : 'Carregar mais comentários'}
          </Button>
        </div>
      )}
    </div>
  );
}
