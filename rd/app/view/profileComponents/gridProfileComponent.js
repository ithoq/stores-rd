Ext.define('Rd.view.profileComponents.gridProfileComponent' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridProfileComponent',
    multiSelect: true,
    stateful: true,
    stateId: 'StateGridProfileComponent',
    stateEvents:['groupclick','columnhide'],
    border: false,
    comp_id:  null,
    tbar: [
        { xtype: 'buttongroup', title: i18n('sAction'),items : [ 
            {   xtype: 'button',  iconCls: 'b-reload',  glyph: Rd.config.icnReload,  scale: 'large', itemId: 'reload',   tooltip:    i18n('sReload')},
            {   xtype: 'button',  iconCls: 'b-delete', glyph: Rd.config.icnDelete,   scale: 'large', itemId: 'delete',    tooltip:    i18n('sDelete')}
        ]}, 
        { xtype: 'buttongroup', title: i18n('sSelection'),items : [
            {   xtype: 'cmbVendor'     , itemId:'cmbVendor',    emptyText: i18n('sSelect_a_vendor') },
            {   xtype: 'cmbAttribute'  , itemId:'cmbAttribute', emptyText: i18n('sSelect_an_attribute') },
            {   xtype: 'button',  iconCls: 'b-add',  glyph: Rd.config.icnAdd,  scale: 'large', itemId: 'add',       tooltip:    i18n('sAdd')}
        ]}        
    ],
    bbar: [
        {   xtype: 'component', itemId: 'count',   tpl: i18n('sResult_count_{count}'),   style: 'margin-right:5px', cls: 'lblYfi'  }
    ],
    initComponent: function(){

        var me = this;

        //Very important to avoid weird behaviour:
        me.plugins = [Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1
        })];

        //Create a store specific to this Access Provider
        me.store = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mProfileComponentEdit',
            proxy: {
                type        : 'ajax',
                format      : 'json',
                batchActions: true,
                extraParams : { 'comp_id' : me.comp_id },
                reader      : {
                    type        : 'json',
                    root        : 'items',
                    messageProperty: 'message'
                },
                api         : {
                    create      : '/cake2/rd_cake/profile_components/add_comp.json',
                    read        : '/cake2/rd_cake/profile_components/index_comp.json',
                    update      : '/cake2/rd_cake/profile_components/edit_comp.json',
                    destroy     : '/cake2/rd_cake/profile_components/delete_comp.json'
                }
            },
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
            autoLoad: true    
        });

        me.columns = [
            {xtype: 'rownumberer',stateId: 'StateGridProfileComponent1'},
            {
                header: i18n('sType'),
                dataIndex: 'type',
                width: 130,
                tdCls: 'grdEditable',
                editor: {
                    xtype: 'combobox',
                    typeAhead: true,
                    triggerAction: 'all',
                    selectOnTab: true,
                    store: [
                        ['check','Check'],
                        ['reply','Reply']
                    ],
                    lazyRender: true,
                    listClass: 'x-combo-list-small'
                },
                renderer: function(value){
                    if(value == "check"){
                        return i18n('sCheck');
                    }else{
                        return i18n('sReply');
                    }
                },stateId: 'StateGridProfileComponent2'
            },
            { text: i18n('sAttribute_name'),    dataIndex: 'attribute', tdCls: 'gridTree', flex: 1,stateId: 'StateGridProfileComponent3'},
            {
                header: i18n('sOperator'),
                dataIndex: 'op',
                width: 100,
                tdCls: 'grdEditable',
                editor: {
                    allowBlank: false,
                    xtype: 'combobox',
                    typeAhead: true,
                    triggerAction: 'all',
                    selectOnTab: true,
                    store: [
                        ['=' ,  '=' ],
                        [':=',  ':='],
                        ['+=',  '+='],
                        ['==',  '=='],
                        ['-=',  '-='],
                        ['<=',  '<='],
                        ['>=',  '>='],
                        ['!*',  '!*']
                    ],
                    lazyRender: true,
                    listClass: 'x-combo-list-small'
                },stateId: 'StateGridProfileComponent4'   
            },
            { text: i18n('sValue'),        dataIndex: 'value',     tdCls: 'grdEditable', flex: 1,editor: { xtype: 'textfield',    allowBlank: false},stateId: 'StateGridProfileComponent5'},
            { text: i18n('sComment'),      dataIndex: 'comment',   tdCls: 'grdEditable', flex: 1,editor: { xtype: 'textfield',  allowBlank: true},stateId: 'StateGridProfileComponent6'}
        ];
        me.callParent(arguments);
    }
});
