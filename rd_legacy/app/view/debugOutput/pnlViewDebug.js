Ext.define('Rd.view.debugOutput.pnlViewDebug', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlViewDebug',
    html    : '',
    autoScroll : true,
    autoCreate: true,
    border  : '5 5 5 5',
    bodyCls : 'fileViewer',
    requires: [
        'Rd.view.components.cmbNas'
    ],
    tbar: [
        { xtype: 'buttongroup', title: i18n('sAction'), items : [ 
            { xtype: 'button',  iconCls: 'b-clear',     scale: 'large', itemId: 'clear',    tooltip:    i18n('sClear_screen')},
            { xtype: 'button',  iconCls: 'b-start',     scale: 'large', itemId: 'start',    tooltip:    i18n('sStart_debug'),
                toggleGroup     : 'start_stop',
                enableToggle    : true,
                pressed         : true

            },
            { xtype: 'button',  iconCls: 'b-stop',      scale: 'large', itemId: 'stop',     tooltip:    i18n('sStop_debug'),
                toggleGroup     : 'start_stop',
                enableToggle    : true,
                pressed         : false
            },
            { xtype: 'button',  iconCls: 'b-time_add',  scale: 'large', itemId: 'time',     tooltip:    i18n('sAdd_debug_time')}
            
        ]},
        { xtype: 'buttongroup', title: i18n('sFilters'), height: 61, items : [   
           {   
                xtype       : 'cmbNas', 
                itemId      : 'nas', 
                emptyText   : i18n("sAny_NAS_device"), 
                forceSelection: false, 
                allowBlank  : true, 
                labelWidth  : 120
            },
            { xtype: 'tbspacer',width: 10 },
            {
                xtype       : 'textfield',
                fieldLabel  : i18n('sUsername'),
                name        : "username",
                itemId      : "username",
                allowBlank  : true,
                emptyText   : i18n('sAny_user'),
                labelSeparator: '',
                labelClsExtra: 'lblRd',
                labelWidth  : 120
            }
        ]}
    ],
    bbar: [
        {   xtype: 'component', itemId: 'feedback',  tpl: '{message}',   style: 'margin-right:5px', cls: 'lblYfi'  }
    ],
    initComponent: function(){
        var me = this;      
        me.callParent(arguments);
    }
});

