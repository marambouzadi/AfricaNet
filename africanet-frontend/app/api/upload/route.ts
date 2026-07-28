import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier n\'a été fourni' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Directory path: public/images
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    await mkdir(imagesDir, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name) || '.png';
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(imagesDir, filename);

    // Save file
    await writeFile(filePath, buffer);

    const imageUrl = `/images/${filename}`;
    return NextResponse.json({ url: imageUrl, message: 'Image téléversée avec succès' });
  } catch (error: any) {
    console.error('Erreur lors du téléversement de l\'image:', error);
    return NextResponse.json({ error: 'Erreur lors du téléversement de l\'image' }, { status: 500 });
  }
}
