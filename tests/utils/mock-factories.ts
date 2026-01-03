/**
 * Mock Factory Functions
 * 提供可重用、可配置的 mock 对象创建
 */

import { vi, type Mock } from 'vitest';

// Mock types for testing - avoiding dependency on @/types to prevent circular imports

// =============================================================================
// User & Auth Mocks
// =============================================================================

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'moderator';
  emailVerified: boolean | string | null;
  permissions?: string[];
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  banned: boolean;
  banReason?: string | null;
  banExpires?: Date | null;
}

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    emailVerified: true,
    permissions: ['read_posts'],
    image: null,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    banned: false,
    banReason: null,
    banExpires: null,
    ...overrides,
  };
}

export function createMockAdminUser(overrides: Partial<MockUser> = {}): MockUser {
  return createMockUser({
    role: 'admin',
    email: 'admin@example.com',
    name: 'Admin User',
    permissions: ['read_posts', 'write_posts', 'manage_users', 'manage_files'],
    ...overrides,
  });
}

// =============================================================================
// Auth Store Mocks
// =============================================================================

export interface MockAuthStore {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  user: MockUser | null;
  error: string | null;
  emailLogin: Mock;
  signInWithGithub: Mock;
  signInWithGoogle: Mock;
  logout: Mock;
  clearError: Mock;
  refreshSession: Mock;
  updateUser: Mock;
}

export function createMockAuthStore(overrides: Partial<MockAuthStore> = {}): MockAuthStore {
  return {
    isAuthenticated: false,
    isLoading: false,
    isInitialized: true,
    user: null,
    error: null,
    emailLogin: vi.fn(),
    signInWithGithub: vi.fn(),
    signInWithGoogle: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
    refreshSession: vi.fn(),
    updateUser: vi.fn(),
    ...overrides,
  };
}

// =============================================================================
// File System Mocks
// =============================================================================

export interface MockFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  r2Key: string;
  thumbnailKey?: string;
  uploadUserId: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  thumbnailUrl?: string;
}

export function createMockFile(overrides: Partial<MockFile> = {}): MockFile {
  const id = overrides.id || 'test-file-1';
  const filename = overrides.filename || 'test-image.jpg';
  
  return {
    id,
    filename,
    originalName: filename,
    mimeType: 'image/jpeg',
    size: 1024,
    width: 800,
    height: 600,
    r2Key: `images/${filename}`,
    thumbnailKey: `thumbnails/${filename}`,
    uploadUserId: 'test-user-id',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    url: `https://cdn.example.com/images/${filename}`,
    thumbnailUrl: `https://cdn.example.com/thumbnails/${filename}`,
    ...overrides,
  };
}

export function createMockFileList(count: number = 3): MockFile[] {
  return Array.from({ length: count }, (_, index) => 
    createMockFile({
      id: `test-file-${index + 1}`,
      filename: `test-image-${index + 1}.jpg`,
    })
  );
}

// =============================================================================
// Browser API Mocks
// =============================================================================

export interface MockLocation {
  pathname: string;
  search: string;
  hash: string;
  href: string;
  origin: string;
  reload: Mock;
  assign: Mock;
  replace: Mock;
}

export function createMockLocation(overrides: Partial<MockLocation> = {}): MockLocation {
  const pathname = overrides.pathname || '/';
  const origin = overrides.origin || 'http://localhost:3000';
  
  return {
    pathname,
    search: '',
    hash: '',
    href: `${origin}${pathname}`,
    origin,
    reload: vi.fn(),
    assign: vi.fn(),
    replace: vi.fn(),
    ...overrides,
  };
}

// =============================================================================
// Next.js Router Mocks
// =============================================================================

export interface MockRouter {
  push: Mock;
  replace: Mock;
  back: Mock;
  forward: Mock;
  refresh: Mock;
  prefetch: Mock;
  pathname?: string;
}

export function createMockRouter(overrides: Partial<MockRouter> = {}): MockRouter {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    pathname: '/',
    ...overrides,
  };
}

// =============================================================================
// SWR Mocks
// =============================================================================

export interface MockSWRResult<T = any> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  mutate: Mock;
}

export function createMockSWRResult<T>(overrides: Partial<MockSWRResult<T>> = {}): MockSWRResult<T> {
  return {
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides,
  };
}

export interface MockSWRMutationResult<T = any> {
  trigger: Mock;
  data: T | undefined;
  error: Error | undefined;
  isMutating: boolean;
  reset: Mock;
}

export function createMockSWRMutationResult<T>(overrides: Partial<MockSWRMutationResult<T>> = {}): MockSWRMutationResult<T> {
  return {
    trigger: vi.fn(),
    data: undefined,
    error: undefined,
    isMutating: false,
    reset: vi.fn(),
    ...overrides,
  };
}

// =============================================================================
// Toast Messages Mock
// =============================================================================

export interface MockToastMessages {
  success: {
    nameUpdated: Mock;
    avatarUpdated: Mock;
    loginSuccess: Mock;
  };
  error: {
    nameEmpty: Mock;
    nameUpdateFailed: Mock;
    avatarUpdateFailed: Mock;
    fileUploadFailed: Mock;
    loginFailed: Mock;
    socialLoginFailed: Mock;
  };
  info: {
    nameNotChanged: Mock;
  };
}

export function createMockToastMessages(): MockToastMessages {
  return {
    success: {
      nameUpdated: vi.fn(),
      avatarUpdated: vi.fn(),
      loginSuccess: vi.fn(),
    },
    error: {
      nameEmpty: vi.fn(),
      nameUpdateFailed: vi.fn(),
      avatarUpdateFailed: vi.fn(),
      fileUploadFailed: vi.fn(),
      loginFailed: vi.fn(),
      socialLoginFailed: vi.fn(),
    },
    info: {
      nameNotChanged: vi.fn(),
    },
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * 重置所有 mock 函数的调用历史
 */
export function resetAllMocks(...mocks: any[]): void {
  mocks.forEach(mock => {
    if (typeof mock === 'object' && mock !== null) {
      Object.values(mock).forEach(value => {
        if (vi.isMockFunction(value)) {
          value.mockReset();
        } else if (typeof value === 'object' && value !== null) {
          resetAllMocks(value);
        }
      });
    } else if (vi.isMockFunction(mock)) {
      mock.mockReset();
    }
  });
}

/**
 * 创建 File 对象的 mock
 */
export function createMockFileObject(
  name = 'test.jpg',
  type = 'image/jpeg',
  size = 1024
): File {
  const content = 'a'.repeat(size);
  return new File([content], name, { 
    type, 
    lastModified: Date.now() 
  });
} 
