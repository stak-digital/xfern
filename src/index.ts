import { boot as bootUI } from "./ui";
import { boot as bootAPI } from "./api";

console.log("Welcome to xfern 🌿");

(async () => {
  console.log("Booting UI server - please wait...");
  bootUI();
  console.log("Booting API server - please wait...");
  bootAPI();
})();
