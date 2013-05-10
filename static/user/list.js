/* grid list */

var cash_list_model = Ext.define('cash_list_model', {
    extend: 'Ext.data.Model',
    fields: [
	{name: 'id', 		type: 'int'},
	{name: 'nmcl_id', 	type: 'int'},
	{name: 'nom', 		type: 'string'},
	{name: 'group', 	type: 'int'},
	{name: 'gname', 	type: 'string'},
	{name: 'price', 	type: 'double'},
	{name: 'qnt', 		type: 'double'},
	{name: 'amount', 	type: 'double'},
	{name: 'oper_date',	type: 'DATE', dateFormat : "Y-m-d"},//TODO ?????
	{name: 'date_edit', 	type: 'DATE', dateFormat: "Y-m-d H:i:s"},
	{name: 'org_id', 	type: 'int'},
	{name: 'oname', 	type: 'string'},
	{name: 'type', 		type: 'int'},
	{name: 'note',		type: 'string'},
	{name: 'file', 		type: 'string'},
	{name: 'uid', 		type: 'int'},
	{name: 'rate', 		type: 'double'},
	{name: 'sign', 		type: 'string'},
	{name: 'cash_type_id', 	type: 'int'},
	{name: 'cash_type', 	type: 'string'}
    ],
    idProperty: 'id'
});

var cash_list_store = Ext.create('Ext.data.Store', {
    model: 'cash_list_model',
    proxy: {
	type: 'ajax',
	url: 'ajax/list.php?'
    }
}); //cash_list_store

var cash_list_grid = Ext.create('Ext.grid.Panel', {
    store: cash_list_store,
    columns: [
	{text: "ID", 			dataIndex: 'id', 		hidden: true, 	tdCls: 'x-center-cell' },
	{text: "ID товара", 		dataIndex: 'nmcl_id', 		hidden: true , 	tdCls: 'x-center-cell'},
	{text: "Товар", 		dataIndex: 'nom', 		flex: 1, 	hideable: false},
	{text: "ID группы", 		dataIndex: 'group', 		hidden: true , 	tdCls: 'x-center-cell'},
	{text: "Группа", 		dataIndex: 'gname',		hideable: true },
	{text: "Цена", 			dataIndex: 'price',		hideable: false, renderer: price, tdCls: 'x-price-cell' },
	{text: "Кол-во", 		dataIndex: 'qnt',		hideable: false, summaryType: 'sum', tdCls: 'x-center-cell' },
	{text: "Сумма", 		dataIndex: 'amount',		hideable: true,  renderer: price_r, summaryType: 'sum' , tdCls: 'x-amount-cell' , summaryRenderer: price },
	{text: "Дата", 			dataIndex: 'oper_date',		hideable: true, renderer: dateRender, tdCls: 'x-center-cell'  },
	{text: "Дата изменения", 	dataIndex: 'date_edit', 	hidden: true,   renderer: dateTimeRender, tdCls: 'x-center-cell' },
	{text: "ID магазина", 		dataIndex: 'org_id', 		hidden: true, 	tdCls: 'x-center-cell' },
	{text: "Магазин", 		dataIndex: 'oname',		hideable: true },
	{text: "Тип", 			dataIndex: 'type', 		hidden: true , 	tdCls: 'x-center-cell'},
	{text: "Примечание", 		dataIndex: 'note', 		width: 250 },
	{text: "Файл", 			dataIndex: 'file',		hidden: true },
	{text: "ID пользователя", 	dataIndex: 'uid', 		hidden: true, 	tdCls: 'x-center-cell' },
	{text: "Курс", 			dataIndex: 'rate', 		hidden: true },
	{text: "Знак валюты", 		dataIndex: 'sign',		hidden: true },
	{text: "Тип валюты", 		dataIndex: 'cash_type_id', 	hidden: true, 	tdCls: 'x-center-cell' },
	{text: "Валюта", 		dataIndex: 'cash_type', 	hidden: true, 	tdCls: 'x-center-cell' },
	{
	      menuDisabled: true,
	      sortable: false,
	      hideable: false,
	      xtype: 'actioncolumn',
	      width: 50,
	      items: [{
		  iconCls: 'edit-cash-col',
		  tooltip: 'Редактировать запись',
		  handler: function(grid, rowIndex, colIndex) {
		      var rec = grid.getStore().getAt(rowIndex);
		      Ext.Msg.alert('edit', rec.get('id'));
		  }
	      }, {
		  iconCls: 'del-cash-col',
		  tooltip: 'Удалить запись',
		  handler: function(grid, rowIndex, colIndex) {
		      var rec = grid.getStore().getAt(rowIndex);
		      Ext.Msg.alert('del', rec.get('id'));
		  }
	      }]
	  }
    ],
    features: [{
        ftype: 'summary'
    },
    /*{
      ftype: 'filters',
      encode: true,
      local: true,
      autoReload: false,
      filters: [{dataIndex: 'id', 	type: 'int'},
	{dataIndex: 'nmcl_id', 		type: 'int'},
	{dataIndex: 'nom', 		type: 'string'},
	{dataIndex: 'group', 		type: 'int'},
	{dataIndex: 'gname', 		type: 'string'},
	{dataIndex: 'price', 		type: 'double'},
	{dataIndex: 'qnt', 		type: 'double'},
	{dataIndex: 'amount', 		type: 'double'},
	{dataIndex: 'oper_date',	type: 'DATE'},
	{dataIndex: 'date_edit', 	type: 'DATE'},
	{dataIndex: 'org_id', 		type: 'int'},
	{dataIndex: 'oname', 		type: 'string'},
	{dataIndex: 'type', 		type: 'int'},
	{dataIndex: 'note',		type: 'string'},
	{dataIndex: 'file', 		type: 'string'},
	{dataIndex: 'uid', 		type: 'int'},
	{dataIndex: 'rate', 		type: 'double'},
	{dataIndex: 'sign', 		type: 'string'},
	{dataIndex: 'cash_type_id', 	type: 'int'},
	{dataIndex: 'cash_type', 	type: 'string'}]
    }*/],
    region:'center'
}); //cash_list_grid

