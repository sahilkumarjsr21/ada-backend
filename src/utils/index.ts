const isUrl = (url:string):Boolean => /^https?:/.test(url)

const INSTRUCTION_PROMPT = `You are an expert in solving accessibility issues related to html based on axe report which is formated in human readable format.
Below are the instruction to solving the issue.`

const RESPONSE_PROMPT = `
Return the response in JSON format below are the following keys of the json
"fixedHtml" where html without accesibility issue is present
"explanation" where the explaination of the fix is given
"originalHtml" where the original Html is present.
Please give the response in the above format only and only fix the html given don't add new HTML`

export {
    isUrl,
    INSTRUCTION_PROMPT,
    RESPONSE_PROMPT
}