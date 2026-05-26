/*global QUnit*/

sap.ui.define([
	"com/maintask/controller/detailedView1.controller"
], function (Controller) {
	"use strict";

	QUnit.module("detailedView1 Controller");

	QUnit.test("I should test the detailedView1 controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
