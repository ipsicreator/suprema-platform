const apiKey = process.env.GEMINI_API_KEY || "";

export const model = {
  async generateContent(parts: unknown[]) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("") || "";

    return {
      response: {
        text: () => text,
      },
    };
  },
};

/**
 * Extract table data from a PDF file buffer using Gemini Vision via REST.
 */
export async function extractTableFromPDF(pdfBuffer: Buffer, prompt: string) {
  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        data: pdfBuffer.toString("base64"),
        mimeType: "application/pdf",
      },
    },
  ]);

  return result.response.text();
}
