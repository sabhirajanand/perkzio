'use client';

import Tabs, { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Shield } from 'lucide-react';
import type { MerchantRole } from '@/lib/schemas/auth';

export interface RoleTabsProps {
  value: MerchantRole;
  onChange: (value: MerchantRole) => void;
}

export default function RoleTabs({ value, onChange }: RoleTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as MerchantRole)}>
      <TabsList className="w-full bg-black p-1.5">
        <TabsTrigger
          value="MERCHANT_ADMIN"
          className="flex-1 bg-black text-white data-[state=active]:bg-white data-[state=active]:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <Shield size={16} aria-hidden="true" />
            Merchant Admin
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="BRANCH_ADMIN"
          className="flex-1 bg-black text-white data-[state=active]:bg-white data-[state=active]:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <Building2 size={16} aria-hidden="true" />
            Branch Admin
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
