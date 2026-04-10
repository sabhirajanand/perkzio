export interface AdminLoginShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AdminLoginShell({ title, subtitle, children }: AdminLoginShellProps) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-black/5">
        <div className="grid min-h-[735px] grid-cols-1 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative hidden lg:flex flex-col justify-between p-16 bg-zinc-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(241,30,105,0.25),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(255,79,163,0.18),transparent_55%)]" />
            <div className="relative space-y-10">
              <div className="h-[56px] w-[170px] bg-[url(/Images/logo.png)] bg-contain bg-left bg-no-repeat" aria-label="Brand logo" />
              <h1 className="text-[56px] font-bold leading-[72px] tracking-[-1.2px] text-white">
                Control.
                <br />
                Approve.
                <br />
                Operate.
              </h1>
              <p className="text-[18px] font-semibold leading-7 text-white/70">
                Internal operations console for platform staff. Access is permission-controlled.
              </p>
            </div>

            <div className="relative grid grid-cols-2 gap-10 pt-10">
              <div className="space-y-1">
                <div className="text-[28px] font-bold tracking-[-0.6px] text-[#FD499B]">RBAC</div>
                <div className="text-xs font-bold uppercase tracking-[1.2px] text-[#F42875]">
                  Permissions
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[28px] font-bold tracking-[-0.6px] text-white">Audit</div>
                <div className="text-xs font-bold uppercase tracking-[1.2px] text-[#F42875]">
                  Visibility
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center px-6 py-12 lg:px-16">
            <div className="pointer-events-none absolute right-0 top-0 h-[399px] w-[400px] rounded-full bg-[#FFB2BF]/10 blur-[60px]" />
            <div className="relative w-full max-w-[420px] space-y-10">
              <div className="space-y-4">
                <h2 className="text-[36px] font-bold leading-10 tracking-[-0.9px] text-black">
                  {title}
                </h2>
                <p className="whitespace-pre-line text-base leading-6 text-black">{subtitle}</p>
              </div>
              <div>{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

