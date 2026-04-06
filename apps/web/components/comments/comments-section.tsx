'use client';

import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { CommentForm } from './comment-form';
import { CommentsList } from './comments-list';

type CommentsSectionProps = {
  postId: string;
};

export function CommentsSection({ postId }: CommentsSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCommentSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <section aria-label='Comentários' className='flex flex-col gap-6 mt-10'>
      <div className='flex flex-col gap-4'>
        <h2 className='text-lg font-semibold'>Deixe um comentário</h2>
        <CommentForm postId={postId} onSuccess={handleCommentSuccess} />
      </div>

      <Separator />

      <div className='flex flex-col gap-4'>
        <h2 className='text-lg font-semibold'>Comentários</h2>
        <CommentsList postId={postId} refreshKey={refreshKey} />
      </div>
    </section>
  );
}
