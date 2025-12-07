import { BogEngine } from "./core/bog-engine";

async function initializeApp() {
  const engine = new BogEngine();
  await engine.init();
}

initializeApp();
