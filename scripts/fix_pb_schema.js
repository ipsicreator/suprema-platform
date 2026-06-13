import PocketBase from "pocketbase";

async function run() {
  const pb = new PocketBase("https://suprima-platform-pb.fly.dev");
  
  // Try superusers first
  try {
    await pb.collection("_superusers").authWithPassword("chrisklee69@gmail.com", "aussie1996@@");
  } catch (e) {
    const res = await fetch("https://suprima-platform-pb.fly.dev/api/admins/auth-with-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: "chrisklee69@gmail.com", password: "aussie1996@@" })
    });
    const data = await res.json();
    pb.authStore.save(data.token, data.admin);
  }

  try {
    const col = await pb.collections.getOne("suprema_pdf_uploads");
    console.log("Existing collection:", col);
    
    // Force update the schema
    const updated = await pb.collections.update("suprema_pdf_uploads", {
      ...col,
      schema: [
        {
          name: "file",
          type: "file",
          required: false,
          options: { maxSelect: 1, maxSize: 50 * 1024 * 1024, mimeTypes: [] },
        },
        { name: "student_name", type: "text", required: false },
        { name: "school_name", type: "text", required: false },
      ],
      fields: [
        {
          name: "file",
          type: "file",
          required: false,
          options: { maxSelect: 1, maxSize: 50 * 1024 * 1024, mimeTypes: [] },
        },
        { name: "student_name", type: "text", required: false },
        { name: "school_name", type: "text", required: false },
      ]
    });
    console.log("Successfully updated collection!", updated);
  } catch (err) {
    console.error("Failed to update collection:", err);
  }
}

run();
