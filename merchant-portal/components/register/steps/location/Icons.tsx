import {
  BadgeCheck,
  Camera,
  CloudUpload,
  Clock,
  FileText,
  Globe,
  IdCard,
  MapPin,
  Target,
  Zap,
} from 'lucide-react';

export function ComplianceIcon({ className }: { className?: string }) {
  return <BadgeCheck className={className} aria-hidden />;
}

export function LocationPinIcon({ className }: { className?: string }) {
  return <MapPin className={className} aria-hidden />;
}

export function ClockIcon({ className }: { className?: string }) {
  return <Clock className={className} aria-hidden />;
}

export function WebIcon({ className }: { className?: string }) {
  return <Globe className={className} aria-hidden />;
}

export function CloudUploadIcon({ className }: { className?: string }) {
  return <CloudUpload className={className} aria-hidden />;
}

export function BoltIcon({ className }: { className?: string }) {
  return <Zap className={className} aria-hidden />;
}

export function TargetIcon({ className }: { className?: string }) {
  return <Target className={className} aria-hidden />;
}

export function IdCardIcon({ className }: { className?: string }) {
  return <IdCard className={className} aria-hidden />;
}

export function DocumentIcon({ className }: { className?: string }) {
  return <FileText className={className} aria-hidden />;
}

export function CameraIcon({ className }: { className?: string }) {
  return <Camera className={className} aria-hidden />;
}
