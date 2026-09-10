migrate((app) => {
  const notes = app.findCollectionByNameOrId("notes");
  if (!notes.fields.getByName("file_salt")) {
    notes.fields.add(new TextField({ name: "file_salt", max: 256 }));
  }
  app.save(notes);

  const events = new Collection({
    type: "base",
    name: "security_events",
    listRule: "@request.auth.id != '' && user = @request.auth.id",
    viewRule: "@request.auth.id != '' && user = @request.auth.id",
    createRule: "@request.auth.id != '' && @request.body.user = @request.auth.id",
    updateRule: null,
    deleteRule: "@request.auth.id != '' && user = @request.auth.id",
    fields: [
      { type: "relation", name: "user", required: true, maxSelect: 1, collectionId: app.findCollectionByNameOrId("ftn_users").id, cascadeDelete: true },
      { type: "text", name: "event", required: true, max: 80 },
      { type: "text", name: "status", required: true, max: 40 },
      { type: "text", name: "target", max: 200 },
      { type: "json", name: "details" },
    ],
    indexes: ["CREATE INDEX idx_security_events_user_created ON security_events (user, created DESC)"],
  });
  try { app.save(events); } catch (_) {}
}, (app) => {
  try { app.delete(app.findCollectionByNameOrId("security_events")); } catch (_) {}
  try {
    const notes = app.findCollectionByNameOrId("notes");
    notes.fields.removeByName("file_salt");
    app.save(notes);
  } catch (_) {}
});
