import { INSTRUCTION_PROMPT, RESPONSE_PROMPT } from "../utils/index.js"
import Replicate, { Prediction } from "replicate";
import fetch from "cross-fetch";

interface AiResponse {
    fixedHtml?: string
    explanation?: string
    originalHtml?: string
    extras?: string
}


const callAiAgent = async (issuePayload: string) => {
    const prompt = INSTRUCTION_PROMPT + issuePayload + "\n" + RESPONSE_PROMPT;
    console.log("**********PROMPT_START***********")
    console.log(prompt)
    console.log("**********PROMPT_END***********")

    const replicate = new Replicate({
        auth: "r8_Nc4VwWeN2XYpIfi41IA54hHpQOiRS4W0geqLo",
        fetch: fetch
    });
    const input = {
        top_k: 50,
        top_p: 0.9,
        prompt: `${prompt}`,
        temperature: 0.6,
        max_new_tokens: 1024,
        prompt_template: `<s>[INST] {prompt} [/INST] `,
        presence_penalty: 0,
        frequency_penalty: 0
    }
    const predictions:Prediction  = await replicate.predictions.create({
        model: "mistralai/mixtral-8x7b-instruct-v0.1",  input })
    console.log(await replicate.wait(predictions));

    const response:AiResponse = parsePrediction(await replicate.wait(predictions))
    console.log("Parsed Ai Response " + JSON.stringify(response));
    return response;
}

const parsePrediction = (data:Prediction) => {
    const output:string = data.output.join("")
    const traceId = crypto.randomUUID()
    let response:AiResponse = {
    };
    try {
         response = JSON.parse(output.substring(output.indexOf('{'), output.lastIndexOf('}') + 1))
         response.extras = output.substring(0, output.lastIndexOf("{")) + "\n" +output.substring(output.lastIndexOf("}")+1);
        if(response.fixedHtml!==undefined)
            response.fixedHtml = response.fixedHtml?.replace(`\"`, `"`)
        if(response.originalHtml!==undefined)
            response.originalHtml = response.originalHtml?.replace(`\"`, `"`)
    } catch(err){
        console.log(err);
        return response;
    }
    return response;
}
export {callAiAgent, AiResponse};