import express from "express";
import { join } from "path";
import getIP from '../utils/get-ip';
export const boot = () => {
  const app = express();
  const port = 3000;

  app.use("/public", express.static("src/ui/public"));

  app.get("/", (req, res) => {
    res.sendFile(join(process.cwd(), "src/ui/index.html"));
  });

  app.listen(port, () => {
    console.log(`UI Server listening at http://localhost:${port}`);
    const localWanIP = getIP();
    console.log(`UI Server accessible at ${localWanIP ? `http://${localWanIP}:3000` : 'Cannot determine IP'}`)
  });
};
