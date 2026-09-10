migrate((app) => {
  const notes = app.findCollectionByNameOrId('notes');
  if (!notes) return;
  const add = (field) => { if (!notes.fields.getByName(field.name)) notes.fields.add(field); };
  add({ type: 'text', name: 'folder', max: 15 });
  add({ type: 'text', name: 'body_cipher', max: 500000 });
  add({ type: 'text', name: 'body_salt', max: 100 });
  add({ type: 'text', name: 'body_iv', max: 100 });
  add({ type: 'text', name: 'tags', max: 1000 });
  add({ type: 'bool', name: 'favorite' });
  add({ type: 'bool', name: 'archived' });
  notes.indexes.add('CREATE INDEX idx_notes_user_folder_created ON notes (user, folder, created)');
  app.save(notes);
}, (app) => {
  const notes = app.findCollectionByNameOrId('notes');
  if (!notes) return;
  for (const name of ['folder','body_cipher','body_salt','body_iv','tags','favorite','archived']) {
    try { notes.fields.removeByName(name); } catch (_) {}
  }
  try { notes.indexes.removeByName('idx_notes_user_folder_created'); } catch (_) {}
  app.save(notes);
});
