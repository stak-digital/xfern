"use strict";

const $ = (s) => document.querySelector(s);

fetch("http://localhost:3001/media/query")
  .then((res) => res.json())
  .then((files) => {
    const firstFile = files[0];
    const fileName = firstFile.replace("http://localhost:3001/media/", "");

    $(".xf-player").setAttribute("src", firstFile);
    $(".xf-current-track-name").innerText = fileName;
  });
