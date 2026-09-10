migrate((app) => {
  const users = app.findCollectionByNameOrId('ftn_users');
  const folders = new Collection({
    type: 'base', name: 'file_folders', listRule: '@request.auth.id != "" && user = @request.auth.id', viewRule: '@request.auth.id != "" && user = @request.auth.id', createRule: '@request.auth.id != "" && user = @request.auth.id', updateRule: '@request.auth.id != "" && user = @request.auth.id', deleteRule: '@request.auth.id != "" && user = @request.auth.id',
    fields: [new RelationField({name:'user',collectionId:users.id,required:true,maxSelect:1}), new TextField({name:'name',required:true,max:120}), new TextField({name:'parent',max:15}), new TextField({name:'path',required:true,max:500})]
  });
  app.save(folders);
  const events = app.findCollectionByNameOrId('security_events');
  if (events) { events.fields.add(new TextField({name:'category',max:60})); events.fields.add(new TextField({name:'action',max:120})); events.fields.add(new TextField({name:'metadata',max:4000})); app.save(events); }
}, (app) => { const c = app.findCollectionByNameOrId('file_folders'); if (c) app.delete(c); });
