import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: number;
}

export default function Spinner({ size = 18 }: SpinnerProps) {
  return <Loader2 className="animate-spin" size={size} aria-hidden="true" />;
}

