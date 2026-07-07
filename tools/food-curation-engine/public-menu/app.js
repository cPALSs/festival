import { mountMenuViewer } from "../menu-viewer.js";

const MENU_URL = new URL("../../data/food-menu.json", import.meta.url);

async function init() {
  const res = await fetch(MENU_URL);
  const menu = await res.json();
  mountMenuViewer(document.getElementById("content"), menu);
}

init();
