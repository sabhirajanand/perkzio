import Card from '@/components/ui/card';

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Tickets</h1>
        <p className="mt-2 text-sm text-zinc-600">Create and track support tickets.</p>
      </div>

      <Card className="rounded-[32px] p-6">
        <p className="text-sm text-zinc-600">Coming soon.</p>
      </Card>
    </div>
  );
}

