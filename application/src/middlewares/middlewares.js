import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { serve, setup } from "swagger-ui-express";

import swaggerFile from "../../docs/swagger-output.json" assert { type: "json" };
import swaggerAutogenInit from "./docs.js";

/**
 * Initializes middleware for the Express app.
 *
 * @param {Object} app - The Express app instance.
 * @return {void} This function does not return anything.
 */
export default async function (app) {
  app.use(bodyParser.json());
  app.use(cors());
  app.use(express.json());

  await swaggerAutogenInit();
  app.use("/docs", serve, setup(swaggerFile));
}
