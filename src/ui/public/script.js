/// <reference path="../../../node_modules/vue/types/umd.d.ts" />

const $ = (s) => document.querySelector(s);
const domain = window.location.hostname;
const audio = $(".xf-player");

new Vue({
  el: ".xf-root",
  data: {
    media: [],
    currentTrack: null,
  },
  mounted() {
    fetch(`http://${domain}:3001/media/all`)
      .then((res) => res.json())
      .then((files) => {
        const firstFile = files[0];
        this.setTrack(firstFile);
        this.setQueue(files);
      });
  },
  methods: {
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
    playerState() {
      if (!this.$refs.audio) {
        return "beh";
      }

      return this.$refs.audio.paused ? "paused" : "playing";
    },
    trackSrc() {
      if (!this.currentTrack) {
        return "";
      }

      return `http://${domain}:3001${this.currentTrack.file}`;
    },
    trackName() {
      return this.getTrackName(this.currentTrack);
    },
  },
});

// audio.addEventListener("pause", (e) => {
//   $(".xf-play-or-pause").dataset.state = "paused";
// });
//
// audio.addEventListener("play", (e) => {
//   $(".xf-play-or-pause").dataset.state = "playing";
// });
//
// $(".xf-play-or-pause").addEventListener("click", (e) => {
//   /**
//    * @type {HTMLAudioElement}
//    */
//   const { dataset } = e.target;
//
//   if (dataset.state === "playing") {
//     audio.pause();
//   } else {
//     audio.play();
//   }
// });
