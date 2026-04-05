import Link from 'next/link';

export default function Logo({ link = '/' }: { link?: string }) {
  return (
    <Link href={link} className='flex gap-2 items-center'>
      <div className='size-10 bg-tertiary rounded-full' />
      <div>
        <label className='block text-2xl font-bold leading-6'>Rubberduck</label>
        <label className='block text-xs text-right'>for Devs</label>
      </div>
    </Link>
  );
}
