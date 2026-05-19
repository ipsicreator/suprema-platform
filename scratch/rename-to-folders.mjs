const PB_URL = 'https://suprima-platform-pb.fly.dev';
const ADMIN_EMAIL = 'chrisklee69@gmail.com';
const ADMIN_PASSWORD = 'aussie1996@@';

async function run() {
  console.log('🔐 Authenticating...');
  const authRes = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  if (!authRes.ok) { console.error('Auth failed:', await authRes.text()); process.exit(1); }
  const { token } = await authRes.json();
  console.log('✅ Auth OK');
  const h = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  async function getColId(name) {
    const r = await fetch(`${PB_URL}/api/collections/${name}`, { headers: h });
    if (!r.ok) return null;
    return (await r.json()).id;
  }

  async function deleteCol(name) {
    const r = await fetch(`${PB_URL}/api/collections/${name}`, { method: 'DELETE', headers: h });
    if (r.ok) console.log(`🗑️ Deleted "${name}"`);
    else if (r.status === 404) console.log(`⚠️ "${name}" not found`);
    else console.log(`⚠️ Cannot delete "${name}": ${await r.text()}`);
  }

  async function createCol(def) {
    console.log(`📦 Creating "${def.name}"...`);
    const r = await fetch(`${PB_URL}/api/collections`, { method: 'POST', headers: h, body: JSON.stringify(def) });
    if (r.ok) { const d = await r.json(); console.log(`✅ "${def.name}" (id: ${d.id})`); return d.id; }
    const t = await r.text();
    if (t.includes('name_exists')) { console.log(`⚠️ "${def.name}" already exists`); return await getColId(def.name); }
    console.error(`❌ "${def.name}":`, t); return null;
  }

  // ── Step 1: Delete old non-prefixed collections (children first, then parents) ──
  console.log('\n── Deleting old non-prefixed collections (children → parents) ──');
  const childrenToDelete = ['prism_leads', 'prism_assessments', 'exploration_results', 'setuk_history', 'diagnosis_sessions', 'pdf_analyses'];
  for (const name of childrenToDelete) { await deleteCol(name); }
  await deleteCol('students');
  // suprema_platform already has prefix → keep it

  // ── Step 2: Create new suprema_ prefixed collections in order ──
  console.log('\n── Creating suprema_ prefixed collections ──');

  // suprema_platform already exists
  const spId = await getColId('suprema_platform');
  console.log(`✅ suprema_platform exists (id: ${spId})`);

  // suprema_students
  const studentsId = await createCol({
    name: 'suprema_students', type: 'base',
    schema: [
      { name: 'profile', type: 'relation', options: { collectionId: spId, maxSelect: 1 }, required: true },
      { name: 'student_key', type: 'text', required: false },
      { name: 'birth_year', type: 'number', required: false },
      { name: 'birth_month', type: 'number', required: false },
      { name: 'birth_day', type: 'number', required: false }
    ]
  });

  // All children reference suprema_students
  await createCol({
    name: 'suprema_pdf_analyses', type: 'base',
    schema: [
      { name: 'student', type: 'relation', options: { collectionId: studentsId, maxSelect: 1 }, required: true },
      { name: 'input_hash', type: 'text', required: true },
      { name: 'subjects', type: 'json', required: false, options: { maxSize: 2000000 } },
      { name: 'gpa', type: 'number', required: false },
      { name: 'created_at', type: 'date', required: false }
    ]
  });

  await createCol({
    name: 'suprema_diagnosis_sessions', type: 'base',
    schema: [
      { name: 'student', type: 'relation', options: { collectionId: studentsId, maxSelect: 1 }, required: true },
      { name: 'consultant', type: 'relation', options: { collectionId: spId, maxSelect: 1 }, required: false },
      { name: 'grading_system', type: 'text', required: false },
      { name: 'grade_input', type: 'text', required: false },
      { name: 'grade_converted', type: 'text', required: false },
      { name: 'career_hint', type: 'text', required: false },
      { name: 'student_analysis', type: 'json', required: false, options: { maxSize: 5000000 } },
      { name: 'created_at', type: 'date', required: false }
    ]
  });

  await createCol({
    name: 'suprema_setuk_history', type: 'base',
    schema: [
      { name: 'student', type: 'relation', options: { collectionId: studentsId, maxSelect: 1 }, required: true },
      { name: 'type', type: 'text', required: true },
      { name: 'content', type: 'text', required: false },
      { name: 'created_at', type: 'date', required: false }
    ]
  });

  await createCol({
    name: 'suprema_exploration_results', type: 'base',
    schema: [
      { name: 'student', type: 'relation', options: { collectionId: studentsId, maxSelect: 1 }, required: true },
      { name: 'result_json', type: 'json', required: false, options: { maxSize: 3000000 } },
      { name: 'created_at', type: 'date', required: false }
    ]
  });

  await createCol({
    name: 'suprema_prism_assessments', type: 'base',
    schema: [
      { name: 'student', type: 'relation', options: { collectionId: studentsId, maxSelect: 1 }, required: true },
      { name: 'assessment_json', type: 'json', required: false, options: { maxSize: 3000000 } },
      { name: 'result_score', type: 'number', required: false },
      { name: 'created_at', type: 'date', required: false }
    ]
  });

  await createCol({
    name: 'suprema_prism_leads', type: 'base',
    schema: [
      { name: 'student', type: 'relation', options: { collectionId: studentsId, maxSelect: 1 }, required: true },
      { name: 'parent_name', type: 'text', required: false },
      { name: 'phone', type: 'text', required: false },
      { name: 'question', type: 'text', required: false },
      { name: 'preferred_date', type: 'text', required: false },
      { name: 'status', type: 'text', required: false },
      { name: 'created_at', type: 'date', required: false }
    ]
  });

  console.log('\n🎉 Done! Project-level folder structure complete.');
}

run().catch(e => console.error('Fatal:', e));
