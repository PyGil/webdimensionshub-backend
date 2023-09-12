export const getFileExtension = (fileName: string): string =>
  fileName.split('.').pop();
