const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

async function listAll() {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.*)/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1].trim().replace(/^["']|["']$/g, '') : "";
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using a dummy call to see if we can get a list or hint
    console.log("Listing models via SDK...");
    try {
        // The SDK doesn't have a direct listModels yet in some versions, 
        // but we can try common names.
        const testModels = [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-1.0-pro",
            "gemini-pro",
            "gemini-pro-vision"
        ];
        
        for (const m of testModels) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                await model.generateContent("test");
                console.log(`WORKING: ${m}`);
            } catch (e) {
                console.log(`FAILED: ${m} - ${e.message}`);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

listAll();
