import express, { Express, RequestHandler, json, urlencoded }from 'express';
import dotenv from 'dotenv';
import { join } from 'path';
import { corsMiddleware, notFoundMiddleware } from './middlewares/index.js'
import {router} from './router/index.js';
dotenv.config();

const app:Express = express();


app.use(
    json({ limit: '10mb' }),
    urlencoded({ limit: '10mb', extended: true }),
    corsMiddleware,
    router,
    notFoundMiddleware
  )

app.listen(process.env.APP_PORT, () => {
    console.log("App started at port" + process.env.APP_PORT)
})