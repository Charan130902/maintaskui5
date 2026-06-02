sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    JSONModel,
    MessageToast,
    MessageBox
) {

    "use strict";

    return Controller.extend("com.maintask.controller.detailedView1", {

        onInit: function () {

            this._aBackupData = [];

            // Employee JSON Model
            var oEmpModel = new JSONModel({
                employees: [],
                isAdding: false
            });

            this.getView().setModel(oEmpModel, "empModel");

            // Load Employee Data
            this._readData();
        },

        // =====================================================
        // READ
        // =====================================================

        _readData: function () {

            var oEmpModel = this.getView().getModel("empModel");

            // Use the ZUI5_DEMO_SRV named model for employee operations
            this.getOwnerComponent()
                .getModel("ZUI5_DEMO_SRV")
                .read("/EmployeeDataSet", {

                    success: function (oData) {

                        var aData = oData.results || [];

                        aData.forEach(function (oItem) {
                            oItem.Editable = false;
                            oItem.New = false;
                        });

                        oEmpModel.setProperty("/employees", aData);

                    },

                    error: function () {
                        MessageBox.error("Failed to load employee data");
                    }

                });
        },

        // =====================================================
        // ADD
        // =====================================================

        onAdd: function () {

            var oModel = this.getView().getModel("empModel");
            var aEmployees = oModel.getProperty("/employees");

            this._aBackupData = JSON.parse(JSON.stringify(aEmployees));

            aEmployees.unshift({
                EMPID: "",
                NAME: "",
                LOCATION: "",
                DESIGNATION: "",
                Editable: true,
                New: true
            });

            oModel.setProperty("/employees", aEmployees);
            oModel.setProperty("/isAdding", true);

            MessageToast.show("New row added");
        },

        // =====================================================
        // EDIT
        // =====================================================

        onEdit: function () {

            var oTable = this.byId("idEmpTable");
            var oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning("Please select a row");
                return;
            }

            var oModel = this.getView().getModel("empModel");
            var sPath = oSelectedItem
                .getBindingContext("empModel")
                .getPath();

            this._aBackupData = JSON.parse(
                JSON.stringify(oModel.getProperty("/employees"))
            );

            oModel.setProperty(sPath + "/Editable", true);
            oModel.setProperty("/isAdding", true);
        },

        // =====================================================
        // SAVE
        // =====================================================

        onSave: function () {

            var oTable = this.byId("idEmpTable");
            var oSelectedItem = oTable.getSelectedItem();

            // For newly added row, select the first item
            if (!oSelectedItem) {
                oSelectedItem = oTable.getItems()[0];
            }

            var oData = oSelectedItem
                .getBindingContext("empModel")
                .getObject();

            var oPayload = {
                EMPID: oData.EMPID,
                NAME: oData.NAME,
                LOCATION: oData.LOCATION,
                DESIGNATION: oData.DESIGNATION
            };

            // Use the ZUI5_DEMO_SRV named model for employee operations
            var oODataModel = this.getOwnerComponent().getModel("ZUI5_DEMO_SRV");

            // CREATE
            if (oData.New) {

                oODataModel.create("/EmployeeDataSet", oPayload, {

                    success: function () {

                        MessageToast.show("Employee Created");

                        this.getView()
                            .getModel("empModel")
                            .setProperty("/isAdding", false);

                        this._readData();

                    }.bind(this),

                    error: function () {
                        MessageBox.error("Create failed");
                    }

                });

                // UPDATE
            } else {

                var oUpdatePayload = {
                    NAME: oData.NAME,
                    LOCATION: oData.LOCATION,
                    DESIGNATION: oData.DESIGNATION
                };

                oODataModel.update(
                    "/EmployeeDataSet('" + oData.EMPID + "')",
                    oUpdatePayload,
                    {
                        success: function () {

                            MessageToast.show("Employee Updated");

                            this.getView()
                                .getModel("empModel")
                                .setProperty("/isAdding", false);

                            this._readData();

                        }.bind(this),

                        error: function () {
                            MessageBox.error("Update failed");
                        }
                    }
                );
            }
        },

        // =====================================================
        // DELETE
        // =====================================================

        onDelete: function () {

            var oTable = this.byId("idEmpTable");
            var oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning("Please select a row");
                return;
            }

            var oData = oSelectedItem
                .getBindingContext("empModel")
                .getObject();

            this.getOwnerComponent()
                .getModel("ZUI5_DEMO_SRV")
                .remove(
                    "/EmployeeDataSet('" + oData.EMPID + "')",
                    {
                        success: function () {

                            MessageToast.show("Employee Deleted");
                            this._readData();

                        }.bind(this),

                        error: function () {
                            MessageBox.error("Delete failed");
                        }
                    }
                );
        },

        // =====================================================
        // REFRESH
        // =====================================================

        onRefresh: function () {
            this._readData();
            MessageToast.show("Data Refreshed");
        },

        // =====================================================
        // CLEAR
        // =====================================================

        onClear: function () {

            var oModel = this.getView().getModel("empModel");

            oModel.setProperty(
                "/employees",
                JSON.parse(JSON.stringify(this._aBackupData))
            );

            oModel.setProperty("/isAdding", false);

            MessageToast.show("Changes Cleared");
        }

    });
});