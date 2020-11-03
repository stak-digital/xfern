import { readdir } from "fs/promises";
import { join } from "path";
import { boot } from "./ui";

console.log("Welcome to xfern 🌿");

const getMedia = async (): Promise<Array<string>> => {
  const result = await readdir(join(process.cwd(), "media"));
  return result.map((filename) => join(process.cwd(), "media", filename));
};

(async () => {
  console.log("Reading /media/* for files...");
  const mediaFiles = await getMedia();
  console.log(`Found ${mediaFiles.length} media files:`);
  console.log(JSON.stringify(mediaFiles, null, 2));
  console.log("Booting ui - please wait...");
  boot();
})();
