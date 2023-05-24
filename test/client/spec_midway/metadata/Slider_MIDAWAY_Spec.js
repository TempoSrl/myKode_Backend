"use strict";

describe("Slider",
    function () {
        var MetaPage = appMeta.MetaPage;
        var HelpForm = appMeta.HelpForm;
        var stabilize = appMeta.stabilize;
        var common = appMeta.common;
        var localResource = appMeta.localResource;
        var state;
        var helpForm;
        var ds;
        var t1, t2;
        var objrow1, objrow2, objrow3, objrow4, objrow5, objrow6, objrow7 ;
        var slider;
        var metapage;
        var origDoGet; // mock funz doGet

        // invoca la getToolBarManager per instanziare la toolbar, che poi sarà richiamata nei vari freshForm
        beforeAll(function () {
            appMeta.basePath = "base/";
            appMeta.currApp.initToolBarManager();
        });

        beforeEach(function (done) {
            jasmine.getFixtures().fixturesPath = "base/test/spec/fixtures";
            // nomi colonne
            var cName = "c_name";
            var cDec = "c_dec";
            var cDouble = "c_double";

            // costrusico ogetto stato e ds
            state = new appMeta.MetaPageState();
            ds = new jsDataSet.DataSet("temp");
            t1 = ds.newTable("table1");
            t2 = ds.newTable("table2");
            // setto le prop delle colonne per t1
            t1.setDataColumn(cName, "String");
            t1.setDataColumn(cDec, "Decimal");
            t1.setDataColumn(cDouble, "Double");

            t2.setDataColumn("notcol", "String");
            t2.setDataColumn("mycol1", "Decimal");
            t2.setDataColumn("mycol2", "String");
            t2.setDataColumn("mycol3", "DateTime");
            t2.setDataColumn("mycol4", "String");
            t2.columns["notcol"].caption = ".notcol";
            t2.columns["mycol1"].caption = "mycol1";
            t2.columns["mycol2"].caption = "mycol2";
            t2.columns["mycol3"].caption = "mycol3";
            t2.columns["mycol4"].caption = "mycol4";
            t2.columns["mycol1"].listColPos = 2;
            t2.columns["mycol2"].listColPos = 1;
            t2.columns["mycol4"].listColPos = -1;

            // aggiungo 2 righe alla t2
            objrow1 = {notcol: "not11", mycol1: 22, mycol2: "v11", mycol3:new Date("1980-10-02"), mycol4:"v14"};
            objrow2 = {notcol: "not22", mycol1: 11, mycol2: "v22", mycol3:new Date("1981-10-02"), mycol4:"v24"};
            objrow3 = {notcol: "not33", mycol1: 33, mycol2: "v33", mycol3:new Date("1982-10-02"), mycol4:"vsame"};
            objrow4 = {notcol: "not44", mycol1: 44, mycol2: "v44", mycol3:new Date("1983-10-02"), mycol4:"vsame"};
            objrow5 = {notcol: "not55", mycol1: 55, mycol2: "v55", mycol3:new Date("1984-10-02"), mycol4:"vsame"};
            objrow1 = t2.add(objrow1).current;
            objrow2 = t2.add(objrow2).current;
            objrow3 = t2.add(objrow3).current;
            objrow5 = t2.add(objrow5).current;
            objrow4 = t2.add(objrow4).current;
            t2.acceptChanges();
            t2.key(['mycol1']);

            objrow6 = {cName: "name11", cDec: 1, cDouble: 111};
            objrow7 = {cName: "name22", cDec: 2, cDouble: 222};
            objrow6 = t1.add(objrow6).current;
            objrow7 = t1.add(objrow7).current;
            t1.acceptChanges();
            state.DS = ds;
            state.meta  = new appMeta.MetaData('table1');

            // mock funzione asyn describeColumns()
            appMeta.MetaData.prototype.describeColumns = function() {
                return new $.Deferred().resolve();
            };

            // inizializzo metapage, usata in AddEvents
            metapage = new MetaPage('table2', 'def', true);
            metapage.state = state;

            // inizializzo la form
            helpForm = new HelpForm(state, "table1", "#rootelement");
            metapage.helpForm  = helpForm;
            var mainwin = '<div id="rootelement">' +
                '<div id="slider1" data-tag="table2.default" data-custom-control="slider"></div>' +
                '</div>';
            $("html").html(mainwin);
            helpForm.preScanControls();
            slider = $("#slider1").data("customController");

            origDoGet =  appMeta.getData.doGet;
            appMeta.getData.doGet = function () {
                return new $.Deferred().resolve().promise();
            }
            done();
        });

        afterEach(function () {
            appMeta.getData.doGet = origDoGet;
        });

        afterAll(function () {
            appMeta.basePath = "/";
        });



                it("slider fillControl() binded ok", function (done) {
                    // costrusico ogetto stato e ds
                    var state1 = new appMeta.MetaPageState();
                    var state2 = new appMeta.MetaPageState();
                    var ds1 = new jsDataSet.DataSet("temp1");
                    var ds2 = new jsDataSet.DataSet("temp2");
                    var t1Ds1 = ds1.newTable("table1");
                    var t2Ds2 = ds2.newTable("table2");

                    // setto le prop delle colonne per t1
                    t1Ds1.setDataColumn("key", "String");
                    t1Ds1.setDataColumn("field1", "Decimal");

                    t2Ds2.setDataColumn("key", "String");
                    t2Ds2.setDataColumn("field1", "Decimal");

                    t1Ds1.columns["key"].caption = "key_1";
                    t1Ds1.columns["field1"].caption = "field_1";
                    t2Ds2.columns["key"].caption = "key_2";
                    t2Ds2.columns["field1"].caption = "field_2";

                    //
                    var r1 = {key: "key1", field1: 21};
                    var r2 = {key: "key2", field1: 22};
                    r1 = t1Ds1.add(r1).current;
                    r2 = t1Ds1.add(r2).current;

                    var r3 = {key: "key1", field1: 11};
                    var r4 = {key: "key2", field1: 12};
                    r3 = t2Ds2.add(r3).current;
                    r4 = t2Ds2.add(r4).current;

                    // imposto la chiave
                    t1Ds1.key("key");
                    t2Ds2.key("key");
                    state1.DS = ds1;
                    state1.editedRow = r1.getRow();

                    state2.DS = ds2;
                    state2.callerState = state1;
                    state2.setInsertState();
                    state2.currentRow = r3;

                    // inizializzo metapage, usata in AddEvents

                    var  metapage2 = new MetaPage('table2', 'def', true);
                    metapage2.state = state2;
                    state2.meta  = new appMeta.MetaData('table2');
                    // inizializzo la form
                    var helpForm2 = new HelpForm(state2, "table2", "#rootelement");
                    metapage2.helpForm  = helpForm2;
                    var mainwin = '<div id="rootelement"><div id="slider1" data-tag="table2.field1" data-custom-control="slider"></div></div>';
                    $("html").html(mainwin);

                    // aggiungo stili, così a runtime li vedo
                    $("body").append('<link rel="stylesheet" href="/base/client/bower_components/bootstrap/dist/css/bootstrap.css" />');
                    $('body').append('<link rel="stylesheet" href="base/test/app/styles/app.css">');
                    helpForm2.preScanControls()
                    .then(()=>{
                        spyOn(metapage2, "showMessageOkCancel");
                        slider = $("#slider1").data("customController");
                        slider.addEvents(null, metapage2);
                        slider.fillControl($("#slider1"))
                        .then(function() {
                            expect(state2.currentRow).toBe(r3);
                            expect(slider.getValue()).toBe(11);
                            done();
                        });
                    })


                });

                it("slider getControl() binded ok", function (done) {
                    // costrusico ogetto stato e ds
                    var state1 = new appMeta.MetaPageState();
                    var state2 = new appMeta.MetaPageState();
                    var ds1 = new jsDataSet.DataSet("temp1");
                    var ds2 = new jsDataSet.DataSet("temp2");
                    var t1Ds1 = ds1.newTable("table1");
                    var t2Ds2 = ds2.newTable("table2");

                    // setto le prop delle colonne per t1
                    t1Ds1.setDataColumn("key", "String");
                    t1Ds1.setDataColumn("field1", "Decimal");

                    t2Ds2.setDataColumn("key", "String");
                    t2Ds2.setDataColumn("field1", "Decimal");

                    t1Ds1.columns["key"].caption = "key_1";
                    t1Ds1.columns["field1"].caption = "field_1";
                    t2Ds2.columns["key"].caption = "key_2";
                    t2Ds2.columns["field1"].caption = "field_2";

                    //
                    var r1 = {key: "key1", field1: 21};
                    var r2 = {key: "key2", field1: 22};
                    r1 = t1Ds1.add(r1).current;
                    r2 = t1Ds1.add(r2).current;

                    var r3 = {key: "key1", field1: 11};
                    var r4 = {key: "key2", field1: 12};
                    r3 = t2Ds2.add(r3).current;
                    r4 = t2Ds2.add(r4).current;

                    // imposto la chiave
                    t1Ds1.key("key");
                    t2Ds2.key("key");
                    state1.DS = ds1;
                    state1.editedRow = r1.getRow();

                    state2.DS = ds2;
                    state2.callerState = state1;
                    state2.setInsertState();
                    state2.currentRow = r3;

                    // inizializzo metapage, usata in AddEvents

                    var  metapage2 = new MetaPage('table2', 'def', true);
                    metapage2.state = state2;
                    state2.meta  = new appMeta.MetaData('table2');
                    // inizializzo la form
                    var helpForm2 = new HelpForm(state2, "table2", "#rootelement");
                    metapage2.helpForm  = helpForm2;
                    var mainwin = '<div id="rootelement"><div id="slider1" data-tag="table2.field1" data-custom-control="slider"></div></div>';
                    $("html").html(mainwin);

                    // aggiungo stili, così a runtime li vedo
                    $("body").append('<link rel="stylesheet" href="/base/client/bower_components/bootstrap/dist/css/bootstrap.css" />');
                    $('body').append('<link rel="stylesheet" href="/base/test/app/styles/app.css">');

                    helpForm2.preScanControls()
                    .then(()=>{
                        helpForm.lastSelected(t2Ds2, r3);

                        slider = $("#slider1").data("customController");
                        slider.addEvents(null, metapage2);
                        $('#' + slider.idRange).val(25);
                        metapage2.helpForm.getControls();
                        expect(state2.currentRow.field1).toBe(25);
                        done();
                    });
                });


    });
