/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);

  // exploration_results 컬렉션 생성
  const collection = new Collection({
    "name": "exploration_results",
    "type": "base",
    "schema": [
      {
        "name": "user_id",
        "type": "relation",
        "required": true,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": true,
          "maxSelect": 1
        }
      },
      {
        "name": "subject",
        "type": "text",
        "required": true
      },
      {
        "name": "topic_title",
        "type": "text",
        "required": true
      },
      {
        "name": "topic_direction",
        "type": "text",
        "required": false
      },
      {
        "name": "books",
        "type": "json",
        "required": false
      },
      {
        "name": "papers",
        "type": "json",
        "required": false
      },
      {
        "name": "data_sources",
        "type": "json",
        "required": false
      },
      {
        "name": "expected_conclusion",
        "type": "text",
        "required": false
      },
      {
        "name": "setuk_sentence",
        "type": "text",
        "required": false
      },
      {
        "name": "is_edited",
        "type": "bool",
        "required": false
      }
    ],
    "listRule": "@request.auth.id = user_id",
    "viewRule": "@request.auth.id = user_id",
    "createRule": "@request.auth.id != ''",
    "updateRule": "@request.auth.id = user_id",
    "deleteRule": "@request.auth.id = user_id",
  });

  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("exploration_results");
  return dao.deleteCollection(collection);
})
