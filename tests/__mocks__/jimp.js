import { vi } from 'vitest';

const mockImage = {
  width: 300,
  height: 300,
  cover: vi.fn().mockReturnThis(),
  getBuffer: vi.fn().mockResolvedValue(Buffer.from('mock-image-data')),
};

export const Jimp = Object.assign(vi.fn(() => mockImage), {
  read: vi.fn().mockResolvedValue(mockImage),
});

export const JimpMime = {
  jpeg: 'image/jpeg',
  png: 'image/png',
};
