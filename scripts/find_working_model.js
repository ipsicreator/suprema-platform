const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.*)/);
  const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : "";
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try to list models to see exactly what is available
  console.log("Checking available models...");
  try {
    // Note: listModels is not always available in all SDK versions, 
    // we'll try a direct generation with the most likely candidates
    const candidates = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-pro"];
    
    for (const modelName of candidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("test");
        if (result.response.text()) {
          console.log(`SUCCESS_MODEL: ${modelName}`);
          process.exit(0);
        }
      } catch (e) {
        console.log(`FAIL_MODEL: ${modelName} - ${e.message}`);
      }
    }
  } catch (err) {
    console.error("List failed", err);
  }
}

listModels();
