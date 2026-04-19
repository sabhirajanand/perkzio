export function customerInitials(input: { firstName: string | null; lastName: string | null; email: string | null }): string {
  const first = input.firstName?.trim().charAt(0);
  const last = input.lastName?.trim().charAt(0);
  if (first && last) return `${first}${last}`.toUpperCase();
  if (first) return first.toUpperCase();
  const fromEmail = input.email?.trim().charAt(0);
  if (fromEmail) return fromEmail.toUpperCase();
  return '?';
}
