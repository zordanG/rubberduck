export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className='min-h-screen w-full flex items-center justify-center bg-background p-4 md:p-8'>
      <div className='w-full flex justify-center'>{children}</div>
    </main>
  );
}
