'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { User2Icon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { dateFormatted } from '@/lib/utils';
import type { Comment } from '@/types/comments';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

type CommentItemProps = {
  comment: Comment;
  onUpdate?: () => void;
};

export function CommentItem({ comment, onUpdate }: CommentItemProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [isMarkingBest, setIsMarkingBest] = useState(false);

  const handleVote = async (type: 'upvote' | 'downvote') => {
    if (isVoting) return;
    setIsVoting(true);

    try {
      const response = await fetch(`${API_URL}/comments/${comment.id}/${type}`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Não foi possível registrar seu voto!');

      onUpdate?.();
    } catch (err) {
      console.log(err instanceof Error ? err.message : 'Erro desconhecido!');
    } finally {
      setIsVoting(false);
    }
  };

  const handleBestAnswer = async () => {
    if (isMarkingBest) return;
    // feat - modal para confirmar
    setIsMarkingBest(true);

    try {
      const response = await fetch(`${API_URL}/comments/${comment.id}/best-answer`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error();

      onUpdate?.();
    } catch (err) {
      console.log(err instanceof Error ? err.message : 'Erro desconhecido!');
    } finally {
      setIsMarkingBest(false);
    }
  };

  return (
    <div className='flex gap-3 py-4 border-b border-border last:border-b-0'>
      <div className='flex items-center justify-center size-9 rounded-full bg-tertiary shrink-0 mt-0.5'>
        <User2Icon className='text-secondary size-5' />
      </div>

      <div className='flex flex-col gap-2 flex-1 min-w-0'>
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='text-sm font-semibold truncate'>{comment.user?.username || 'Usuário Desconhecido'}</span>

          {comment.is_best_answer && (
            <Badge variant='secondary' className='flex items-center gap-1 text-xs px-2 py-0.5 rounded-full'>
              Melhor Resposta
            </Badge>
          )}
          <span className='text-xs text-muted-foreground ml-auto shrink-0'>{dateFormatted(comment.created_at)}</span>
        </div>

        <p className='text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words'>{comment.content}</p>

        <div className='flex items-center gap-4 mt-1'>
          <button
            disabled={isVoting}
            onClick={() => handleVote('upvote')}
            className='flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <ThumbsUp className={`size-3.5 ${comment.upvotes > 0 ? 'text-blue-300' : ''}`} />
            <span>{comment.upvotes}</span>
          </button>
          <button
            type='button'
            disabled={isVoting}
            onClick={() => handleVote('downvote')}
            className='flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <ThumbsDown className={`size-3.5 ${comment.downvotes > 0 ? 'text-red-300' : ''}`} />
            <span>{comment.downvotes}</span>
          </button>

          {!comment.is_best_answer && (
            <button
              type='button'
              disabled={isMarkingBest}
              onClick={handleBestAnswer}
              className='ml-auto text-xs text-muted-foreground hover:text-foreground font-medium transition-colors disabled:opacity-50'
            >
              {isMarkingBest ? 'Marcando...' : 'Marcar como Melhor Resposta'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
