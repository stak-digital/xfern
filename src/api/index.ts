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

  app.use(cors());
  app.use(bodyParser({ extended: true }));

  app.use("/media/file", express.static("media"));

  app.post("/event", async (req, res) => {
    const { name, data } = req.body;

    if (!name) {
      res.status(401).json({
        error: "Missing parameter name",
      });
      return;
    }

    if (!data) {
      res.status(401).json({
        error: "Missing parameter data",
      });
      return;
    }

    const pluginResultsPromises = plugins.map((plugin) => {
      return plugin.handler(name, data);
    });

    const pluginResults = await Promise.all(pluginResultsPromises);

    res.status(200).json(pluginResults);
  });

  app.get("/meta/version", async (req, res) => {
    const pkg = require("../../package.json");
    return res.status(200).send(pkg.version);
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
      .filter((mediaObject) => {
        if (!search) {
          return true;
        } else {
          return mediaObject.file
            .toLowerCase()
            .includes(search.toLocaleLowerCase());
        }
      })
      .map((mediaObject) => {
        return {
          ...mediaObject,
          file: makeFilePath(mediaObject.file),
        };
      });
    res.json(matches);
  });

  console.log("Loading plugins...");
  const plugins: Array<{
    name: string;
    handler: (eventName: string, data: any) => Promise<any>;
  }> = await getPlugins();
  plugins.forEach(({ name }) => console.log(`Loaded plugin "${name}"`));

  app.listen(port, () => {
    console.log(`API Server listening at http://localhost:${port}`);
  });
};
