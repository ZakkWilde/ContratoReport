sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/m/MessageToast"
], function (Controller, History, formatter, MessageToast) {
    'use strict';

    return Controller.extend("zfiorictrfdrep.controller.Detail", {

        formatter: formatter,

        onInit: function () {

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("object").attachMatched(this._onRouteMatched, this);

        },
        _onRouteMatched: function (oEvent) {
            var oArgs, oView;
            oArgs = oEvent.getParameter("arguments");
            oView = this.getView();

            oView.bindElement({
                path: "/Contratos" + oArgs.objectId ,
                parameters: { expand: "ContratoToAnexos,ContratoToDocumentos" },
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function (oEvent) {
                        oView.setBusy(true);
                    },
                    dataReceived: function (oEvent) {
                        oView.setBusy(false);
                    }
                }
            });
        },
        _onBindingChange: function (oEvent) {
            // No data for the binding
            if (!this.getView().getBindingContext()) {
                this.getOwnerComponent().getRouter().getTargets().display("notFound");
            }
        },

        onFinished: function (oEvent) {

            var iTotal = oEvent.getParameter("total");
            this.getView().byId("attachment").setCount(iTotal); 
            
        },

        onUpdateFinished: function (oEvent) {

            var iTotal = oEvent.getParameter("total");
            this.getView().byId("documents").setCount(iTotal);
            
        },

        onDownloadDocuments: function (oEvent) {
			let oUploadCollection = this.getView().byId("uploadCollection"),
				aSelectedItems = oUploadCollection.getSelectedItems();
			for (var i = 0; i < aSelectedItems.length; i++) {
				oUploadCollection.downloadItem(aSelectedItems[i], true);
			}
		},

        onSelectionChange: function (oEvent) {
			let oUploadCollection = oEvent.getSource();
			if (oUploadCollection.getSelectedItems().length > 0) {
                this.getView().byId("btnDown").setEnable(true);
			} else {
                this.getView().byId("btnDown").setEnable(false);
            }
		},

        onUploadTerminated: function (oEvent) {

            MessageToast.show('Upload Terminated');
            
        },

        onNavBack: function () {
            var sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) {
                // eslint-disable-next-line sap-no-history-manipulation
                history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteWorklist", {}, true);
            }
        }

    });

});