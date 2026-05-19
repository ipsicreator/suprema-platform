// Suprema PocketBase Collections Setup – ordered for relational dependencies
const PB_URL = 'https://suprima-platform-pb.fly.dev';
const ADMIN_EMAIL = 'chrisklee69@gmail.com';
const ADMIN_PASSWORD = 'aussie1996@@';

// Define collections in creation order (parent before child)
const collections = [
  // 1️⃣ profiles – 기본 프로필 (students will reference this)
  {
    name: 'profiles',
    type: 'base',
    schema: [
      { name: 'user_id', type: 'text', required: true },
      { name: 'consultant_name', type: 'text', required: false },
      { name: 'student_name', type: 'text', required: false },
      { name: 'school_name', type: 'text', required: false },
      { name: 'grading_system', type: 'text', required: false },
      { name: 'gpa', type: 'number', required: false },
      { name: 'created_at', type: 'date', required: false }
    ]
  },
  // 2️⃣ students – profiles 를 참조
  {
    name: 'students',
    type: 'base',
    schema: [
      { name: 'profile', type: 'relation', options: { collectionId: 'profiles', maxSelect: 1 }, required: true },
      { name: 'student_key', type: 'text', required: false },
      { name: 'birth_year', type: 'number', required: false },
      { name: 'birth_month', type: 'number', required: false },
      { name: 'birth_day', type: 'number', required: false }
    ]
  },
  // 3️⃣ pdf_analyses – students 를 참조
  {
    name: 'pdf_analyses',
    type: 'base',
    schema: [
      { name: 'student', type: 'relation', options: { collectionId: 'students', maxSelect: 1 }, required: true },
      { name: 'input_hash', type: 'text', required: true, unique: true },
      { name: 'subjects', type: 'json', required: false, options: { maxSize: 2000000 } },
      { name: 'gpa', type: 'number', required: false },
      { name: 'created_at', type: 'date', required: false }
    ]
  },
  // 4️⃣ diagnosis_sessions – students & profiles 둘 다 참조
  {
    name: 'diagnosis_sessions',
    type: 'base',
    schema: [
      { name: 'student', type: 'relation', options: { collectionId: 'students', maxSelect: 1 }, required: true },
      { name: 'consultant', type: 'relation', options: { collectionId: 'profiles', maxSelect: 1 }, required: false },
      { name: 'grading_system', type: 'text', required: false },
      { name: 'grade_input', type: 'text', required: false },
      { name: 'grade_converted', type: 'text', required: false },
      { name: 'career_hint', type: 'text', required: false },
      { name: 'student_analysis', type: 'json', required: false, options: { maxSize: 5000000 } },
      { name: 'created_at', type: 'date', required: false }
    ]
  },
  // 5️⃣ setuk_history – students 를 참조
  {
    name: 'setuk_history',
    type: 'base',
    schema: [
      { name: 'student', type: 'relation', options: { collectionId: 'students', maxSelect: 1 }, required: true },
      { name: 'type', type: 'text', required: true },
      { name: 'content', type: 'text', required: false },
      { name: 'created_at', type: 'date', required: false }
    ]
  },
  // 6️⃣ exploration_results – students 를 참조
  {
    name: 'exploration_results',
    type: 'base',
    schema: [
      { name: 'student', type: 'relation', options: { collectionId: 'students', maxSelect: 1 }, required: true },
      { name: 'result_json', type: 'json', required: false, options: { maxSize: 3000000 } },
      { name: 'created_at', type: 'date', required: false }
    ]
  },
  // 7️⃣ prism_assessments – students 를 참조
  {
    name: 'prism_assessments',
    type: 'base',
    schema: [
      { name: 'student', type: 'relation', options: { collectionId: 'students', maxSelect: 1 }, required: true },
      { name: 'assessment_json', type: 'json', required: false, options: { maxSize: 3000000 } },
      { name: 'result_score', type: 'number', required: false },
      { name: 'created_at', type: 'date', required: false }
    ]
  },
  // 8️⃣ prism_leads – students 를 참조
  {
    name: 'prism_leads',
    type: 'base',
    schema: [
      { name: 'student', type: 'relation', options: { collectionId: 'students', maxSelect: 1 }, required: true },
      { name: 'parent_name', type: 'text', required: false },
      { name: 'phone', type: 'text', required: false },
      { name: 'question', type: 'text', required: false },
      { name: 'preferred_date', type: 'text', required: false },
      { name: 'status', type: 'text', required: false },
      { name: 'created_at', type: 'date', required: false }
    ]
  },
  // 9️⃣ licenses – 기본 auth 컬렉션(이미 존재하므로 재생성 안 함)
  {
    name: 'licenses',
    type: 'auth',
    schema: []
  }
];

async function createCollections() {
  console.log('🔐 Authenticating admin...');
  const authRes = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  if (!authRes.ok) {
    const txt = await authRes.text();
    console.error('❌ Admin authentication failed:', txt);
    process.exit(1);
  }
  const { token } = await authRes.json();
  console.log('✅ Auth succeeded.');

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  // Process collections sequentially to respect relation dependencies
  for (const col of collections) {
    console.log(`📦 Creating collection "${col.name}"...`);
    try {
      const res = await fetch(`${PB_URL}/api/collections`, {
        method: 'POST',
        headers,
        body: JSON.stringify(col)
      });
      if (res.ok) {
        console.log(`✅ ${col.name} created.`);
      } else if (res.status === 409) {
        console.warn(`⚠️ ${col.name} already exists – skipping.`);
      } else {
        const errTxt = await res.text();
        console.error(`❌ Failed to create ${col.name}:`, errTxt);
      }
    } catch (e) {
      console.error(`❌ Exception while creating ${col.name}:`, e);
    }
  }
  console.log('🎉 All collections processed.');
}

createCollections().catch(err => console.error('Fatal error:', err));
