Ext.define('Rd.store.sNas', {
    extend: 'Ext.data.Store',
    model: 'Rd.model.mNas',
    //To make it load AJAXly from the server specify the follown 3 attributes
    buffered: true,
    leadingBufferZone: 150, 
    pageSize: 50,
    //To force server side sorting:
    remoteSort: true,
    proxy: {
            type    : 'ajax',
            format  : 'json',
            batchActions: true, 
            url     : '/cake2/rd_cake/nas/index.json',
            reader: {
                type: 'json',
                root: 'items',
                messageProperty: 'message',
                totalProperty: 'totalCount' //Required for dynamic paging
            },
            api: {
                destroy  : '/cake2/rd_cake/nas/delete.json'
            },
            simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
    },
  /*  listeners: {
        load: function(store, records, success, options) {
            var me = options.scope;
            Ext.each(records, function(record) {
               // this.addMarker(record.data);
                console.log(record.data);
            }, me)
        },
        scope: this
    }, */
    autoLoad: false
});
