import dotenv from "dotenv";
import express from "express";

import middlewares from "./middlewares/middlewares.js";
import router from "./routes/routes.js";

dotenv.config();

const app = express();

await middlewares(app);
app.use(router);

const APP_PORT = process.env.APP_PORT || 3000;

app.listen(APP_PORT, () => {
  console.log(
    `Servidor ouvindo na ${APP_PORT}\nDocumentação Swagger: http://localhost:3000/docs`
  );
});
