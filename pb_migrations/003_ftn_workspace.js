migrate((app) => {
  const users = app.findCollectionByNameOrId('ftn_users');
  const folders = new Collection({
    type: 'base',
    name: 'file_folders',
    listRule: "@request.auth.id != '' && user = @request.auth.id",
    viewRule: "@request.auth.id != '' && user = @request.auth.id",
    createRule: "@request.auth.id != '' && @request.body.user = @request.auth.id",
    updateRule: "@request.auth.id != '' && user = @request.auth.id",
    deleteRule: "@request.auth.id != '' && user = @request.auth.id",
    fields: [
      { type: 'relation', name: 'user', required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true },
      { type: 'text', name: 'name', required: true, max: 120 },
      { type: 'text', name: 'parent', max: 15 },
      { type: 'text', name: 'path', required: true, max: 500 }
    ],
    indexes: ['CREATE INDEX idx_file_folders_user_path ON file_folders (user, path)']
  });
  app.save(folders);
  const events = app.findCollectionByNameOrId('security_events');
  if (events) {
    events.fields.add({ type: 'text', name: 'category', max: 60 });
    events.fields.add({ type: 'text', name: 'action', max: 120 });
    events.fields.add({ type: 'text', name: 'metadata', max: 4000 });
    app.save(events);
  }
}, (app) => { try { app.delete(app.findCollectionByNameOrId('file_folders')); } catch (_) {} });
