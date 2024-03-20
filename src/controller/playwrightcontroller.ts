import { Request, Response } from "express"
import { startAdAProcess } from "../services/playwrightService.js";
export const playWrightController = {
    processSingleUrl: async (req: Request, res: Response) => {
        console.log(req.body)
        const processUrl:string = req.body.url;
        const rules: Array<string> = req.body.selectedRules ?? []
        const isEnableRule: boolean = req.body.isRuleEnabled ?? false
        console.log(processUrl)
        res.send(await startAdAProcess(processUrl, rules, isEnableRule));
    }
}