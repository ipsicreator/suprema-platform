/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);

  // 1. pdf_analyses 컬렉션 보강 (일관성 및 누적 로직용)
  const analysisCollection = dao.findCollectionByNameOrId("pdf_analyses");
  analysisCollection.schema.addField(new SchemaField({
    "name": "input_hash",
    "type": "text",
    "required": true,
    "unique": true,
  }));
  analysisCollection.schema.addField(new SchemaField({
    "name": "analysis_type",
    "type": "text",
    "required": true,
  }));
  analysisCollection.schema.addField(new SchemaField({
    "name": "student_name",
    "type": "text",
    "required": false,
  }));
  dao.saveCollection(analysisCollection);

  // 2. profiles 컬렉션 보강 (인증 및 역할 표준화용)
  const profileCollection = dao.findCollectionByNameOrId("profiles");
  profileCollection.schema.addField(new SchemaField({
    "name": "user",
    "type": "relation",
    "required": true,
    "unique": true,
    "options": {
      "collectionId": "_pb_users_auth_",
      "cascadeDelete": true,
      "maxSelect": 1
    }
  }));
  dao.saveCollection(profileCollection);

  // 3. licenses 컬렉션 표준화 (active 필드 고정)
  try {
    const licenseCollection = dao.findCollectionByNameOrId("licenses");
    licenseCollection.schema.addField(new SchemaField({
      "name": "active",
      "type": "bool",
      "required": false,
    }));
    dao.saveCollection(licenseCollection);
  } catch (e) {
    // 컬렉션이 아직 없을 경우 무시 (추후 생성 마이그레이션에서 처리)
  }

  return null;
}, (db) => {
  return null;
})
