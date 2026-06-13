const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

async function testFree() {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.*)/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1].trim().replace(/^["']|["']$/g, '') : "";
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const freeModels = [
        "gemini-flash-lite-latest",
        "gemini-flash-latest",
        "gemini-2.0-flash-lite",
        "gemini-3.1-flash-lite"
    ];
    
    for (const m of freeModels) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hello");
            console.log(`WORKING: ${m} - ${result.response.text()}`);
            break;
        } catch (e) {
            console.log(`FAILED: ${m} - ${e.message}`);
        }
    }
}

testFree();
