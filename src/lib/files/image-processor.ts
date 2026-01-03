/**
 * Cross-platform image processor
 * Uses Jimp instead of sharp, supports Vercel Serverless Functions, Edge Functions and Cloudflare Workers
 */

import { Jimp, JimpMime } from 'jimp';
import { appConfig } from '@/config/app.config';

export interface ImageMetadata {
  width: number;
  height: number;
}

/**
 * Decode image
 */
type JimpReadResult = Awaited<ReturnType<typeof Jimp.read>>;

async function decodeImage(buffer: Buffer): Promise<JimpReadResult> {
  try {
    return await Jimp.read(buffer);
  } catch (error) {
    throw new Error(
      `Failed to decode image: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate thumbnail
 * Equivalent to sharp(buffer).resize(300, 300, { fit: 'cover', position: 'center' }).jpeg({ quality: 80 }).toBuffer()
 */
export async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  try {
    // Decode original image
    const image = await decodeImage(buffer);

    // Resize - use cover mode (maintain aspect ratio, crop excess)
    const resizedImage = image.cover({ w: 300, h: 300 });

    // Set JPEG quality and convert to Buffer
    const thumbnailBuffer = await resizedImage.getBuffer(JimpMime.jpeg, { quality: 80 });

    return thumbnailBuffer;
  } catch (error) {
    throw new Error(
      `Failed to generate thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get image metadata
 * Equivalent to sharp(buffer).metadata()
 */
export async function getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
  try {
    // Decode image to get dimension information
    const image = await decodeImage(buffer);

    return {
      width: image.width,
      height: image.height,
    };
  } catch (error) {
    throw new Error(
      `Failed to get image metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Use configuration from appConfig
  const { allowedTypes, maxFileSize } = appConfig.upload;

  if (!allowedTypes.includes(file.type)) {
    const supportedFormats = allowedTypes
      .map((type) => type.replace('image/', '').toUpperCase())
      .join(', ');
    return { valid: false, error: `Only ${supportedFormats} image formats are supported` };
  }

  if (file.size > maxFileSize) {
    const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
    return { valid: false, error: `File size cannot exceed ${maxSizeMB}MB` };
  }

  return { valid: true };
}

export type RuntimePlatform = 'node' | 'vercel-serverless' | 'unknown';

export function detectPlatform(): RuntimePlatform {
  if (typeof process !== 'undefined' && process.versions?.node) {
    if (process.env?.VERCEL) {
      return 'vercel-serverless';
    }

    return 'node';
  }

  return 'unknown';
}
