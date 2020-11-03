"use strict";

const $ = (s) => document.querySelector(s);

const domain = window.location.hostname;

const setTrack = (mediaUrl) => {
  $(".xf-player").setAttribute("src", `http://${domain}:3001${mediaUrl}`);
  const fileName = mediaUrl.replace(`/media/`, "");
  $(".xf-current-track-name").innerText = fileName;
};

fetch(`http://${domain}:3001/media/query`)
  .then((res) => res.json())
  .then((files) => {
    const select = $(".xf-track-select");
    const firstFile = files[0];

    setTrack(firstFile);

    files.forEach((file) => {
      const o = document.createElement("button");
      o.classList.add("xf-track-select-button");
      o.setAttribute("data-value", file);
      o.innerText = file;
      o.onclick = () => setTrack(file);
      select.appendChild(o);
    });
  });
