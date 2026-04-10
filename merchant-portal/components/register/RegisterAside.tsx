'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { registerCarouselSlides } from '@/lib/register-carousel';
import { cn } from '@/lib/utils/cn';

const ROTATE_MS = 6000;

export default function RegisterAside() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % registerCarouselSlides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(t);
  }, []);

  return (
    <aside className="relative z-10 flex w-full shrink-0 flex-col border-b border-white/5 bg-white px-[30px] pb-12 pt-12 lg:h-full lg:max-h-none lg:min-h-0 lg:w-[388px] lg:max-w-[388px] lg:shrink-0 lg:overflow-y-auto lg:overflow-x-hidden lg:border-b-0 lg:border-r">
      <div className="pointer-events-none absolute right-0 top-[58px] h-[388px] w-[349px] rounded-full bg-[#FFB2BF]/10 blur-[120px]" />

      <div className="relative z-10 min-h-[81px] min-w-[280px]">
        <div className="relative h-[81px] min-w-[280px] max-w-[324px]">
          <Image src="/Images/logo.png" alt="Perkzio" fill className="object-contain object-left" priority />
        </div>
      </div>

      <div className="relative z-10 mt-8 flex min-h-0 flex-1 flex-col">
        <div className="relative min-h-[280px] w-full shrink-0">
          {registerCarouselSlides.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                i === index ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0',
              )}
              aria-hidden={i !== index}
            >
              <h2 className="text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[1.1] tracking-tight">
                {s.headlineLines.map((line, li) => (
                  <span
                    key={li}
                    className={cn(
                      'block',
                      s.accentLineIndex === li ? 'text-primary' : 'text-[#011D35]',
                    )}
                  >
                    {line}
                  </span>
                ))}
              </h2>
              <p className="mt-6 text-lg font-normal leading-[1.625] text-zinc-900">{s.subline}</p>
            </div>
          ))}
        </div>

        <div
          className="mt-10 flex items-center gap-2"
          role="tablist"
          aria-label="Marketing highlights"
        >
          {registerCarouselSlides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                'shrink-0 rounded-full transition-all duration-300',
                i === index ? 'h-[15px] w-10 bg-primary' : 'h-[15px] w-[15px] bg-[#323534] hover:bg-zinc-600',
              )}
            />
          ))}
        </div>
      </div>

      <p className="relative z-10 mt-auto pt-10 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
        © 2024 Perkzio Global Systems.
      </p>
    </aside>
  );
}
