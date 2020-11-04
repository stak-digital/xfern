"use strict";

const $ = (s) => document.querySelector(s);

const domain = window.location.hostname;
const audio = $(".xf-player");

const setTrack = (mediaUrl) => {
  $(".xf-player").setAttribute("src", `http://${domain}:3001${mediaUrl}`);
  const fileName = mediaUrl.replace(`/media/`, "");
  $(".xf-current-track-name").innerText = fileName;
};

const doSearch = async (q) => {
  const results = await fetch(
    `http://${domain}:3001/media/search?q=${q}`
  ).then((res) => res.json());

  setQueue(results);
};

const setQueue = (files) => {
  /**
   * @type {HTMLElement}
   */
  const select = $(".xf-track-select");

  [...select.children].forEach((n) => n.remove());

  files.forEach((file) => {
    const o = document.createElement("button");
    o.classList.add("xf-track-select-button");
    o.setAttribute("data-value", file);
    o.innerText = file;
    o.onclick = () => setTrack(file);
    console.log("adding", file);
    select.appendChild(o);
  });
};

fetch(`http://${domain}:3001/media/all`)
  .then((res) => res.json())
  .then((files) => {
    const firstFile = files[0];
    setTrack(firstFile);
    setQueue(files);
  });

$(".xf-search-box").addEventListener("input", (e) => doSearch(e.target.value));

audio.addEventListener("pause", (e) => {
  $(".xf-play-or-pause").dataset.state = "paused";
});

audio.addEventListener("play", (e) => {
  $(".xf-play-or-pause").dataset.state = "playing";
});

$(".xf-play-or-pause").addEventListener("click", (e) => {
  /**
   * @type {HTMLAudioElement}
   */
  const { dataset } = e.target;

  if (dataset.state === "playing") {
    audio.pause();
  } else {
    audio.play();
  }
});
