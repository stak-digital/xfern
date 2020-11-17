export const makeFilePath = (file) => {
  return `/media/file/${file
    .replace(process.cwd(), "")
    .replace("/media/", "")}`;
};
