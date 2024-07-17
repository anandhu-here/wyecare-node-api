import App from "./app";
import Logger from "./logger";
import functions from "firebase-functions";

import dotenv from "dotenv";

dotenv.config();

const main = () => {
  // Run the Server
  Logger.info("App :: Starting...");

  const app = new App();

  app._init();

  return app;
};

/**
 * Booting MainApp
 */
export const app = main();
