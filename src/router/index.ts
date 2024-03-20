import { Router } from "express";
import { playWrightRoute } from "./playwrightroute.js";
const routes: {
   [key:string] : (router: Router) => void
} = {playWrightRoute}

const router: Router = Router();
routes["playWrightRoute"](router); 

export {router};