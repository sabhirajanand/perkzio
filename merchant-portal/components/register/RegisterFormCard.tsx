import { cn } from '@/lib/utils/cn';

export interface RegisterFormCardProps {
  children: React.ReactNode;
  showRequired?: boolean;
  className?: string;
}

export default function RegisterFormCard({ children, showRequired, className }: RegisterFormCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl bg-white p-8 pt-10 shadow-[0_12px_32px_rgba(1,29,53,0.12)]',
        className,
      )}
    >
      {showRequired ? (
        <span className="absolute right-6 top-0 z-10 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary to-[#E91E8C] px-4 py-1 text-[12px] font-semibold uppercase leading-4 tracking-[0.1em] text-white">
          Required
        </span>
      ) : null}
      {children}
    </div>
  );
}
