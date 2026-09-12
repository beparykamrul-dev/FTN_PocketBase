migrate((app) => {
  const users = app.findCollectionByNameOrId("ftn_users");
  const folders = new Collection({
    type: "base",
    name: "file_folders",
    listRule: "@request.auth.id != '' && user = @request.auth.id",
    viewRule: "@request.auth.id != '' && user = @request.auth.id",
    createRule: "@request.auth.id != '' && @request.body.user = @request.auth.id",
    updateRule: "@request.auth.id != '' && user = @request.auth.id",
    deleteRule: "@request.auth.id != '' && user = @request.auth.id",
  });
  folders.fields.add(new RelationField({ name: "user", required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true }));
  folders.fields.add(new TextField({ name: "name", required: true, max: 120 }));
  folders.fields.add(new TextField({ name: "parent", max: 15 }));
  folders.fields.add(new TextField({ name: "path", required: true, max: 500 }));
  folders.indexes = ["CREATE INDEX idx_file_folders_user_path ON file_folders (user, path)"];
  app.save(folders);

  const events = app.findCollectionByNameOrId("security_events");
  if (events) {
    if (!events.fields.getByName("category")) events.fields.add(new TextField({ name: "category", max: 60 }));
    if (!events.fields.getByName("action")) events.fields.add(new TextField({ name: "action", max: 120 }));
    if (!events.fields.getByName("metadata")) events.fields.add(new TextField({ name: "metadata", max: 4000 }));
    app.save(events);
  }
}, (app) => {
  try { app.delete(app.findCollectionByNameOrId("file_folders")); } catch (_) {}
});
