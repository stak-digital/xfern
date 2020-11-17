import express from "express";
import { join } from "path";
import cors from "cors";
import glob from "glob";
import { parseFile } from "music-metadata";
import bodyParser from "body-parser";
import { getMedia } from "./media";
import { port } from "./constants";
import { makeFilePath } from "./file";

const getPlugins = async () => {
  const pluginFiles: string[] = await new Promise((resolve, reject) => {
    glob(
      join(process.cwd(), "plugins", "*.js"),
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

  const modules = await Promise.all(
    pluginFiles.map((pluginFile) => import(pluginFile))
  );
  return modules.map((module) => module.default); // the default export should match the signature specified in the plugin Spec
};

const parseMetaData = (filePath): Promise<any> => {
  return parseFile(filePath, {
    skipCovers: true,
    skipPostHeaders: true,
  });
};

export const boot = async () => {
  const app = express();
  let media = [];

  app.use(cors());
  app.use(bodyParser({ extended: true }));

  app.use("/media/file", express.static("media"));

  app.post("/event", async (req, res) => {
    const { name, data } = req.body;
    plugins.forEach((plugin) => {
      plugin.handler(name, data);
    });
  });

  app.get("/media/all", async (req, res) => {
    const mediaFiles = media.map((mediaObject) => {
      return {
        ...mediaObject,
        file: makeFilePath(mediaObject.file),
      };
    });
    res.json(mediaFiles);
  });

  app.get("/media/search", async (req, res) => {
    const search = req.query.q as string;
    let foundMedia: any = await getMedia();
    foundMedia = await Promise.all(
      foundMedia.map(async (file) => {
        return {
          file,
          meta: await parseMetaData(file),
        };
      })
    );
    const matches = foundMedia
      .filter((mediaObject) =>
        mediaObject.file.toLowerCase().includes(search.toLocaleLowerCase())
      )
      .map((mediaObject) => {
        return {
          ...mediaObject,
          file: makeFilePath(mediaObject.file),
        };
      });
    res.json(matches);
  });

  console.log("Loading plugins...");
  const plugins = await getPlugins();
  plugins.forEach(({ name }) => console.log(`Loaded plugin "${name}"`));

  app.listen(port, () => {
    console.log(`API Server listening at http://localhost:${port}`);
  });
};
