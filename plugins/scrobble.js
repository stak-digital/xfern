/** ========================================================================= *\

 LAST.FM SCROBBLER PLUGIN EXAMPLE

 A simple plugin that is called from the xfern API. It listens to all events,
 and will do something on the `start-track` event.

 See the API usage: https://www.last.fm/api/show/track.scrobble

\* ========================================================================== */

/**
 * @param {string} eventName
 * @param {any} data
 * @return Promise<any>
 */
const handleEvent = async (eventName, data) => {
  if (eventName === "start-track") {
    const lastFM_API_payload = {
      artist: data.track.meta.common.artist,
      title: data.track.meta.common.title,
      timestamp: Date.now(),
    };

    // lastFM_Client.scrobble(lastFM_API_payload);
  }
};

export default {
  name: "Last.fm Scrobbler Example",
  handler: handleEvent,
};
