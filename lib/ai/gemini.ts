import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

/**
 * Extract table data from a PDF file buffer using Gemini 1.5 Pro Vision.
 */
export async function extractTableFromPDF(pdfBuffer: Buffer, prompt: string) {
  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: pdfBuffer.toString("base64"),
        mimeType: "application/pdf",
      },
    },
  ]);

  return result.response.text();
}
