export function formatRelativeTime(iso: string | null): string {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const sec = Math.round((Date.now() - then) / 1000);
  if (sec < 45) return 'Just now';
  if (sec < 3600) {
    const m = Math.floor(sec / 60);
    return `${m} min${m === 1 ? '' : 's'} ago`;
  }
  if (sec < 86400) {
    const h = Math.floor(sec / 3600);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  if (sec < 604800) {
    const d = Math.floor(sec / 86400);
    return `${d} day${d === 1 ? '' : 's'} ago`;
  }
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
