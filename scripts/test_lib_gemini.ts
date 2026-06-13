import { model } from "../lib/ai/gemini";

async function test() {
    console.log("Testing model from lib/ai/gemini.ts...");
    try {
        const result = await model.generateContent("Hello");
        console.log("Response:", result.response.text());
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

test();
