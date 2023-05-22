sap.ui.define(["sap/ui/model/odata/type/Time"], function(Time) {
    "use strict";

    return {

        /**
         * Rounds the number unit value to 2 digits
         * @public
         * @param {string} sValue the number string to be rounded
         * @returns {string} sValue with 2 digits rounded
         */
        numberUnit: function(sValue) {
            if (!sValue) {
                return "";
            }
            return parseFloat(sValue).toFixed(2);
        },

        state: function(sValue) {

            var state;

            if (sValue >= 0) {
                state = 'Success';
            } else {
                state = 'Error';
            }

            return state;

        },

        icon: function(sValue) {

            var type = sValue.substr(12, sValue.lenght); //'application/pdf'

            switch (type) {
                case 'pdf':
                    type = 'sap-icon://pdf-attachment';
                    break;
                case 'jpg':
                    type = 'sap-icon://attachment-photo';
                    break;
                case 'doc':
                    type = 'sap-icon://doc-attachment';
                    break;
                case 'xls':
                    type = 'sap-icon://excel-attachment';
                    break;
                default:
                    type = 'sap-icon://pdf-attachment';
                    break;
            }

            return type;

        },

        count: function(oValue) {

            if (oValue) {
                return oValue.lenght;
            }

        },

        formatUrl: function(sCtr, sFName) {
            //Example: Anexos(ContratoFactoring='File3',Filename='teste2.pdf')/$value
            let sUrl = this.getView().getModel().sServiceUrl;
            sUrl += "/" + "Anexos(ContratoFactoring='" + sCtr + "',Filename='" + sFName + "')" + "/$value";
            return sUrl;
        },

        formatTime: function(oTime) {

            var sTime = new Time(oTime).formatValue({
                __edmType: "Edm.Time",
                ms: oTime.ms
            }, "string");

            return sTime; 

        }

    };

});