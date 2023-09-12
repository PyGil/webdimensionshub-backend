export const getFileNameFromS3Url = (url: string): string => {
  const slugs = url.split('/');

  return slugs.at(-1);
};
