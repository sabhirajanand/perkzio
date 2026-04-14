import Image from 'next/image';

export interface LoginShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function LoginShell({ title, subtitle, children }: LoginShellProps) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
      <div className="flex w-full max-h-[735px] h-[735px] overflow-hidden">
        <div className="hidden lg:block h-full">
          <div className="relative h-full overflow-hidden p-16">
            <Image
              src="/Images/login-bg.png"
              alt=""
              fill
              priority
              quality={100}
              className="object-cover"
              sizes="746.67px"
            />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.8)_0%,rgba(7,7,7,0.5)_50%,rgba(0,0,0,0)_100%)]" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center">
                <div className="relative h-[81.46px] min-w-[324px] overflow-hidden">
                  <Image
                    src="/Images/logo.png"
                    alt="Perkzio"
                    fill
                    className="object-contain object-left"
                    sizes="324px"
                  />
                </div>
              </div>

              <div className="flex-1" />

              <div className="max-w-[576px] space-y-10 pb-2">
                <h1 className="text-[72px] font-bold leading-[100px] tracking-[-1.8px] text-white">
                  Elevate your Loyalty Experience.
                </h1>
                <p className="text-[20px] font-semibold leading-8 text-white/70">
                  The premium merchant ecosystem designed for businesses that demand more than just a
                  points system. Real-time analytics, electric performance.
                </p>

                <div className="flex h-[60px] items-start gap-12">
                  <div className="flex h-[60px] w-[110.06px] flex-col">
                    <div className="h-10 text-[36px] font-bold leading-10 tracking-[-0.9px] text-[#FD499B]">
                      2.4M+
                    </div>
                    <div className="pt-1">
                      <div className="text-xs font-bold uppercase tracking-[1.2px] text-[#F42875]">
                        Active Users
                      </div>
                    </div>
                  </div>

                  <div className="flex h-[60px] w-[110.53px] flex-col">
                    <div className="h-10 text-[36px] font-bold leading-10 tracking-[-0.9px] text-[#F9FAFB]">
                      99.9%
                    </div>
                    <div className="pt-1">
                      <div className="text-xs font-bold uppercase tracking-[1.2px] text-[#F42875]">
                        Uptime Rate
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex h-full flex-1 items-center justify-center bg-white px-6 py-12 lg:px-20 lg:py-[174px]">
          <div className="pointer-events-none absolute right-0 top-0 h-[399px] w-[400px] rounded-full bg-[#FFB2BF]/10 blur-[60px]" />
          <div className="relative w-full max-w-[448px]">
            <div className="w-full max-w-[380px] space-y-12">
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

