/** ========================================================================= *\

 SERVER-SIDE PLUGIN EXAMPLE

 A simple plugin that is called from the xfern API. It listens to all events,
 and will do something on the `find-tracks` event.

 This plugin will filter out all tracks from the user's media library that
 are older than the year 2000.

 \* ========================================================================== */

import { parseFile } from "music-metadata";

/**
 * @param {string} eventName
 * @param {any} data
 * @return Array<string> - the track filenames
 */
const handleEvent = async (eventName, data) => {
  if (eventName === "find-tracks") {
    const { tracks } = data;
    const mediaObjects = await Promise.all(
      tracks.map(async (trackname) => {
        return {
          file: trackname,
          meta: await parseFile(trackname, {
            skipCovers: true,
            skipPostHeaders: true,
          }),
        };
      })
    );

    return mediaObjects
      .filter((mediaObject) => {
        const year = mediaObject?.meta?.common?.year;

        if (year) {
          return year >= 2000;
        } else {
          return false;
        }
      })
      .map((mediaObject) => mediaObject.file);
  }
};

export default {
  name: "New Tracks Only",
  handler: handleEvent,
  active: false,
};
