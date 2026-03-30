export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  return <div className='container mx-auto px-4 py-10'>slug: {slug}</div>;
}
