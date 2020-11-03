import express from "express";
import { join } from "path";
import cors from "cors";
import { readdir } from "fs/promises";
import glob from "glob";

const getMedia = async (): Promise<Array<string>> => {
  return new Promise((resolve, reject) => {
    glob(
      join(process.cwd(), "media", "**/**.*(mp3|wav)"),
      { dot: false },
      (err, matches) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(matches);
      }
    );
  });
};

export const boot = () => {
  const app = express();
  const port = 3001;

  app.use(cors());

  app.use("/media", express.static("media"));

  app.get("/media/query", async (req, res) => {
    const results = await getMedia();
    const mediaFiles = results.map(
      (file) =>
        `/media/${file.replace(process.cwd(), "").replace("/media/", "")}`
    );
    res.json(mediaFiles);
  });

  app.listen(port, () => {
    console.log(`API Server listening at http://localhost:${port}`);
  });
};
