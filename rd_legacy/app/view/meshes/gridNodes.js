Ext.define('Rd.view.meshes.gridNodes' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridNodes',
    multiSelect: true,
    stateful: true,
    stateId: 'StateGridNodes',
    stateEvents:['groupclick','columnhide'],
    border: false,
    requires: [
        'Rd.view.components.ajaxToolbar'
    ],
    viewConfig: {
        loadMask:true
    },
    urlMenu: '/cake2/rd_cake/meshes/menu_for_nodes_grid.json',
    bbar: [
        {   xtype: 'component', itemId: 'count',   tpl: i18n('sResult_count_{count}'),   style: 'margin-right:5px', cls: 'lblYfi' }
    ],
    initComponent: function(){
        var me      = this;

        me.store    = Ext.create(Rd.store.sNodes,{
            listeners: {
                load: function(store, records, successful) {
                    if(!successful){
                        Ext.ux.Toaster.msg(
                            'Error encountered',
                            store.getProxy().getReader().rawData.message.message,
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                        //console.log(store.getProxy().getReader().rawData.message.message);
                    }else{
                        var count   = me.getStore().getTotalCount();
                        me.down('#count').update({count: count});
                    }   
                },
                update: function(store, records, success, options) {
                    store.sync({
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sUpdated_item'),
                                i18n('sItem_has_been_updated'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );   
                        },
                        failure: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_updating_the_item'),
                                i18n('sItem_could_not_be_updated'),
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                        }
                    });
                },
                scope: this
            },
            autoLoad: false 
        });
        me.store.getProxy().setExtraParam('mesh_id',me.meshId);
        me.store.load();

        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        me.columns  = [
            {xtype: 'rownumberer'},
            { text: 'Name',                     dataIndex: 'name',           tdCls: 'gridTree', flex: 1},
            { text: 'Description',              dataIndex: 'description',    tdCls: 'gridTree', flex: 1},
            { text: 'MAC Address',              dataIndex: 'mac',            tdCls: 'gridTree', flex: 1},
            { text: 'Hardware',                 dataIndex: 'hardware',       tdCls: 'gridTree', flex: 1},
            { text: 'Power',                    dataIndex: 'power',          tdCls: 'gridTree', flex: 1},
            { text: 'IP Address',               dataIndex: 'ip',             tdCls: 'gridTree', flex: 1},
            { 
                text    :   'Static entries',
                sortable: false,
                flex    : 1,  
                xtype   :  'templatecolumn', 
                tpl:    new Ext.XTemplate(
                            '<tpl if="Ext.isEmpty(static_entries)"><div class=\"gridRealm noRight\">None</div></tpl>', 
                            '<tpl for="static_entries">',     
                                "<tpl><div class=\"gridRealm hasRight\">{name}</div></tpl>",
                            '</tpl>'
                        ),
                dataIndex: 'static_entries'
            }, 
            { 
                text    :   'Static exits',
                sortable: false,
                flex    : 1,  
                xtype   :  'templatecolumn', 
                tpl:    new Ext.XTemplate(
                            '<tpl if="Ext.isEmpty(static_exits)"><div class=\"gridRealm noRight\">None</div></tpl>', 
                            '<tpl for="static_exits">',     
                                "<tpl><div class=\"gridRealm hasRight\">{name}</div></tpl>",
                            '</tpl>'
                        ),
                dataIndex: 'static_exits'
            }  
        ];
        me.callParent(arguments);
    }
});
