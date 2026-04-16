import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const rows = [
  {
    time: '12:45 PM',
    name: 'Alex Thompson',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuALVz3pKTaAL5hM5_-uDbcPliV04mHQWkyXiuQwyZ2jB5v-2FlsNpqbARBQdTR84fjBezPMjGBbR4-Fev3XmuXambiwF17jf4pF5Q5B8hbuilENGHvErgIDvPIX4D2EceRfU3cJtNKzxW-47NZsEIz2X01hD-XLZTe3j60fWb980C1yEZRU6_477SjvQGNOmjxakaCNJCWPMnIxsDTcER7XHiq-hSu8rDFbV0n9XlEpSSHvtQ8H-rHCdxwOUnHXYReHo9d4tgG-7PrT',
    branch: 'Soho Main Store',
    mode: 'NFC Tap',
    modeClass: 'bg-secondary-fixed-dim/30 text-secondary-brand',
    alt: 'Customer',
    rowTint: false,
  },
  {
    time: '12:32 PM',
    name: 'Sarah Jenkins',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC1E-_ze30rabMssS1buVxr53_3r9orAIKTF8RDPYN-uv-8oqMAFyWyC1zzT4ov4yWkD2D-NMkiijzztfCUckzHEQLjO_9dBtNbghTcg6CVkcpHkE3AWZyDF2zzg1xlaXy0zShsfeZ_Gf1xqYD29SIf2dtKZGXI1dvdQK7v3UJf4AQVbMgA4uuYEWj31Oi0C6RyEmyLSw3yS7dKCHgNltG2q7ki_2q5YPSPoxccaa5aMj9P4Gl6ceEPx4nI-FzorhQkQfje8T7K3CQ-',
    branch: 'Covent Garden',
    mode: 'In-App Scan',
    modeClass: 'bg-primary-fixed-dim/30 text-primary-brand',
    alt: 'Customer',
    rowTint: true,
  },
  {
    time: '11:58 AM',
    name: 'Marcus Vane',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCIB7jYmUBCvie1-JGHgS3WFl6ZoogvvBH7c9uLSBzmI-gqLyXxWiKKbQODrnhKEWQOKyAkeoUVjLjBgwKaCNbNBxvYF_sKX_A0vJtBx79M0vLkThGskwwQIcY0DNvmy_Amt7hdNoTTTDqxzc9S9_RznQqaB_OORYXrXNXSoApfmQz5dE0xyVNOE93k7F6Yp9QZQaSR7a1QlRWtv5W-9lHWBi8_mh7aqQejiTXUG43xdF2Za9y6ljUOcvtL6ZSzGYDAOpup3cH7vMps',
    branch: 'Soho Main Store',
    mode: 'NFC Tap',
    modeClass: 'bg-secondary-fixed-dim/30 text-secondary-brand',
    alt: 'Customer',
    rowTint: false,
  },
];

export default function DashboardRecentActivity() {
  return (
    <div className="kinetic-shadow mb-12 overflow-hidden rounded-lg bg-surface-container-lowest">
      <div className="flex items-center justify-between border-b border-surface-container-low p-8">
        <h4 className="font-headline text-xl font-bold">Recent Stamp Activity</h4>
        <button
          type="button"
          className="text-primary-brand hover:text-primary-brand/90 flex items-center text-sm font-bold transition-transform hover:translate-x-1"
        >
          View All
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low/50">
              <th className="text-outline px-8 py-5 text-[10px] font-black uppercase tracking-[0.1em]">Time</th>
              <th className="text-outline px-8 py-5 text-[10px] font-black uppercase tracking-[0.1em]">Customer</th>
              <th className="text-outline px-8 py-5 text-[10px] font-black uppercase tracking-[0.1em]">Branch</th>
              <th className="text-outline px-8 py-5 text-[10px] font-black uppercase tracking-[0.1em]">Mode</th>
              <th className="text-outline px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.1em]">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-transparent">
            {rows.map((r) => (
              <tr
                key={`${r.time}-${r.name}`}
                className={[
                  'hover:bg-surface-container-low transition-colors',
                  r.rowTint ? 'bg-surface-container-low/30' : '',
                ].join(' ')}
              >
                <td className="px-8 py-5 text-sm font-medium">{r.time}</td>
                <td className="px-8 py-5">
                  <div className="flex items-center space-x-3">
                    <Image
                      alt={r.alt}
                      className="rounded-full object-cover"
                      src={r.avatar}
                      width={32}
                      height={32}
                      unoptimized
                    />
                    <span className="text-sm font-bold text-on-surface">{r.name}</span>
                  </div>
                </td>
                <td className="text-outline px-8 py-5 text-sm font-medium">{r.branch}</td>
                <td className="px-8 py-5">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${r.modeClass}`}>{r.mode}</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500" aria-label="Completed" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
