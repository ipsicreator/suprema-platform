import { pbAdmin } from "../lib/pocketbaseAdmin";
import { config } from "dotenv";
config({ path: ".env.local" }); // Load env vars

async function check() {
  try {
    const pb = await pbAdmin();
    const col = await pb.collections.getOne("suprema_pdf_uploads");
    console.log("Collection Schema/Fields:");
    console.log(JSON.stringify(col.fields || col.schema, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}
check();
