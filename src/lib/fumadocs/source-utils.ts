import type { VirtualFile } from 'fumadocs-core/source';

type SourceWithFiles = {
  files: VirtualFile[] | (() => VirtualFile[]);
};

export const normalizeSourceFiles = (source: SourceWithFiles): VirtualFile[] => {
  if (Array.isArray(source.files)) {
    return source.files;
  }

  if (typeof source.files === 'function') {
    return source.files();
  }

  return [];
};
