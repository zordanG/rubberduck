import Link from 'next/link';

export function Nav() {
  return (
    <div className='flex gap-4 justify-between px-20 py-4 bg-secondary border-b'>
      <div className='flex gap-20'>
        <Link href='./' className='flex gap-2  items-center'>
          <div className='size-10 bg-tertiary rounded-full' />
          <div>
            <label className='block text-2xl font-bold leading-6'>Rubberduck</label>
            <label className='block text-xs text-right'>for Devs</label>
          </div>
        </Link>
        <ul className='flex gap-8 items-center'>
          <li>
            <Link href='./'>Início</Link>
          </li>
          <li>
            <Link href='novo'>Criar post</Link>
          </li>
        </ul>
      </div>
      <div className='flex gap-4 items-center'>
        <div>Config</div>
        <div className='size-12 rounded-full bg-tertiary' />
      </div>
    </div>
  );
}
