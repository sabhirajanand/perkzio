export const MAX_REGISTRATION_IMAGE_BYTES = 5 * 1024 * 1024;

export function isRegistrationImageOverLimit(file: File): boolean {
  return file.size > MAX_REGISTRATION_IMAGE_BYTES;
}
