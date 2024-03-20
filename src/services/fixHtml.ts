import * as cheerio from 'cheerio'
import { fixedData } from './parseIssues.js'
import {formatLines, diffLines} from 'unidiff'


const loadHtml = (html:string) => {
    const $ = cheerio.load(html)
    return $
}

const replaceWith = (selector: string, html:string, $: cheerio.CheerioAPI) => {
    $(selector).replaceWith(html)
}

const createDiffFromHtml = (html: string, fixedIssues: fixedData): string => {
    const $:cheerio.CheerioAPI = loadHtml(html);
    Object.keys(fixedIssues).forEach(key => {
        const {css, aiResponse} = fixedIssues[key]
        if(aiResponse.fixedHtml !==undefined) {
            replaceWith(css, aiResponse.fixedHtml, $)
        }
    })
    const diff: string = formatLines(diffLines(html, $.html()), {context: 3})
    console.log(diff)
    return diff;
}

export {createDiffFromHtml};