import express from "express";
import { join } from "path";
import cors from "cors";
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

const makeFilePath = (file) => {
  return `/media/file/${file
    .replace(process.cwd(), "")
    .replace("/media/", "")}`;
};

export const boot = async () => {
  const app = express();
  const port = 3001;
  let media = [];

  app.use(cors());

  app.use("/media/file", express.static("media"));

  app.get("/media/all", async (req, res) => {
    const mediaFiles = media.map(makeFilePath);
    res.json(mediaFiles);
  });

  app.get("/media/search", async (req, res) => {
    const search = req.query.q as string;
    const matches = media
      .filter((file) => file.toLowerCase().includes(search.toLocaleLowerCase()))
      .map(makeFilePath);
    res.json(matches);
  });

  media = await getMedia();

  app.listen(port, () => {
    console.log(`API Server listening at http://localhost:${port}`);
  });
};
