const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

async function testInternal() {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.*)/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1].trim().replace(/^["']|["']$/g, '') : "";
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Attempting internal preview models that might have different quota
    const targetModel = "gemini-1.5-flash"; // Standard but we try one more time with v1 path specifically
    
    try {
        const model = genAI.getGenerativeModel({ model: targetModel }, { apiVersion: "v1" });
        const result = await model.generateContent("test");
        console.log("SUCCESS");
    } catch (e) {
        console.log("FAILED: " + e.message);
    }
}

testInternal();
