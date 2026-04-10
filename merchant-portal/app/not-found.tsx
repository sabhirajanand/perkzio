import Link from 'next/link';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Card className="p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Page not found</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            The page you’re looking for doesn’t exist.
          </p>
          <div className="mt-8">
            <Link href="/login">
              <Button>Go to login</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

