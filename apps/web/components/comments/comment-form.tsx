'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { CreateCommentPayload } from '@/types/comments';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

// id do usuário para teste
// feat puxar o id automaticamente
const PLACEHOLDER_USER_ID = '';

type CommentFormProps = {
  postId: string;
  onSuccess?: () => void;
};

export function CommentForm({ postId, onSuccess }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (content.trim().length < 10) {
      setError('O comentário deve ter pelo menos 10 caracteres!');
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload: CreateCommentPayload = {
      content: content.trim(),
      is_best_answer: false,
      post_id: postId,
      user_id: PLACEHOLDER_USER_ID,
    };

    try {
      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar comentário! Tente novamente.');
      }

      // limpar o campo
      setContent('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
      <textarea
        id='comment-content'
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder='Ex: Esse função zordan() ficou muito bom...'
        rows={4}
        disabled={isLoading}
        className='w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
      />

      {error && (
        <p role='alert' className='text-sm text-destructive'>
          {error}
        </p>
      )}

      <Button
        type='submit'
        variant='custom'
        size='sm'
        disabled={isLoading}
        className='self-end w-[160px] h-[35px]'
        id='submit-comment-btn'
      >
        {isLoading ? 'Enviando...' : 'Comentar'}
      </Button>
    </form>
  );
}
