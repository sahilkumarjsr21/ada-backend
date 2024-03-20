import {Router} from 'express';
import { playWrightController } from '../controller/index.js';
export const playWrightRoute = async (router: Router): Promise<void> => {
    router.post("/getDiff", playWrightController.processSingleUrl);
}

