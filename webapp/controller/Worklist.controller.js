sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "../model/formatter",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/FilterType",
        'sap/ui/export/Spreadsheet',
        'sap/ui/export/library',
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/odata/v2/ODataModel",
        "sap/m/MessageToast",
        'sap/ui/model/Sorter',
        'sap/ui/core/Fragment',
        'sap/ui/Device'
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function(Controller, formatter, Filter, FilterOperator, FilterType, Spreadsheet, library, JSONModel, ODataModel, MessageToast, Sorter, Fragment, Device) {
        "use strict";

        var EdmType = library.EdmType;

        return Controller.extend("zfiorictrfdrep.controller.Worklist", {

            formatter: formatter,

            onInit: function() {

                this._mViewSettingsDialogs = {};

            },
            onNavBack: function() {
                // eslint-disable-next-line sap-no-history-manipulation
                history.go(-1);
            },

            onSearch: function(oEvent) {
                if (oEvent.getParameters().refreshButtonPressed) {
                    // Search field's 'refresh' button has been pressed.
                    // This is visible if you select any main list item.
                    // In this case no new search is triggered, we only
                    // refresh the list binding.
                    this.onRefresh();
                } else {
                    var aTableSearchState = [];
                    var sQuery = oEvent.getParameter("query");

                    if (sQuery && sQuery.length > 0) {
                        aTableSearchState = [new Filter("Descricao", FilterOperator.Contains, sQuery)];
                    }
                    this._applySearch(aTableSearchState);
                }

            },

            _applySearch: function(aTableSearchState) {

                var oTable = this.getView().byId("table"),
                    oViewModel = this.getView().getModel();
                oTable.getBinding("items").filter(aTableSearchState, "Application");

            },

            getViewSettingsDialog: function(sDialogFragmentName) {
                var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

                if (!pDialog) {
                    pDialog = Fragment.load({
                        id: this.getView().getId(),
                        name: sDialogFragmentName,
                        controller: this
                    }).then(function(oDialog) {
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        return oDialog;
                    });
                    this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
                }
                return pDialog; 
            },

            handleSortButtonPressed: function() {

                var that = this;
                
                this.getViewSettingsDialog("zfiorictrfdrep.view.SortDialog")
                    .then(function(oViewSettingsDialog) {
                        that.getView().addDependent(oViewSettingsDialog);
                        oViewSettingsDialog.open();
                    });
            },

            handleSortDialogConfirm: function(oEvent) {
                var oTable = this.getView().byId("table"),
                    mParams = oEvent.getParameters(),
                    oBinding = oTable.getBinding("items"),
                    sPath,
                    bDescending,
                    aSorters = [];

                sPath = mParams.sortItem.getKey();
                bDescending = mParams.sortDescending;
                aSorters.push(new Sorter(sPath, bDescending));

                // apply the selected sort and group settings
                oBinding.sort(aSorters);
            },

            onRefresh: function() {
                var oTable = this.byId("table");
                oTable.getBinding("items").refresh();
            },

            onItemPress: function(oEvent) {
                // The source is the list item that got pressed
                this._showObject(oEvent.getSource());
            },

            _showObject: function(oItem) {
                this.getOwnerComponent().getRouter().navTo("object", {
                    objectId: oItem.getBindingContext().getPath().substring("/Contratos".length)
                });
            },

            onChange: function(oEvent) {

                var aFilters = [];
                var oList = this.getView().byId("table");
                var date = new Date();

                if (oEvent.getSource().getState()) {

                    var oFilter = new Filter("DataFim", FilterOperator.GT, date);
                    aFilters.push(oFilter);
                    oList.getBinding("items").filter(aFilters, FilterType.Application);

                } else {

                    aFilters = [];
                    oList.getBinding("items").filter(aFilters, FilterType.Application);

                }

            },

            onDownload: function(oEvent) {

                var aCols, oSettings, oSheet;

                var oBinding = this.getView().byId("table").getBinding("items");

                if (!oBinding) {
                    MessageToast.show("Lista vazia!");
                    return;
                }

                aCols = this.createColumnConfig();

                oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: {
                        type: "OData",
                        useBatch: true,
                        serviceUrl: "/sap/opu/odata/sap/ZFIORI_CONTRATO_FD_REPORT_SRV/",
                        headers: oBinding.getModel().getHeaders(),
                        dataUrl: oBinding.getDownloadUrl(),
                        count: oBinding.getLength()
                    },
                    fileName: 'Contratos'
                };

                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function() {
                    oSheet.destroy();
                });
            },

            createColumnConfig: function() {
                return [{
                        label: 'Código Fornecedor',
                        property: 'Fornecedor',
                        type: EdmType.String
                    },
                    {
                        label: 'Fornecedor',
                        property: 'FornName',
                        type: EdmType.String
                    },
                    {
                        label: 'Contrato',
                        property: 'ContratoFactoring',
                        width: '15'
                    },
                    {
                        label: 'Descrição Contrato',
                        property: 'Descricao',
                        width: EdmType.String
                    },
                    {
                        label: 'Inicio',
                        property: 'DataInicio',
                        type: EdmType.Date,
                        format: 'dd-mm-yyyy'
                    },
                    {
                        label: 'Fim',
                        property: 'DataFim',
                        type: EdmType.Date,
                        format: 'dd-mm-yyyy'
                    },
                    {
                        label: 'Código Fornecedor Factoring',
                        property: 'FornecedorDivergente',
                        type: EdmType.String
                    },
                    {
                        label: 'Fornecedor Factoring',
                        property: 'FornDivName',
                        type: EdmType.String
                    }
                ];
            },

            onUpdateFinished: function(oEvent) {
                // update the worklist's object counter after the table update
                var sTitle, sTitleN,
                    oTable = oEvent.getSource(),
                    iTotalItems = oEvent.getParameter("total");
                // only update the counter if the length is final and
                // the table is not empty
                if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {

                    var oText = this.getView().byId("title");

                    sTitle = this.getView().getModel("i18n").getResourceBundle().getText("sContrato");
                    sTitleN = sTitle + " (" + iTotalItems + ")";
                    oText.setText(sTitleN);
                }

            }
        });
    });