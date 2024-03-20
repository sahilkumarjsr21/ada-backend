import { Result, CheckResult } from 'axe-core'
import { callAiAgent, AiResponse } from './aiAgent.js';
import { v4 as uuidv4 } from 'uuid';

type fixedData = Record<string, {css:string, aiResponse: AiResponse}>

const parseIssues = async (issues: Result[]): Promise<fixedData> => {
    const fixedIssues:fixedData = {}
    const parsePromises = issues.map((issue, i) => {
        if (i > 0) return;
        return parseNodes(issue, fixedIssues);
    })
    await Promise.all(parsePromises);
    return fixedIssues;

}

async function parseNodes(issue: Result, fixedIssues: fixedData): Promise<void> {
    let i = 0
    for(const node of issue.nodes) {
        var escapedHtmlPayload: string = node.failureSummary + "\n";
        var containsRelatedNodes: Boolean = false
        if (i > 1) {
            return;
        }
        if (node.any.length > 0) {
            for(const anyData of node.any) {
                if (anyData.relatedNodes !== undefined && anyData.relatedNodes.length > 0) {
                    containsRelatedNodes = true
                    createPartialPromptAndCallAi(anyData, escapedHtmlPayload, fixedIssues)
                }
            }
        }
        if (node.all.length > 0) {
            for(const allData of node.all) {
                if (allData.relatedNodes !== undefined && allData.relatedNodes.length > 0) {
                    containsRelatedNodes = true
                    createPartialPromptAndCallAi(allData, escapedHtmlPayload, fixedIssues)
                }
            }
        }
        if (node.none.length > 0) {
            for(const noneData of node.none) {
                if (noneData.relatedNodes !== undefined && noneData.relatedNodes.length > 0) {
                    containsRelatedNodes = true
                    createPartialPromptAndCallAi(noneData, escapedHtmlPayload, fixedIssues)
                }
            }
        }
        if (!containsRelatedNodes) {
            escapedHtmlPayload += node.html + "\n";
            const response: AiResponse = await callAiAgent(escapedHtmlPayload)
            fixedIssues[uuidv4()] = {
                css: node.target[node.target.length - 1] as string,
                aiResponse: response
            }
            console.log("Inside for loop " + JSON.stringify(fixedIssues))
        }
        i++
    }
}

async function createPartialPromptAndCallAi(issueNode: CheckResult, escapedHtmlPayload: string, fixedIssues: fixedData) {
    let i = 1
    for (const relatedNode of issueNode.relatedNodes || []) {
        if (i > 1) {
            return
        }
        escapedHtmlPayload += relatedNode.html
        const response: AiResponse = await callAiAgent(escapedHtmlPayload)
        fixedIssues[uuidv4()] = {
            css: relatedNode.target[relatedNode.target.length - 1] as string,
            aiResponse: response
        }
        i++
        console.log("Inside for loop 1" + JSON.stringify(fixedIssues))
    }
}

export { parseIssues, fixedData };