import { cn } from '@/lib/utils/cn';

export interface RegisterFormCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function RegisterFormCard({ children, className }: RegisterFormCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl bg-white p-8 pt-10 shadow-[0_12px_32px_rgba(1,29,53,0.12)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