var loadMask_cash_list_grid = new Ext.LoadMask(cash_list_grid, {msg:'Загрузка списка операций...', store: cash_list_store});



/* panel with grid */
var cash_list_from_date =
{
    xtype: 'datefield',
    startDay:1,
    fieldLabel: 'Период',
    name: 'cash_list_from_date',
    id: 'cash_list_from_date',
    value: new Date((new Date).getTime() - (3600000*24*7)),
    labelWidth: 55,
    format: "Y-m-d",
    maxValue: new Date(),
    width: 160,
    onChange: listRefresh
}; // cash_list_from_date


var cash_list_to_date =
{
    xtype: 'datefield',
    fieldLabel: 'по',
    startDay:1,
    name: 'cash_list_to_date',
    id: 'cash_list_to_date',
    labelWidth: 20,
    format: "Y-m-d",
    value: new Date(),
    width: 120,
    onChange: listRefresh
}; // cash_list_to_date

function listRefresh() {
  cash_list_store.proxy.url = "ajax/list.php?from=" + Ext.Date.format(Ext.getCmp('cash_list_from_date').getValue(),'Y-m-d') +
					    "&to=" + Ext.Date.format(Ext.getCmp('cash_list_to_date').getValue(),'Y-m-d');
  cash_list_store.load();

  setAnkhor();
}

/*var cash_list_refresh =
{
	xtype: 'button',
	text: 'Обновить',
	icon: "static/ext/resources/themes/images/default/grid/refresh.gif",
	tooltip: 'Перегрузить список с новыми параметрами',
	border: true,
      	cls: "x-btn-default-small",
	handler : listRefresh
}*/

var cash_list_filter = {
    xtype:      'checkboxfield',
    boxLabel  : 'Расширенный поиск',
    name      : 'cash_list_filter',
    inputValue: '0',
    id        : 'cash_list_filter',
    onChange: function(newVal, oldVal) {
      if(newVal) {
	cash_list_panel.items.items[1].show();
      } else {
	cash_list_panel.items.items[1].hide();
      }
      listRefresh();
    } //onChange
}; //cash_list_filter

var cash_list_edit_btn_add =
{
	xtype: 'button',
	text: 'Добавить',
	icon: "static/ext/resources/themes/images/default/dd/drop-add.gif",
	handler : function (){
		loadScript('static/user/add.js', function() {
		  cash_list_add.show();
		});
	}
};

var cash_list_tb = {
      xtype: 'toolbar',
      dock: 'top',
      ui: 'footer',
      items: [cash_list_from_date, " ", cash_list_to_date, " ", cash_list_filter,'->', cash_list_edit_btn_add],
      region: 'north',
      id: "cash_list_tb",
}; //cash_list_tb

var cash_list_tb_filter = {
      xtype: 'toolbar',
      dock: 'top',
      ui: 'footer',
      items: ["В разработке"],
      region: 'north'
}; //cash_list_tb


var cash_list_panel = Ext.create('Ext.Panel', {
    frame: true,
    layout: 'border',
    collapsible: false,
    title: 'Операции',
    height: Ext.getBody().getHeight() - 50,
    header: true,
    items: [cash_list_tb,cash_list_tb_filter, cash_list_grid],
    listeners: {
	render: function(){
	  cash_list_panel.items.items[1].hide();
	}
    }

});//cash_list_panel