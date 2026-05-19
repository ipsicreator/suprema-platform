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

  // Helper: get collection ID by name
  async function getColId(name) {
    const r = await fetch(`${PB_URL}/api/collections/${name}`, { headers: h });
    if (!r.ok) return null;
    const d = await r.json();
    return d.id;
  }

  // Helper: create collection
  async function create(def) {
    console.log(`📦 Creating "${def.name}"...`);
    const r = await fetch(`${PB_URL}/api/collections`, { method: 'POST', headers: h, body: JSON.stringify(def) });
    if (r.ok) { const d = await r.json(); console.log(`✅ "${def.name}" created (id: ${d.id})`); return d.id; }
    const t = await r.text();
    if (t.includes('name_exists')) { console.log(`⚠️ "${def.name}" already exists`); return await getColId(def.name); }
    console.error(`❌ "${def.name}":`, t); return null;
  }

  // ① suprema_platform (already created, just get its ID)
  let spId = await getColId('suprema_platform');
  if (!spId) {
    spId = await create({
      name: 'suprema_platform', type: 'base',
      schema: [
        { name: 'user_id', type: 'text', required: true },
        { name: 'consultant_name', type: 'text', required: false },
        { name: 'student_name', type: 'text', required: false },
        { name: 'school_name', type: 'text', required: false },
        { name: 'grading_system', type: 'text', required: false },
        { name: 'gpa', type: 'number', required: false },
        { name: 'created_at', type: 'date', required: false }
      ]
    });
  } else {
    console.log(`✅ suprema_platform exists (id: ${spId})`);
  }

  // ② students → references suprema_platform by actual ID
  let studentsId = await getColId('students');
  if (!studentsId) {
    studentsId = await create({
      name: 'students', type: 'base',
      schema: [
        { name: 'profile', type: 'relation', options: { collectionId: spId, maxSelect: 1 }, required: true },
        { name: 'student_key', type: 'text', required: false },
        { name: 'birth_year', type: 'number', required: false },
        { name: 'birth_month', type: 'number', required: false },
        { name: 'birth_day', type: 'number', required: false }
      ]
    });
  } else {
    console.log(`✅ students exists (id: ${studentsId})`);
  }

  // ③~⑧ all reference students by actual ID
  const childCollections = [
    {
      name: 'pdf_analyses', type: 'base',
      schema: [
        { name: 'student', type: 'relation', options: { collectionId: studentsId, maxSelect: 1 }, required: true },
        { name: 'input_hash', type: 'text', required: true },
        { name: 'subjects', type: 'json', required: false, options: { maxSize: 2000000 } },
        { name: 'gpa', type: 'number', required: false },
        { name: 'created_at', type: 'date', required: false }
      ]
    },
    {
      name: 'diagnosis_sessions', type: 'base',
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
    },
    {
      name: 'setuk_history', type: 'base',
      schema: [
        { name: 'student', type: 'relation', options: { collectionId: studentsId, maxSelect: 1 }, required: true },
        { name: 'type', type: 'text', required: true },
        { name: 'content', type: 'text', required: false },
        { name: 'created_at', type: 'date', required: false }
      ]
    },
    {
      name: 'exploration_results', type: 'base',
      schema: [
        { name: 'student', type: 'relation', options: { collectionId: studentsId, maxSelect: 1 }, required: true },
        { name: 'result_json', type: 'json', required: false, options: { maxSize: 3000000 } },
        { name: 'created_at', type: 'date', required: false }
      ]
    },
    {
      name: 'prism_assessments', type: 'base',
      schema: [
        { name: 'student', type: 'relation', options: { collectionId: studentsId, maxSelect: 1 }, required: true },
        { name: 'assessment_json', type: 'json', required: false, options: { maxSize: 3000000 } },
        { name: 'result_score', type: 'number', required: false },
        { name: 'created_at', type: 'date', required: false }
      ]
    },
    {
      name: 'prism_leads', type: 'base',
      schema: [
        { name: 'student', type: 'relation', options: { collectionId: studentsId, maxSelect: 1 }, required: true },
        { name: 'parent_name', type: 'text', required: false },
        { name: 'phone', type: 'text', required: false },
        { name: 'question', type: 'text', required: false },
        { name: 'preferred_date', type: 'text', required: false },
        { name: 'status', type: 'text', required: false },
        { name: 'created_at', type: 'date', required: false }
      ]
    }
  ];

  for (const col of childCollections) {
    const existing = await getColId(col.name);
    if (existing) { console.log(`✅ ${col.name} exists (id: ${existing})`); continue; }
    await create(col);
  }

  console.log('🎉 ALL Suprema Platform collections are now live!');
}

run().catch(e => console.error('Fatal:', e));
