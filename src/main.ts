import { BogEngine } from "./core/bog-engine";
import { Settings } from "./settings";

async function initializeApp(): Promise<void> {
  // Access viewport
  const viewportId = "viewport";
  const viewportElement = document.getElementById(viewportId);
  if (!(viewportElement instanceof HTMLDivElement)) {
    throw Error(`Could not find HTML div element with id:${viewportId}`);
  }

  // Initialise the app
  const engine = new BogEngine(Settings, viewportElement);
  engine.init();
}

initializeApp();
