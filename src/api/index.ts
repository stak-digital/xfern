import express from "express";
import { join } from "path";
import cors from "cors";
import glob from "glob";
import { parseFile } from "music-metadata";

const getMedia = async (): Promise<Array<string>> => {
  return new Promise((resolve, reject) => {
    glob(
      join(process.cwd(), "media", "**/**.*(mp3|wav|aiff)"),
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
  const port = 3001;
  let media = [];

  app.use(cors());

  app.use("/media/file", express.static("media"));

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
    const matches = media
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

  app.listen(port, () => {
    console.log(`API Server listening at http://localhost:${port}`);
  });
};
