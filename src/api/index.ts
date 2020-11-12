import express from "express";
import { join } from "path";
import cors from "cors";
import glob from "glob";
import { parseFile } from "music-metadata";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const port = 3001;

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

const getMedia = async (): Promise<Array<string>> => {
  return new Promise((resolve, reject) => {
    glob(
      join(process.cwd(), "media", "**/**.*(mp3|wav|aiff|m4a)"),
      { dot: false },
      (err, matches) => {
        if (err) {
          reject(err);
          return;
        }

        console.log(1);

        resolve(matches);
      }
    );
  }).then(
    /**
     * @param {Array<string>} matches
     */
    async (matches) => {
      /**
       * @type Array<Array>
       */
      let pluginResults;

      try {
        pluginResults = await fetch(`http://localhost:${port}/event`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "find-tracks",
            data: {
              tracks: matches,
            },
          }),
        }).then((r) => r.json());

        if (Array.isArray(pluginResults)) {
          matches = pluginResults.flat(Infinity).filter(Boolean);
        } else {
          throw new Error(
            "I was expecting a response of shape Array<TrackArray|null>"
          );
        }
      } catch (e) {
        console.log("failed to do plugins", e);
      }

      if (Array.isArray(matches)) {
        return matches;
      } else {
        return [];
      }
    }
  );
};

const parseMetaData = (filePath): Promise<any> => {
  return parseFile(filePath, {
    skipCovers: true,
    skipPostHeaders: true,
  });
  //     onError: ({ info }) => {
  //       // you cannot read tags on a WAV file so it throws with this error
  //       if (info === "No suitable tag reader found") {
  //         const fakeTags: TagType = {
  //           tags: {},
  //           type: "unknown",
  //         };
  //         resolve(fakeTags);
  //         return;
  //       }
  //
  //       reject(new Error(info));
  //     },
  //   });
};

const makeFilePath = (file) => {
  return `/media/file/${file
    .replace(process.cwd(), "")
    .replace("/media/", "")}`;
};

export const boot = async () => {
  const app = express();
  let media = [];

  app.use(cors());
  app.use(bodyParser({ extended: true }));

  app.use("/media/file", express.static("media"));

  app.post("/event", async (req, res) => {
    const { name, data } = req.body;
    res.json(
      await Promise.all(
        plugins
          .filter((plugin) => plugin.active !== false)
          .map((plugin) => plugin.handler(name, data))
      )
    );
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
    console.log({ foundMedia });
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

  media = await getMedia();
  media = await Promise.all(
    media.map(async (file) => {
      return {
        file,
        meta: await parseMetaData(file),
      };
    })
  );

  console.log("Loading plugins...");
  const plugins = await getPlugins();
  plugins.forEach(({ name }) => console.log(`Loaded plugin "${name}"`));

  app.listen(port, () => {
    console.log(`API Server listening at http://localhost:${port}`);
  });
};
