import Card from '@/components/ui/card';

export default async function ComingSoonPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = `/${slug.join('/')}`;
  return (
    <Card className="rounded-[32px] p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Coming soon</h1>
      <p className="mt-2 text-sm text-zinc-600">
        This module isn’t implemented yet.
      </p>
      <p className="mt-4 text-sm font-semibold text-zinc-900">{path}</p>
    </Card>
  );
}

