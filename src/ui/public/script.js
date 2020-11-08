/// <reference path="../../../node_modules/vue/types/umd.d.ts" />

const $ = (s) => document.querySelector(s);
const domain = window.location.hostname;
const audio = $(".xf-player");

const LIBRARY_VIEWS = {
  TRACKS: "Tracks",
  ARTISTS: "Artists",
  ALBUMS: "Albums",
};

const EVENT_NAMES = {
  TRACK_START: "track-start",
};

window.zz = new Vue({
  el: ".xf-root",
  data: () => {
    const initialState = {
      media: [],
      currentTrack: null,
      playerState: "paused", // todo: can we just detect this on-demand instead of manually tracking?
      libraryView: LIBRARY_VIEWS.TRACKS,
      constants: {
        LIBRARY_VIEWS,
      },
    };

    try {
      let storedState = localStorage.getItem("view_state");
      if (storedState) {
        storedState = JSON.parse(storedState);
      }

      Object.assign(initialState, storedState);
    } catch (e) {
      console.error(e);
      // eh who cares
    }

    return initialState;
  },
  mounted() {
    fetch(`http://${domain}:3001/media/all`)
      .then((res) => res.json())
      .then((files) => {
        if (!this.currentTrack) {
          const firstFile = files[0];
          this.setTrack(firstFile);
        }
        this.setQueue(files);
      });

    // todo: add removeEventListener on unmount
    this.$refs.audio.addEventListener("play", this.handlePlayerStateChanged);
    this.$refs.audio.addEventListener("pause", this.handlePlayerStateChanged);

    // todo: there must be a better way to cache page state before page destroy
    setInterval((event) => {
      const { currentTrack, playerState, libraryView } = this.$data;
      localStorage.setItem(
        "view_state",
        JSON.stringify({ currentTrack, playerState, libraryView })
      );
    }, 5000);
  },
  methods: {
    sendEvent(eventName, meta) {
      fetch(`http://${domain}:3001/event`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: eventName,
          data: meta,
        }),
      });
    },
    handlePlayerStateChanged() {
      this.$data.playerState = this.$refs.audio.paused ? "paused" : "playing";
    },
    handlePlayPauseButtonPressed(e) {
      const { audio } = this.$refs;
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    },
    setTrack(mediaObject) {
      this.currentTrack = mediaObject;
      this.sendEvent(EVENT_NAMES.TRACK_START, { track: mediaObject });
    },
    handleTrackButtonPressed(track) {
      // audio crashes if not paused before change
      this.$refs.audio.pause();
      this.currentTrack = track;

      // have to wait till the src change propagates to the dom
      Vue.nextTick(() => {
        this.$refs.audio.play();
      });
    },
    getTrackName(file) {
      if (!file) {
        return "Unknown";
      }

      const { title, artist } = file.meta.common;
      const filename = file.file;

      if (title && artist) {
        return `${title} - ${artist}`;
      }

      if (title || artist) {
        return title || artist;
      }

      return filename.split("/").reverse()[0];
    },
    setQueue(files) {
      this.media = files;
    },
    async doSearch(q) {
      const results = await fetch(
        `http://${domain}:3001/media/search?q=${q}`
      ).then((res) => res.json());

      this.setQueue(results);
    },
    handSearchQueryChanged(e) {
      this.doSearch(e.target.value);
    },
  },
  computed: {
    trackSrc() {
      if (!this.currentTrack) {
        return "";
      }

      return `http://${domain}:3001${this.currentTrack.file}`;
    },
    trackName() {
      return this.getTrackName(this.currentTrack);
    },
    mediaByView() {
      if (this.$data.libraryView === LIBRARY_VIEWS.TRACKS) {
        return this.$data.media;
      }

      // todo: the others
    },
  },
});
