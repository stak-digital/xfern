import express from "express";
import { join } from "path";
import cors from "cors";
import { readdir } from "fs/promises";

const getMedia = async (): Promise<Array<string>> => {
  return readdir(join(process.cwd(), "media"));
};

export const boot = () => {
  const app = express();
  const port = 3001;

  app.use(cors());

  app.use("/media", express.static("media"));

  app.get("/media/query", async (req, res) => {
    const mediaFiles = (await getMedia()).map(
      (file) => `http://localhost:${port}/media/${file}`
    );
    res.json(mediaFiles);
  });

  app.listen(port, () => {
    console.log(`API Server listening at http://localhost:${port}`);
  });
};
