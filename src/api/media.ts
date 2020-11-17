import glob from "glob";
import { join } from "path";
import fetch from "node-fetch";
import { port } from "./constants";

const supportedMediaFormats = ["mp3", "wav", "aiff", "m4a"];

export const getMedia = async (): Promise<Array<string>> => {
  return new Promise((resolve, reject) => {
    glob(
      join(
        process.cwd(),
        "media",
        `**/**.*(${supportedMediaFormats.join("|")})`
      ),
      { dot: false },
      (err, matches) => {
        if (err) {
          reject(err);
          return;
        }

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
