migrate((app) => {
  const users = new Collection({
    type: "auth",
    name: "ftn_users",
    listRule: "id = @request.auth.id",
    viewRule: "id = @request.auth.id",
    createRule: "",
    updateRule: "id = @request.auth.id",
    deleteRule: "id = @request.auth.id",
    fields: [
      { type: "text", name: "display_name", max: 120 },
      { type: "select", name: "role", values: ["user", "admin"], maxSelect: 1 },
    ],
    passwordAuth: { enabled: true, identityFields: ["email"] },
  });
  app.save(users);

  const notes = new Collection({
    type: "base",
    name: "notes",
    listRule: "@request.auth.id != '' && user = @request.auth.id",
    viewRule: "@request.auth.id != '' && user = @request.auth.id",
    createRule: "@request.auth.id != '' && @request.body.user = @request.auth.id",
    updateRule: "@request.auth.id != '' && user = @request.auth.id",
    deleteRule: "@request.auth.id != '' && user = @request.auth.id",
    fields: [
      { type: "relation", name: "user", required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true },
      { type: "text", name: "title_cipher", required: true, max: 20000 },
      { type: "text", name: "salt", required: true, max: 256 },
      { type: "text", name: "iv", required: true, max: 256 },
      { type: "file", name: "attachment", maxSelect: 1, maxSize: 10485760, protected: true },
      { type: "text", name: "mime", max: 160 },
      { type: "number", name: "size", min: 0, max: 104857600 },
    ],
    indexes: ["CREATE INDEX idx_notes_user_created ON notes (user, created DESC)"],
  });
  app.save(notes);

  const tasks = new Collection({
    type: "base",
    name: "ai_tasks",
    listRule: "@request.auth.id != '' && user = @request.auth.id",
    viewRule: "@request.auth.id != '' && user = @request.auth.id",
    createRule: "@request.auth.id != '' && @request.body.user = @request.auth.id",
    updateRule: "@request.auth.id != '' && user = @request.auth.id",
    deleteRule: "@request.auth.id != '' && user = @request.auth.id",
    fields: [
      { type: "relation", name: "user", required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true },
      { type: "text", name: "task", required: true, max: 10000 },
      { type: "text", name: "status", required: true, max: 40 },
      { type: "json", name: "result" },
    ],
    indexes: ["CREATE INDEX idx_ai_tasks_user_created ON ai_tasks (user, created DESC)"],
  });
  app.save(tasks);
}, (app) => {
  for (const name of ["ai_tasks", "notes", "ftn_users"]) {
    try { app.delete(app.findCollectionByNameOrId(name)); } catch (_) {}
  }
});
