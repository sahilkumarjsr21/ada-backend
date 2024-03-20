import { chromium, devices, Browser } from 'playwright';
import { isUrl } from '../utils/index.js';
import AxeBuilder from '@axe-core/playwright';
import fs, { PathLike } from 'node:fs'
import fsAsync from 'node:fs/promises'
import { fixedData, parseIssues } from './parseIssues.js';
import { createDiffFromHtml } from './fixHtml.js';
import axe from 'axe-core';

export type AxeData = {
    id: string
    impact: string
    tags: string[];
    description: string;
    help: string;
    helpUrl: string;
    nodes: Node[];
}
export interface Node {
    any: IssueNode[]
    all: IssueNode[]
    none: IssueNode[]
    impact: string
    html: string
    target: string[]
    failureSummary: string
  }
  
  export interface IssueNode {
    id: string
    data?: Data
    relatedNodes: RelatedNode[]
    impact: string
    message: string
  }
  
  export interface RelatedNode {
    html: string
    target: string[]
  }
  
  
  export interface Data {
    values: string
  }

  export interface AdaFixResponse{
    comments: Array<string>
    diff: string
    originalHtml: string
  }

const startAdAProcess = async (url:string, rules:Array<string>, isEnableRule: boolean): Promise<AdaFixResponse> => {
    if(isUrl(url)) {
        const {violations, html} = await getViolations(url, rules, isEnableRule);
        if(violations.length == 0) {
            return {diff:'', comments: [], originalHtml: "No Issues Found"};
        }
        const fixedIssues: fixedData = await parseIssues(violations);
        const diff = createDiffFromHtml(html, fixedIssues);
        const comments = Object.keys(fixedIssues).map((fixedIssuesKey) => {
            const {aiResponse} = fixedIssues[fixedIssuesKey];
            return aiResponse.explanation + "\n" + aiResponse.extras
        })
        console.log(comments);
        return {diff, comments, originalHtml: html};
    }
    
    return Promise.resolve( {diff: "", comments: [], originalHtml:""})
}

const getViolations = async (url:string, rules:Array<string>, isEnableRule: boolean) =>{
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // The actual interesting bit
    await page.goto(url);
    const html = await page.content();
    writeOriginalHtmlToDisk(url, html);
    fs.writeFileSync('./data.json', JSON.stringify(axe.getRules()))
   
    const axeBuilder:AxeBuilder = new AxeBuilder({page})
    if(rules.length != 0) {
        console.log(rules);
        if(isEnableRule) {
            axeBuilder.withRules(rules)
         }
         else {
            axeBuilder.disableRules(rules)
         }
    }
    const axeResults = await axeBuilder.analyze()
    const { violations }  = axeResults 
    console.log(violations.length)
    // console.log(JSON.stringify(violations,undefined,2))
    return {violations, html};


}
async function writeOriginalHtmlToDisk(urlPath:string, html:string) {
    const {domain, dirPath} = getDomainAndDirPath(urlPath);
    if(domain!==undefined && dirPath!== undefined) {
        return;
    }
    if(!fs.existsSync(dirPath as PathLike))
        fs.mkdirSync(dirPath as PathLike, { recursive: true });

    fs.writeFileSync(`./${domain}${urlPath}.html`, html);
}

const getDomainAndDirPath = (urlPath: string): {domain?: string, dirPath?: string} => {
    const matches:RegExpMatchArray|null = urlPath.match(/^.*\/\/[^\/]+/);
    if(matches == null || matches.length == 0) {
        return {domain: undefined, dirPath: undefined} ;
    }
    const domain: string = urlPath.includes("https") || urlPath.includes("http") ? `htmls/${matches[0].substring(matches[0].lastIndexOf("/")+1)}` : 'htmls';
    console.log(domain);
    const dirPath = `./${domain}${urlPath.substring(0, urlPath.lastIndexOf('/'))}`;
    return {domain, dirPath}
}

export {startAdAProcess};