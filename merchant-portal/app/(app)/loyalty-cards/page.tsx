import Card from '@/components/ui/card';

export default function LoyaltyCardsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Loyalty cards</h1>
        <p className="mt-2 text-sm text-zinc-600">Design and publish loyalty programmes.</p>
      </div>

      <Card className="rounded-[32px] p-6">
        <p className="text-sm text-zinc-600">Coming soon.</p>
      </Card>
    </div>
  );
}

