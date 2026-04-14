import { NextResponse } from 'next/server';
import { uploadImageToSupabaseS3 } from '@/lib/upload';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const kind = String(formData.get('kind') ?? '').trim();

    if (!(file instanceof File) || !kind) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 422 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Only image uploads are allowed' }, { status: 422 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: 'Max file size is 5MB' }, { status: 422 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 120);
    const timestamp = Date.now();
    const key = `merchant-onboarding/${timestamp}-${kind}-${safeName}`;
    const out = await uploadImageToSupabaseS3({ file, key });
    return NextResponse.json({ success: true, data: out }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: e instanceof Error ? e.message : 'Upload failed' }, { status: 500 });
  }
}

