/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);

  // 1. setuk_history 컬렉션 생성
  const setukHistory = new Collection({
    "name": "setuk_history",
    "type": "base",
    "schema": [
      { "name": "teacher_name", "type": "text" },
      { "name": "teacher_school", "type": "text" },
      { "name": "student_name", "type": "text" },
      { "name": "grade", "type": "text" },
      { "name": "subject", "type": "text" },
      { "name": "interests", "type": "json" },
      { "name": "career_hint", "type": "text" },
      { "name": "result_count", "type": "number" },
      { "name": "results", "type": "json" },
      { "name": "brand", "type": "text" }
    ],
    "listRule": "", "viewRule": "", "createRule": "", "updateRule": "", "deleteRule": ""
  });
  dao.saveCollection(setukHistory);

  // 2. diagnosis_sessions 컬렉션 생성
  const diagnosisSessions = new Collection({
    "name": "diagnosis_sessions",
    "type": "base",
    "schema": [
      { "name": "student_name", "type": "text" },
      { "name": "grade", "type": "text" },
      { "name": "student_index", "type": "number" },
      { "name": "school", "type": "text" },
      { "name": "consultant_name", "type": "text" }
    ],
    "listRule": "", "viewRule": "", "createRule": "", "updateRule": "", "deleteRule": ""
  });
  dao.saveCollection(diagnosisSessions);

  // 3. support_choices 컬렉션 생성
  const supportChoices = new Collection({
    "name": "support_choices",
    "type": "base",
    "schema": [
      { "name": "session_id", "type": "relation", "options": { "collectionId": diagnosisSessions.id, "maxSelect": 1, "cascadeDelete": true } },
      { "name": "support_no", "type": "number" },
      { "name": "university", "type": "text" },
      { "name": "department", "type": "text" },
      { "name": "admission_type", "type": "text" },
      { "name": "track_name", "type": "text" },
      { "name": "diag_level", "type": "text" },
      { "name": "diag_reason", "type": "text" }
    ],
    "listRule": "", "viewRule": "", "createRule": "", "updateRule": "", "deleteRule": ""
  });
  dao.saveCollection(supportChoices);

  return null;
}, (db) => {
  const dao = new Dao(db);
  
  const setukHistory = dao.findCollectionByNameOrId("setuk_history");
  if (setukHistory) dao.deleteCollection(setukHistory);
  
  const supportChoices = dao.findCollectionByNameOrId("support_choices");
  if (supportChoices) dao.deleteCollection(supportChoices);
  
  const diagnosisSessions = dao.findCollectionByNameOrId("diagnosis_sessions");
  if (diagnosisSessions) dao.deleteCollection(diagnosisSessions);

  return null;
})
