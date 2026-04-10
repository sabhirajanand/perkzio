'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils/cn';

export type TabsProps = TabsPrimitive.TabsProps;

export default function Tabs(props: TabsProps) {
  return <TabsPrimitive.Root {...props} />;
}

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex rounded-full',
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold',
        className,
      )}
      {...props}
    />
  );
}
