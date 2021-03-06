Ext.define('Rd.controller.cPermanentUsers', {
    extend: 'Ext.app.Controller',
    actionIndex: function(){
        var me = this;
        var desktop = this.application.getController('cDesktop');
        var win = desktop.getWindow('permanentUsersWin');
        if(!win){
            win = desktop.createWindow({
                id: 'permanentUsersWin',
                //title: i18n('sPermanent_Users'),
                btnText: i18n('sPermanent_Users'),
                width:800,
                height:400,
                iconCls: 'users',
                glyph: Rd.config.icnUser,
                animCollapse:false,
                border:false,
                constrainHeader:true,
                layout: 'border',
                stateful: true,
                stateId: 'permanentUsersWin',
                items: [
                    {
                        region: 'north',
                        xtype:  'pnlBanner',
                        heading: i18n('sPermanent_Users'),
                        image:  'resources/images/48x48/users.png'
                    },
                    {
                        region  : 'center',
                        xtype   : 'panel',
                        layout  : 'fit',
                        border  : false,
                        items   : [{
                            xtype   : 'tabpanel',
                            layout  : 'fit',
                            margins : '0 0 0 0',
                            border  : true,
                            plain   : true,
                            items   : { 'title' : i18n('sHome'), xtype: 'gridPermanentUsers','glyph': Rd.config.icnHome}}
                        ]
                    }
                ]
            });
        }
        desktop.restoreWindow(win);    
        return win;
    },

    views:  [
       'components.pnlBanner',  'permanentUsers.gridPermanentUsers',   'permanentUsers.winPermanentUserAddWizard',
       'components.cmbRealm',   'components.cmbProfile',  'components.cmbCap',
       'components.winNote',    'components.winNoteAdd',  'components.winCsvColumnSelect',
       'permanentUsers.pnlPermanentUser', 'permanentUsers.gridUserRadaccts', 'permanentUsers.gridUserRadpostauths',
        'permanentUsers.winPermanentUserPassword',  'components.winEnableDisable', 'permanentUsers.gridUserPrivate',
       'components.cmbVendor',   'components.cmbAttribute', 'permanentUsers.gridUserDevices', 'components.pnlUsageGraph'
    ],
    stores: ['sLanguages', 'sAccessProvidersTree',    'sPermanentUsers', 'sRealms', 'sProfiles', 'sAttributes', 'sVendors'],
    models: [
        'mAccessProviderTree',     'mPermanentUser',    'mRealm',       'mProfile', 'mUserStat',
        'mRadacct',                 'mRadpostauth',     'mAttribute',   'mVendor',  'mPrivateAttribute', 'mDevice' ],
    selectedRecord: null,
    config: {
        urlAdd:             '/cake2/rd_cake/permanent_users/add.json',
        urlApChildCheck:    '/cake2/rd_cake/access_providers/child_check.json',
        urlExportCsv:       '/cake2/rd_cake/permanent_users/export_csv',
        urlNoteAdd:         '/cake2/rd_cake/permanent_users/note_add.json',
        urlViewBasic:       '/cake2/rd_cake/permanent_users/view_basic_info.json',
        urlEditBasic:       '/cake2/rd_cake/permanent_users/edit_basic_info.json',
        urlViewPersonal:    '/cake2/rd_cake/permanent_users/view_personal_info.json',
        urlEditPersonal:    '/cake2/rd_cake/permanent_users/edit_personal_info.json',
        urlViewTracking:    '/cake2/rd_cake/permanent_users/view_tracking.json',
        urlEditTracking:    '/cake2/rd_cake/permanent_users/edit_tracking.json',
        urlEnableDisable:   '/cake2/rd_cake/permanent_users/enable_disable.json',
        urlChangePassword:  '/cake2/rd_cake/permanent_users/change_password.json',
        urlDevicesListedOnly:'/cake2/rd_cake/permanent_users/restrict_list_of_devices.json',
        urlAutoAddMac:      '/cake2/rd_cake/permanent_users/auto_mac_on_off.json',
        urlDelete:          '/cake2/rd_cake/permanent_users/delete.json',
        urlDeleteRadaccts:  '/cake2/rd_cake/radaccts/delete.json',
        urlDeletePostAuths: '/cake2/rd_cake/radpostauths/delete.json'
    },
    refs: [
        {  ref: 'grid',         selector:   'gridPermanentUsers'},
        {  ref: 'privateGrid',  selector:   'gridUserPrivate'}        
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;

        me.getStore('sPermanentUsers').addListener('load',me.onStorePermanentUsersLoaded, me);
        me.control({
            '#permanentUsersWin'    : {
                beforeshow:      me.winClose,
                destroy   :      me.winClose
            },
            'gridPermanentUsers #reload': {
                click:      me.reload
            },
            'gridPermanentUsers #reload menuitem[group=refresh]'   : {
                click:      me.reloadOptionClick
            }, 
            'gridPermanentUsers #add'   : {
                click:      me.add
            },
            'gridPermanentUsers #delete'   : {
                click:      me.del
            },
            'gridPermanentUsers #edit'   : {
                click:      me.edit
            },
            'gridPermanentUsers #note'   : {
                click:      me.note
            },
            'gridPermanentUsers #csv'  : {
                click:      me.csvExport
            },
            'gridPermanentUsers #password'  : {
                click:      me.changePassword
            },
            'gridPermanentUsers #enable_disable' : {
                click:      me.enableDisable
            },
            'gridPermanentUsers #test_radius' : {
                click:      me.testRadius
            },
            'gridPermanentUsers'   : {
                select:      me.select,
                activate:      me.gridActivate
            },
            'winPermanentUserAddWizard #btnTreeNext' : {
                click:  me.btnTreeNext
            },
            'winPermanentUserAddWizard #btnDataPrev' : {
                click:  me.btnDataPrev
            },
            'winPermanentUserAddWizard #btnDataNext' : {
                click:  me.btnDataNext
            },
            'winPermanentUserAddWizard #profile' : {
                change:  me.cmbProfileChange
            },
            'winPermanentUserAddWizard #always_active' : {
                change:  me.chkAlwaysActiveChange
            },
            'winPermanentUserAddWizard #to_date' : {
                change:  me.toDateChange
            },
            'winPermanentUserAddWizard #from_date' : {
                change:  me.fromDateChange
            },
            '#winCsvColumnSelectPermanentUsers #save': {
                click:  me.csvExportSubmit
            },
            'gridNote[noteForGrid=permanentUsers] #reload' : {
                click:  me.noteReload
            },
            'gridNote[noteForGrid=permanentUsers] #add' : {
                click:  me.noteAdd
            },
            'gridNote[noteForGrid=permanentUsers] #delete' : {
                click:  me.noteDelete
            },
            'gridNote[noteForGrid=permanentUsers]' : {
                itemclick: me.gridNoteClick
            },
            'winNoteAdd[noteForGrid=permanentUsers] #btnTreeNext' : {
                click:  me.btnNoteTreeNext
            },
            'winNoteAdd[noteForGrid=permanentUsers] #btnNoteAddPrev'  : {   
                click: me.btnNoteAddPrev
            },
            'winNoteAdd[noteForGrid=permanentUsers] #btnNoteAddNext'  : {   
                click: me.btnNoteAddNext
            },
            'pnlPermanentUser gridUserRadpostauths #reload' :{
                click:      me.gridUserRadpostauthsReload
            },
            'pnlPermanentUser gridUserRadpostauths #delete' :{
                click:      me.deletePostAuths
            },
            'pnlPermanentUser gridUserRadpostauths' : {
                activate:      me.gridActivate
            },
            'pnlPermanentUser gridUserRadaccts #reload' :{
                click:      me.gridUserRadacctsReload
            },
            'pnlPermanentUser gridUserRadaccts #delete' :{
                click:      me.deleteRadaccts
            },
            'pnlPermanentUser gridUserRadaccts' : {
                activate:      me.gridActivate
            },
            'pnlPermanentUser gridUserDevices' : {
                activate:      me.gridActivate
            },
            'pnlPermanentUser gridUserDevices #reload' :{
                click:      me.gridUserDevicesReload
            },
            'pnlPermanentUser gridUserDevices #chkListedOnly' :{
                change:      me.gridUserDevicesListedOnly
            },
            'pnlPermanentUser gridUserDevices #chkAutoAddMac' :{
                change:      me.gridUserDevicesAutoAddMac
            },
            'pnlPermanentUser gridUserPrivate' : {
                select:        me.selectUserPrivate,
                activate:      me.gridActivate
            },
            'pnlPermanentUser #profile' : {
                change:  me.cmbProfileChange,
                render:  me.renderEventProfile
            },
            'pnlPermanentUser #realm' : {
                render:      me.renderEventRealm
            },
            'pnlPermanentUser #always_active' : {
                change:  me.chkAlwaysActiveChange
            },
            'pnlPermanentUser #to_date' : {
                change:  me.toDateChange
            },
            'pnlPermanentUser #from_date' : {
                change:  me.fromDateChange
            },
            'pnlPermanentUser #tabBasicInfo' : {
                activate: me.onTabBasicInfoActive
            },
            'pnlPermanentUser #tabBasicInfo #save' : {
                click: me.saveBasicInfo
            },
            'pnlPermanentUser #tabPersonalInfo' : {
                activate: me.onTabPersonalInfoActive
            },
            'pnlPermanentUser #tabPersonalInfo #save' : {
                click: me.savePersonalInfo
            },
            'pnlPermanentUser #tabTracking' : {
                activate: me.onTabTrackingActive
            },
            'pnlPermanentUser #tabTracking #save' : {
                click: me.saveTracking
            },
            'pnlPermanentUser #pnlUsageGraphs #daily' : {
                activate:      me.loadGraph
            },
            'pnlPermanentUser #pnlUsageGraphs #daily #reload' : {
                click:      me.reloadDailyGraph
            },
            'pnlPermanentUser #pnlUsageGraphs #daily #day' : {
                change:      me.changeDailyGraph
            },
            'pnlPermanentUser #pnlUsageGraphs #weekly' : {
                activate:      me.loadGraph
            },
            'pnlPermanentUser #pnlUsageGraphs #weekly #reload' : {
                click:      me.reloadWeeklyGraph
            },
            'pnlPermanentUser #pnlUsageGraphs #weekly #day' : {
                change:      me.changeWeeklyGraph
            },
            'pnlPermanentUser #pnlUsageGraphs #monthly' : {
                activate:      me.loadGraph
            },
            'pnlPermanentUser #pnlUsageGraphs #monthly #reload' : {
                click:      me.reloadMonthlyGraph
            },
            'pnlPermanentUser #pnlUsageGraphs #monthly #day' : {
                change:      me.changeMonthlyGraph
            },
            'winEnableDisable #save': {
                click: me.enableDisableSubmit
            },
            'winPermanentUserPassword #save': {
                click: me.changePasswordSubmit
            },
            'gridUserPrivate' : {
                beforeedit:     me.onBeforeEditUserPrivate
            },
            'gridUserPrivate  #cmbVendor': {
                change:      me.cmbVendorChange
            },
            'gridUserPrivate  #add': {
                click:      me.attrAdd
            },
            'gridUserPrivate  #reload': {
                click:      me.attrReload
            },
            'gridUserPrivate  #delete': {
                click:      me.attrDelete
            }
        });
    },
    reload: function(){
        var me =this;
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getGrid().getStore().load();
    },
    gridActivate: function(g){
        var me = this;
        g.getStore().load();
    },
    add: function(button){  
        var me = this;
        //We need to do a check to determine if this user (be it admin or acess provider has the ability to add to children)
        //admin/root will always have, an AP must be checked if it is the parent to some sub-providers. If not we will 
        //simply show the nas connection typer selection 
        //if it does have, we will show the tree to select an access provider.
        Ext.Ajax.request({
            url: me.urlApChildCheck,
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                        
                    if(jsonData.items.tree == true){
                        if(!me.application.runAction('cDesktop','AlreadyExist','winPermanentUserAddWizardId')){
                            var w = Ext.widget('winPermanentUserAddWizard',{
                                id:'winPermanentUserAddWizardId', selLanguage : me.application.getSelLanguage()
                            });
                            me.application.runAction('cDesktop','Add',w);         
                        }
                    }else{
                        if(!me.application.runAction('cDesktop','AlreadyExist','winPermanentUserAddWizardId')){
                            var w = Ext.widget('winPermanentUserAddWizard',{
                                id:'winPermanentUserAddWizardId',
                                startScreen: 'scrnData',
                                user_id:'0',
                                owner: i18n('sLogged_in_user'), 
                                no_tree: true,
                                selLanguage : me.application.getSelLanguage()
                            });
                            me.application.runAction('cDesktop','Add',w);         
                        }
                    }
                }   
            },
            scope: me
        });
    },
    btnTreeNext: function(button){
        var me = this;
        var tree = button.up('treepanel');
        //Get selection:
        var sr = tree.getSelectionModel().getLastSelected();
        if(sr){    
            var win = button.up('winPermanentUserAddWizard');
            win.down('#owner').setValue(sr.get('username'));
            win.down('#parent_id').setValue(sr.getId());
            win.getLayout().setActiveItem('scrnData');
        }else{
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_owner'),
                        i18n('sFirst_select_an_Access_Provider_who_will_be_the_owner'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }
    },
    btnDataPrev:  function(button){
        var me      = this;
        var win     = button.up('winPermanentUserAddWizard');
        win.getLayout().setActiveItem('scrnApTree');
    },
    btnDataNext:  function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        var multi   = win.down('#multiple').getValue();
        form.submit({
            clientValidation: true,
            url: me.urlAdd,
            success: function(form, action) {
                if(multi != true){
                    win.close(); //Multi keep open for next user
                }
                me.getStore('sPermanentUsers').load();
                Ext.ux.Toaster.msg(
                    i18n('sNew_item_created'),
                    i18n('sItem_created_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            //Focus on the first tab as this is the most likely cause of error 
            failure: function(form,action){
                var tp = win.down('tabpanel');
                tp.setActiveTab(0);
                Ext.ux.formFail(form,action)
            }
        });
    },

    cmbProfileChange:   function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        var cmbDataCap  = form.down('#cmbDataCap');
        var cmbTimeCap  = form.down('#cmbTimeCap');
        var value   = cmb.getValue();
        var s = cmb.getStore();
        var r = s.getById(value);
        console.log("Profile changed");
        if(r != null){
            var data_cap = r.get('data_cap_in_profile');
            if(data_cap){
                cmbDataCap.setVisible(true);
                cmbDataCap.setDisabled(false);
            }else{
                cmbDataCap.setVisible(false);
                cmbDataCap.setDisabled(true);
            }
            var time_cap = r.get('time_cap_in_profile');
            if(time_cap){
                cmbTimeCap.setVisible(true);
                cmbTimeCap.setDisabled(false);
            }else{
                cmbTimeCap.setVisible(false);
                cmbTimeCap.setDisabled(true);
            }
        }
    },

    chkAlwaysActiveChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var from    = form.down('#from_date');
        var to      = form.down('#to_date');
        var value   = chk.getValue();
        if(value){
            to.setVisible(false);
            to.setDisabled(true);
            from.setVisible(false);
            from.setDisabled(true);
        }else{
            to.setVisible(true);
            to.setDisabled(false);
            from.setVisible(true);
            from.setDisabled(false);
        }
    },

    toDateChange: function(d,newValue,oldValue){
        var me = this;
        var form = d.up('form');   
        var from_date = form.down('#from_date');
        if(newValue <= from_date.getValue()){
            Ext.ux.Toaster.msg(
                        i18n('sEnd_date_wrong'),
                        i18n('sThe_end_date_should_be_after_the_start_date'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }
    },

    fromDateChange: function(d,newValue, oldValue){
        var me = this;
        var form = d.up('form');
        var to_date = form.down('#to_date');
        if(newValue >= to_date.getValue()){
            Ext.ux.Toaster.msg(
                        i18n('sStart_date_wrong'),
                        i18n('sThe_start_date_should_be_before_the_end_date'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }
    },
    select:  function(grid, record, item, index, event){
        var me = this;
        //Adjust the Edit and Delete buttons accordingly...
        //Dynamically update the top toolbar
        tb = me.getGrid().down('toolbar[dock=top]');

        var edit = record.get('update');
        if(edit == true){
            if(tb.down('#edit') != null){
                tb.down('#edit').setDisabled(false);
                tb.down('#password').setDisabled(false);
            }
        }else{
            if(tb.down('#edit') != null){
                tb.down('#edit').setDisabled(true);
                tb.down('#password').setDisabled(true);
            }
        }

        var del = record.get('delete');
        if(del == true){
            if(tb.down('#delete') != null){
                tb.down('#delete').setDisabled(false);
            }
        }else{
            if(tb.down('#delete') != null){
                tb.down('#delete').setDisabled(true);
            }
        }
    },
    edit:   function(){
       // console.log("Edit node");  
        var me = this;
        //See if there are anything selected... if not, inform the user
        var sel_count = me.getGrid().getSelectionModel().getCount();
        if(sel_count == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{

            var selected    =  me.getGrid().getSelectionModel().getSelection();
            var count       = selected.length;         
            Ext.each(me.getGrid().getSelectionModel().getSelection(), function(sr,index){

                //Check if the node is not already open; else open the node:
                var tp          = me.getGrid().up('tabpanel');
                var pu_id       = sr.getId();
                var pu_tab_id   = 'puTab_'+pu_id;
                var nt          = tp.down('#'+pu_tab_id);
                if(nt){
                    tp.setActiveTab(pu_tab_id); //Set focus on  Tab
                    return;
                }

                var pu_tab_name = sr.get('username');
                //Tab not there - add one
                tp.add({ 
                    title :     pu_tab_name,
                    itemId:     pu_tab_id,
                    closable:   true,
                    iconCls:    'edit', 
                    glyph: Rd.config.icnEdit,
                    layout:     'fit', 
                    items:      {'xtype' : 'pnlPermanentUser',pu_id: pu_id, pu_name: pu_tab_name, record: sr}
                });
                tp.setActiveTab(pu_tab_id); //Set focus on Add Tab
            });
        }
    },

    del:   function(){
        var me      = this;     
        //Find out if there was something selected
        if(me.getGrid().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    var selected    = me.getGrid().getSelectionModel().getSelection();
                    var list        = [];
                    Ext.Array.forEach(selected,function(item){
                        var id = item.getId();
                        Ext.Array.push(list,{'id' : id});
                    });
                    Ext.Ajax.request({
                        url: me.urlDelete,
                        method: 'POST',          
                        jsonData: list,
                        success: function(batch,options){console.log('success');
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            me.reload(); //Reload from server
                        },                                    
                        failure: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            me.reload(); //Reload from server
                        }
                    });
                }
            });
        }
    },
    onStorePermanentUsersLoaded: function() {
        var me      = this;
        var count   = me.getStore('sPermanentUsers').getTotalCount();
        me.getGrid().down('#count').update({count: count});
    },

    csvExport: function(button,format) {
        var me          = this;
        var columns     = me.getGrid().columns;
        var col_list    = [];
        Ext.Array.each(columns, function(item,index){
            if(item.dataIndex != ''){
                var chk = {boxLabel: item.text, name: item.dataIndex, checked: true};
                col_list[index] = chk;
            }
        }); 

        if(!me.application.runAction('cDesktop','AlreadyExist','winCsvColumnSelectPermanentUsers')){
            var w = Ext.widget('winCsvColumnSelect',{id:'winCsvColumnSelectPermanentUsers',columns: col_list});
            me.application.runAction('cDesktop','Add',w);         
        }
    },
    csvExportSubmit: function(button){

        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');

        var chkList = form.query('checkbox');
        var c_found = false;
        var columns = [];
        var c_count = 0;
        Ext.Array.each(chkList,function(item){
            if(item.getValue()){ //Only selected items
                c_found = true;
                columns[c_count] = {'name': item.getName()};
                c_count = c_count +1; //For next one
            }
        },me);

        if(!c_found){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_one_or_more'),
                        i18n('sSelect_one_or_more_columns_please'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{     
            //next we need to find the filter values:
            var filters     = [];
            var f_count     = 0;
            var f_found     = false;
            var filter_json ='';
            me.getGrid().filters.filters.each(function(item) {
                if (item.active) {
                    f_found         = true;
                    var ser_item    = item.serialize();
                    ser_item.field  = item.dataIndex;
                    filters[f_count]= ser_item;
                    f_count         = f_count + 1;
                }
            });   
            var col_json        = "columns="+Ext.JSON.encode(columns);
            var extra_params    = Ext.Object.toQueryString(Ext.Ajax.extraParams);
            var append_url      = "?"+extra_params+'&'+col_json;
            if(f_found){
                filter_json = "filter="+Ext.JSON.encode(filters);
                append_url  = append_url+'&'+filter_json;
            }
            window.open(me.urlExportCsv+append_url);
            win.close();
        }
    },
    note: function(button,format) {
        var me      = this;     
        //Find out if there was something selected
        var sel_count = me.getGrid().getSelectionModel().getCount();
        if(sel_count == 0){

             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(sel_count > 1){

                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{

                //Determine the selected record:
                var sr = me.getGrid().getSelectionModel().getLastSelected();
                
                if(!me.application.runAction('cDesktop','AlreadyExist','winNotePermananetUsers'+sr.getId())){
                    var w = Ext.widget('winNote',
                        {
                            id          : 'winNotePermananetUsers'+sr.getId(),
                            noteForId   : sr.getId(),
                            noteForGrid : 'permanentUsers',
                            noteForName : sr.get('username')
                        });
                    me.application.runAction('cDesktop','Add',w);       
                }
            }    
        }
    },
    noteReload: function(button){
        var me      = this;
        var grid    = button.up('gridNote');
        grid.getStore().load();
    },
    noteAdd: function(button){
        var me      = this;
        var grid    = button.up('gridNote');
        //See how the wizard should be displayed:
        Ext.Ajax.request({
            url: me.urlApChildCheck,
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){                      
                    if(jsonData.items.tree == true){
                        if(!me.application.runAction('cDesktop','AlreadyExist','winNotePermananetUsersAdd'+grid.noteForId)){
                            var w   = Ext.widget('winNoteAdd',
                            {
                                id          : 'winNotePermananetUsersAdd'+grid.noteForId,
                                noteForId   : grid.noteForId,
                                noteForGrid : grid.noteForGrid,
                                refreshGrid : grid
                            });
                            me.application.runAction('cDesktop','Add',w);       
                        }
                    }else{
                        if(!me.application.runAction('cDesktop','AlreadyExist','winNotePermananetUsersAdd'+grid.noteForId)){
                            var w   = Ext.widget('winNoteAdd',
                            {
                                id          : 'winNotePermananetUsersAdd'+grid.noteForId,
                                noteForId   : grid.noteForId,
                                noteForGrid : grid.noteForGrid,
                                refreshGrid : grid,
                                startScreen : 'scrnNote',
                                user_id     : '0',
                                owner       : i18n('sLogged_in_user'),
                                no_tree     : true
                            });
                            me.application.runAction('cDesktop','Add',w);       
                        }
                    }
                }   
            },
            scope: me
        });
    },
    gridNoteClick: function(item,record){
        var me = this;
        //Dynamically update the top toolbar
        grid    = item.up('gridNote');
        tb      = grid.down('toolbar[dock=top]');
        var del = record.get('delete');
        if(del == true){
            if(tb.down('#delete') != null){
                tb.down('#delete').setDisabled(false);
            }
        }else{
            if(tb.down('#delete') != null){
                tb.down('#delete').setDisabled(true);
            }
        }
    },
    btnNoteTreeNext: function(button){
        var me = this;
        var tree = button.up('treepanel');
        //Get selection:
        var sr = tree.getSelectionModel().getLastSelected();
        if(sr){    
            var win = button.up('winNoteAdd');
            win.down('#owner').setValue(sr.get('username'));
            win.down('#user_id').setValue(sr.getId());
            win.getLayout().setActiveItem('scrnNote');
        }else{
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_owner'),
                        i18n('sFirst_select_an_Access_Provider_who_will_be_the_owner'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }
    },
    btnNoteAddPrev: function(button){
        var me = this;
        var win = button.up('winNoteAdd');
        win.getLayout().setActiveItem('scrnApTree');
    },
    btnNoteAddNext: function(button){
        var me      = this;
        var win     = button.up('winNoteAdd');
       // console.log(win.noteForId);
       // console.log(win.noteForGrid);
        win.refreshGrid.getStore().load();
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.urlNoteAdd,
            params: {for_id : win.noteForId},
            success: function(form, action) {
                win.close();
                win.refreshGrid.getStore().load();
                me.reload();
                Ext.ux.Toaster.msg(
                    i18n('sNew_item_created'),
                    i18n('sItem_created_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
    noteDelete: function(button){
        var me      = this;
        var grid    = button.up('gridNote');
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    grid.getStore().remove(grid.getSelectionModel().getSelection());
                    grid.getStore().sync({
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            grid.getStore().load();   //Update the count
                            me.reload();   
                        },
                        failure: function(batch,options,c,d){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            grid.getStore().load(); //Reload from server since the sync was not good
                        }
                    });
                }
            });
        }
    },
    changePassword: function(){
        var me = this;
     //   console.log("Changing password");
         //Find out if there was something selected
        var sel_count = me.getGrid().getSelectionModel().getCount();
        if(sel_count == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(sel_count > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{

                //Determine the selected record:
                var sr = me.getGrid().getSelectionModel().getLastSelected(); 
                if(!me.application.runAction('cDesktop','AlreadyExist','winPermanentUsersPassword'+sr.getId())){
                    var w = Ext.widget('winPermanentUserPassword',
                        {
                            id          : 'winPermanentUsersPassword'+sr.getId(),
                            user_id     : sr.getId(),
                            username    : sr.get('username'),
                            title       : i18n('sChange_password_for')+' '+sr.get('username')
                        });
                    me.application.runAction('cDesktop','Add',w);       
                }
            }    
        }
    },
    changePasswordSubmit: function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');

        var extra_params        = {};
        var sr                  = me.getGrid().getSelectionModel().getLastSelected();
        extra_params['user_id'] = sr.getId();

        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.urlChangePassword,
            params              : extra_params,
            success             : function(form, action) {
                win.close();
                me.reload();
                Ext.ux.Toaster.msg(
                    i18n('sPassword_changed'),
                    i18n('sPassword_changed_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    },
    enableDisable: function(button){
        var me      = this;
        var grid    = button.up('grid');
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){ 
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(!me.application.runAction('cDesktop','AlreadyExist','winEnableDisableUser')){
                var w = Ext.widget('winEnableDisable',{id:'winEnableDisableUser'});
                me.application.runAction('cDesktop','Add',w);       
            }    
        }
    },
    enableDisableSubmit:function(button){

        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');

        var extra_params    = {};
        var s               = me.getGrid().getSelectionModel().getSelection();
        Ext.Array.each(s,function(record){
            var r_id = record.getId();
            extra_params[r_id] = r_id;
        });

        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.urlEnableDisable,
            params              : extra_params,
            success             : function(form, action) {
                win.close();
                me.reload();
                Ext.ux.Toaster.msg(
                    i18n('sItems_modified'),
                    i18n('sItems_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    },
    testRadius: function(button){
        var me = this;
        var grid    = button.up('grid');
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){ 
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_test'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            var sr = grid.getSelectionModel().getLastSelected();
            me.application.runAction('cRadiusClient','TestPermanent',sr);        
        }
    },  
    gridUserRadpostauthsReload: function(button){
        var me  = this;
        var g = button.up('gridUserRadpostauths');
        g.getStore().load();
    },
    gridUserDevicesReload: function(button){
        var me  = this;
        var g = button.up('gridUserDevices');
        g.getStore().load();
    },
    gridUserRadacctsReload: function(button){
        var me  = this;
        var g   = button.up('gridUserRadaccts');
        g.getStore().load();
    },
    gridUserDevicesListedOnly : function(chk){
        var me          = this;
        var username    = chk.up('gridUserDevices').username;
        var g_devices   = chk.up('gridUserDevices');
        var chk_auto    = g_devices.down('#chkAutoAddMac');

        //We have to uncheck the auto add check if this is checked
        var chk_listed  = chk.getValue();
        if(chk_listed){   
            if(chk_auto.getValue()){
                console.log("Disable auto add check");
                chk_auto.setValue(false);
            }            
        }

        Ext.Ajax.request({
            url: me.urlDevicesListedOnly,
            method: 'GET',
            params: {username : username, restrict : chk.getValue() },
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    Ext.ux.Toaster.msg(
                                i18n('sItem_updated'),
                                i18n('sItem_updated_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                    );    
                }   
            },
            scope: me
        });
    },

    gridUserDevicesAutoAddMac : function(chk){
        var me          = this;
        var username    = chk.up('gridUserDevices').username;
        var g_devices   = chk.up('gridUserDevices');
        var chk_listed  = g_devices.down('#chkListedOnly');

       //We have to uncheck the only from this devices check if this is checked
        var auto_m = chk.getValue();
        if(auto_m){   
            if(chk_listed.getValue()){
                console.log("Disable only listed check");
                chk_listed.setValue(false);
            }            
        }

        Ext.Ajax.request({
            url: me.urlAutoAddMac,
            method: 'GET',
            params: {username : username, auto_mac : chk.getValue() },
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    Ext.ux.Toaster.msg(
                                i18n('sItem_updated'),
                                i18n('sItem_updated_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                    );    
                }   
            },
            scope: me
        });
    },
    deletePostAuths:   function(button){
        var me      = this;
        var grid    = button.up('grid');   
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    var selected    = grid.getSelectionModel().getSelection();
                    var list        = [];
                    Ext.Array.forEach(selected,function(item){
                        var id = item.getId();
                        Ext.Array.push(list,{'id' : id});
                    });
                    Ext.Ajax.request({
                        url: me.urlDeletePostAuths,
                        method: 'POST',          
                        jsonData: list,
                        success: function(batch,options){console.log('success');
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            grid.getSelectionModel().deselectAll(true);
                            grid.getStore().load();
                        },                                    
                        failure: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            grid.getSelectionModel().deselectAll(true);
                            grid.getStore().load();
                        }
                    });
                }
            });
        }
    },
    deleteRadaccts:   function(button){
        var me      = this;
        var grid    = button.up('grid');   
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    var selected    = grid.getSelectionModel().getSelection();
                    var list        = [];
                    Ext.Array.forEach(selected,function(item){
                        var id = item.getId();
                        Ext.Array.push(list,{'id' : id});
                    });
                    Ext.Ajax.request({
                        url: me.urlDeleteRadaccts,
                        method: 'POST',          
                        jsonData: list,
                        success: function(batch,options){console.log('success');
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            grid.getSelectionModel().deselectAll(true);
                            grid.getStore().load();
                        },                                    
                        failure: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            grid.getSelectionModel().deselectAll(true);
                            grid.getStore().load();
                        }
                    });
                }
            });
        }
    },
    reloadOptionClick: function(menu_item){
        var me      = this;
        var n       = menu_item.getItemId();
        var b       = menu_item.up('button'); 
        var interval= 30000; //default
        clearInterval(me.autoReload);   //Always clear
        b.setIconCls('b-reload_time');
        b.setGlyph(Rd.config.icnTime);

        if(n == 'mnuRefreshCancel'){
            b.setIconCls('b-reload');
            b.setGlyph(Rd.config.icnReload);
            return;
        }
        
        if(n == 'mnuRefresh1m'){
           interval = 60000
        }

        if(n == 'mnuRefresh5m'){
           interval = 360000
        }
        me.autoReload = setInterval(function(){        
            me.reload();
        },  interval);  
    },
    onTabBasicInfoActive: function(t){
        var me      = this;
        var form    = t.down('form');
        //get the user's id
        var user_id = t.up('pnlPermanentUser').pu_id;
        form.load({url:me.urlViewBasic, method:'GET',params:{user_id:user_id}, 
            success : function(a,b){
                //Set the CAP's of the permanent user
                if(b.result.data.cap_data != undefined){
                    var cmbDataCap  = form.down('#cmbDataCap');
                    cmbDataCap.setVisible(true);
                    cmbDataCap.setDisabled(false);
                    cmbDataCap.setValue(b.result.data.cap_data);
                }

                if(b.result.data.cap_time != undefined){
                    var cmbTimeCap  = form.down('#cmbTimeCap');
                    cmbTimeCap.setVisible(true);
                    cmbTimeCap.setDisabled(false);
                    cmbTimeCap.setValue(b.result.data.cap_time);
                }
            } 
        });
    },
    saveBasicInfo:function(button){

        var me      = this;
        var form    = button.up('form');
        var user_id = button.up('pnlPermanentUser').pu_id;
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.urlEditBasic,
            params              : {id: user_id},
            success             : function(form, action) {
                me.reload();
                Ext.ux.Toaster.msg(
                    i18n('sItems_modified'),
                    i18n('sItems_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    },
    onTabPersonalInfoActive: function(t){
        var me      = this;
        var form    = t.down('form');
        //get the user's id
        var user_id = t.up('pnlPermanentUser').pu_id;
        form.load({url:me.urlViewPersonal, method:'GET',params:{user_id:user_id}});
    },
    savePersonalInfo:function(button){

        var me      = this;
        var form    = button.up('form');
        var user_id = button.up('pnlPermanentUser').pu_id;
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.urlEditPersonal,
            params              : {id: user_id},
            success             : function(form, action) {
                me.reload();
                Ext.ux.Toaster.msg(
                    i18n('sItems_modified'),
                    i18n('sItems_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    },
    onTabTrackingActive: function(t){
        var me      = this;
        var form    = t.down('form');
        //get the user's id
        var user_id = t.up('pnlPermanentUser').pu_id;
        form.load({url:me.urlViewTracking, method:'GET',params:{user_id:user_id}});
    },
    saveTracking:function(button){

        var me      = this;
        var form    = button.up('form');
        var user_id = button.up('pnlPermanentUser').pu_id;
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.urlEditTracking,
            params              : {id: user_id},
            success             : function(form, action) {
                me.reload();
                Ext.ux.Toaster.msg(
                    i18n('sItems_modified'),
                    i18n('sItems_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    },
    winClose:   function(){
        var me = this;
        if(me.autoReload != undefined){
            clearInterval(me.autoReload);   //Always clear
        }
    },
    selectUserPrivate:  function(grid, record, item, index, event){
        var me = this;
        //Adjust the Edit and Delete buttons accordingly...
        //Dynamically update the top toolbar
        tb = me.getPrivateGrid().down('toolbar[dock=top]');
        var del = record.get('delete');
        if(del == true){
            if(tb.down('#delete') != null){
                tb.down('#delete').setDisabled(false);
            }
        }else{
            if(tb.down('#delete') != null){
                tb.down('#delete').setDisabled(true);
            }
        }
    },
    onBeforeEditUserPrivate: function(g,e){
        var me = this;
        return e.record.get('edit');
    },
    cmbVendorChange: function(cmb){
        var me = this;
        var value   = cmb.getValue();
        var grid    = cmb.up('gridUserPrivate');
        var attr    = grid.down('cmbAttribute');
        //Cause this to result in a reload of the Attribute combo
        attr.getStore().getProxy().setExtraParam('vendor',value);
        attr.getStore().load();   
    },
    attrAdd: function(b){
        var me = this;
        var grid    = b.up('gridUserPrivate');
        var attr    = grid.down('cmbAttribute');
        var a_val   = attr.getValue();
        if(a_val == null){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{

            //We do not do double's
            var f = grid.getStore().find('attribute',a_val);
            if(f == -1){
                grid.getStore().add(Ext.create('Rd.model.mPrivateAttribute',
                    {
                        type            : 'check',
                        attribute       : a_val,
                        op              : ':=',
                        value           : i18n('sReplace_this_value'),
                        delete          : true,
                        edit            : true
                    }
                ));
                grid.getStore().sync();
            }
        }
    },

    attrReload: function(b){
        var me = this;
        var grid = b.up('gridUserPrivate');
        grid.getStore().load();
    },
    attrDelete: function(button){

        var me      = this;
        var grid    = button.up('gridUserPrivate');
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    grid.getStore().remove(grid.getSelectionModel().getSelection());
                    grid.getStore().sync({
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                           // grid.getStore().load();   //Update the count
                            me.reload();   
                        },
                        failure: function(batch,options,c,d){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            grid.getStore().load(); //Reload from server since the sync was not good
                        }
                    });
                }
            });
        }
    },
    renderEventRealm: function(cmb){
        var me                      = this;
        var pnlPu               = cmb.up('pnlPermanentUser');
        pnlPu.cmbRealmRendered  = true;
        if(pnlPu.record != undefined){
            var rn      = pnlPu.record.get('realm');
            var r_id    = pnlPu.record.get('realm_id');
            var rec     = Ext.create('Rd.model.mRealm', {name: rn, id: r_id});
            cmb.getStore().loadData([rec],false);
        }
    },
    renderEventProfile: function(cmb){
        var me          = this;
        var pnlPu       = cmb.up('pnlPermanentUser');
        pnlPu.cmbProfileRendered  = true;
        if(pnlPu.record != undefined){
            var pn      = pnlPu.record.get('profile');
            var p_id    = pnlPu.record.get('profile_id');
            var rec     = Ext.create('Rd.model.mProfile', {name: pn, id: p_id});
            cmb.getStore().loadData([rec],false);
        }
    },
    loadGraph: function(tab){
        var me  = this;
        tab.down("chart").setLoading(true);
        //Get the value of the Day:
        var day = tab.down('#day');
        tab.down("chart").getStore().getProxy().setExtraParam('day',day.getValue());
        me.reloadChart(tab);
    },
    reloadDailyGraph: function(btn){
        var me  = this;
        tab     = btn.up("#daily");
        me.reloadChart(tab);
    },
    changeDailyGraph: function(d,new_val, old_val){
        var me      = this;
        var tab     = d.up("#daily");
        tab.down("chart").getStore().getProxy().setExtraParam('day',new_val);
        me.reloadChart(tab);
    },
    reloadWeeklyGraph: function(btn){
        var me  = this;
        tab     = btn.up("#weekly");
        me.reloadChart(tab);
    },
    changeWeeklyGraph: function(d,new_val, old_val){
        var me      = this;
        var tab     = d.up("#weekly");
        tab.down("chart").getStore().getProxy().setExtraParam('day',new_val);
        me.reloadChart(tab);
    },
    reloadMonthlyGraph: function(btn){
        var me  = this;
        tab     = btn.up("#monthly");
        me.reloadChart(tab);
    },
    changeMonthlyGraph: function(d,new_val, old_val){
        var me      = this;
        var tab     = d.up("#monthly");
        tab.down("chart").getStore().getProxy().setExtraParam('day',new_val);
        me.reloadChart(tab);
    },
    reloadChart: function(tab){
        var me      = this;
        var chart   = tab.down("chart");
        chart.setLoading(true); //Mask it
        chart.getStore().load({
            scope: me,
            callback: function(records, operation, success) {
                chart.setLoading(false);
                if(success){
                    Ext.ux.Toaster.msg(
                            "Graph fetched",
                            "Graph detail fetched OK",
                            Ext.ux.Constants.clsInfo,
                            Ext.ux.Constants.msgInfo
                        );
                    //-- Show totals
                    var rawData     = chart.getStore().getProxy().getReader().rawData;
                    var totalIn     = Ext.ux.bytesToHuman(rawData.totalIn);
                    var totalOut    = Ext.ux.bytesToHuman(rawData.totalOut);
                    var totalInOut  = Ext.ux.bytesToHuman(rawData.totalInOut);
                    tab.down('#totals').update({'in': totalIn, 'out': totalOut, 'total': totalInOut });

                }else{
                    Ext.ux.Toaster.msg(
                            "Problem fetching graph",
                            "Problem fetching graph detail",
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                } 
            }
        });   
    }
});
