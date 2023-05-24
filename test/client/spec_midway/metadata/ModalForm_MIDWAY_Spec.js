"use strict";

describe("ModalForm",
    function () {
        var ModalForm = appMeta.ModalForm;
        var mf;
        var common = appMeta.common;

        beforeEach(function () {
            appMeta.basePath = "base/";
            
            var mainwin = '<head></head><div id="rootelement">' +
                "</div>";
            $("html").html(mainwin);
            $("head").append('<script defer src="/base/test/app/styles/fontawesome/fontawesome-all.js"></script>');
            $("body").append('<link rel="stylesheet" href="/base/client/bower_components/bootstrap/dist/css/bootstrap.css" />');
            $("body").append('<link rel="stylesheet" href="/base/test/app/styles/app.css" />');


        });

        afterEach(function () {
            expect(appMeta.Stabilizer.nesting).toBe(0);
        });

        describe("methods work",

            function () {

                it("ModalForm constructor , simple html is attached to modal",function (done) {
                    var html = "<div>Added html<div>";
                    mf = new ModalForm($("#rootelement"), html);
                    mf.show();
                    expect($(".modal .modal-body").html()).toContain(html);
                    $(".modal").find("button")[0].click();
                    appMeta.stabilize(true).then(done)
                });

                it("ModalForm constructor , complex html is attached to modal",function (done) {
                    
                    var htmlFileName =  "base/test/spec_midway/fixtures/tabTest.html";
                    
                    // carico html esterno
                    $.get(htmlFileName)
                        .done(
                            function (data) {
                                // aggancio al mio rootElement
                                mf = new ModalForm($("#rootelement"), data);
                                mf.show();
                                expect( $(".modal .modal-body").html()).toMatch("Html Test for Tab Control");
                                $(".modal").find("button")[0].click();
                                appMeta.stabilize(true).then(done)
                            })
                        .fail(
                            function (e) {
                                console.log(e);
                                expect(true).toBe(false);
                            });
                    
                });
                

            });
    });
