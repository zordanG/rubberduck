import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon: LucideIcon;
}

export default function EmptyState({ title, description, icon: Icon }: EmptyStateProps) {
  return (
    <div className='mx-auto max-w-md flex flex-col justify-center items-center gap-2 text-center'>
      <Icon size={40} />
      <div className='mt-4 text-2xl font-bold'>{title}</div>
      {description && <div className='text-muted-foreground'>{description}</div>}
    </div>
  );
}
