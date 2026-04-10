import Card from '@/components/ui/card';

export interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-[1fr_420px] lg:items-center">
        <div className="hidden lg:block">
          <div className="relative overflow-hidden rounded-3xl bg-white p-10 shadow-sm ring-1 ring-black/5">
            <div className="pointer-events-none absolute -left-10 top-10 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
            <div className="relative">
              <div className="text-sm font-semibold tracking-tight text-zinc-900">
                Perkzio
              </div>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-900">
                Loyalty, offers, and campaigns — in one place.
              </h1>
              <p className="mt-3 max-w-md text-base leading-7 text-zinc-600">
                Manage loyalty cards, run campaigns, and track redemptions across your outlets.
              </p>
            </div>
          </div>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h2>
          {subtitle ? (
            <p className="mt-2 text-sm leading-6 text-zinc-600">{subtitle}</p>
          ) : null}
          <div className="mt-8">{children}</div>
        </Card>
      </div>
    </div>
  );
}
