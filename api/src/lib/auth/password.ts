import bcrypt from 'bcryptjs';

export async function hashPassword(input: { password: string }): Promise<string> {
  return bcrypt.hash(input.password, 10);
}

export async function verifyPassword(input: {
  password: string;
  passwordHash: string | null;
}): Promise<boolean> {
  if (!input.passwordHash) return false;
  return bcrypt.compare(input.password, input.passwordHash);
}

