'use server';

import { PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { r2Client } from '../r2';

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN!;

export async function uploadMediaToR2Action(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'media';
    if (!file) throw new Error('File not found');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await r2Client.send(uploadCommand);
    const publicUrl = `${PUBLIC_DOMAIN.replace(/\/$/, '')}/${fileName}`;

    return { success: true, url: publicUrl, path: fileName };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function listR2MediaFilesAction(folder = 'media') {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `${folder}/`,
    });

    const response = await r2Client.send(command);
    const files = (response.Contents || [])
      .filter(item => item.Key !== `${folder}/`) // Exclude folder root itself
      .map(item => {
        const publicUrl = `${PUBLIC_DOMAIN.replace(/\/$/, '')}/${item.Key}`;
        return {
          name: item.Key?.split('/').pop() || '',
          key: item.Key || '',
          url: publicUrl,
          size: item.Size || 0,
          lastModified: item.LastModified || new Date(),
        };
      });

    return { success: true, files };
  } catch (e) {
    return { success: false, error: (e as Error).message, files: [] };
  }
}

export async function deleteMediaFromR2Action(path: string) {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path,
    });

    await r2Client.send(deleteCommand);
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
