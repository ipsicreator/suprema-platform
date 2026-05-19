import fs from "fs";
import path from "path";
import { extractTextFromPDFBuffer, calculateGPAFromText, extractJPEGsFromPDFBuffer, performOCRForPDFImages } from "../lib/pdf-parser";

async function run() {
  const pdfPath = path.resolve(process.cwd(), "public/빅현우_1학년학생부.pdf");
  
  if (!fs.existsSync(pdfPath)) {
    console.error(`Error: File not found at ${pdfPath}`);
    return;
  }
  
  console.log(`[TEST] Loading PDF: ${pdfPath}`);
  const buffer = fs.readFileSync(pdfPath);
  
  console.log(`[TEST] File Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
  
  // 1. Try regular text extraction
  console.log("[TEST] Step 1: Attempting regular text extraction...");
  const text = extractTextFromPDFBuffer(buffer);
  console.log(`[TEST] Extracted Text Length: ${text.length} characters`);
  
  let result = calculateGPAFromText(text, "5-level"); // Highschool 1st grade is 5-level
  console.log("[TEST] Regular GPA Result:", result);
  
  // 2. If it fails, attempt OCR
  if (!result.success) {
    console.log("\n[TEST] Step 2: Regular text failed or empty. Attempting OCR fallback...");
    const images = extractJPEGsFromPDFBuffer(buffer);
    console.log(`[TEST] Extracted JPEG images: ${images.length}`);
    
    if (images.length > 0) {
      console.log("[TEST] Running parallel OCR...");
      const ocrText = await performOCRForPDFImages(images);
      console.log(`[TEST] OCR Text Length: ${ocrText.length} characters`);
      
      console.log("[TEST] Writing OCR text to scratch/ocr_result.txt for inspection...");
      fs.writeFileSync(path.resolve(process.cwd(), "scratch/ocr_result.txt"), ocrText, "utf-8");
      
      result = calculateGPAFromText(ocrText, "5-level");
      console.log("[TEST] OCR GPA Result:", result);
    } else {
      console.log("[TEST] No JPEG images found in PDF!");
    }
  }
  
  console.log("\n[TEST] Completed!");
}

run().catch(console.error);
