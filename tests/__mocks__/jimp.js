import { vi } from 'vitest';

// Mock for Jimp
const mockJimp = {
  read: vi.fn().mockResolvedValue({
    getWidth: vi.fn().mockReturnValue(300),
    getHeight: vi.fn().mockReturnValue(300),
    cover: vi.fn().mockReturnThis(),
    quality: vi.fn().mockReturnThis(),
    getBufferAsync: vi.fn().mockResolvedValue(Buffer.from('mock-image-data')),
  }),
  MIME_JPEG: 'image/jpeg',
  MIME_PNG: 'image/png',
};

// Mock the default export
const jimp = vi.fn().mockImplementation(() => mockJimp);
Object.assign(jimp, mockJimp);

export default jimp;
