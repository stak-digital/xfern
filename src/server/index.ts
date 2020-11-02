import express from "express";
import { join } from "path";
export const boot = () => {
  const app = express();
  const port = 3000;

  app.use("/media", express.static("media"));

  app.get("/", (req, res) => {
    res.sendFile(join(process.cwd(), "src", "server", "index.html"));
  });

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
};
