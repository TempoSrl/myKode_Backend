/* globals jasmine */
/* jshint node: true */
/* jshint jasmine: true */
'use strict';


var $q = require('../../client/components/metadata/jsDataQuery');
var mSel = require('../../src/jsMultiSelect');
var Select = mSel.Select;
var groupSelect = mSel.groupSelect;
var groupSelectStep = mSel.groupSelectStep;
var MultiCompare = mSel.MultiCompare;

/**
 * @method  OptimizedMultiCompare
 * @return OptimizedMultiCompare
 */
var OptimizedMultiCompare = mSel.OptimizedMultiCompare;
var _ = require('lodash');
const {v4: uuidv4} = require("uuid");
const mySqlDriver = require("../../src/jsMySqlDriver");

describe('multiSelect', function () {



    describe('data structure', function () {
        it('Select should be a function', function () {
            expect(Select).toEqual(jasmine.any(Function));
        });

        it('groupSelect should be a function', function () {
            expect(groupSelect).toEqual(jasmine.any(Function));
        });

        it('MultiCompare should be a function', function () {
            expect(MultiCompare).toEqual(jasmine.any(Function));
        });

        it('OptimizedMultiCompare should be a function', function () {
            expect(MultiCompare).toEqual(jasmine.any(Function));
        });
        it('groupSelectStep should be a function', function () {
            expect(groupSelectStep).toEqual(jasmine.any(Function));
        });
        it('groupSelect should be a function', function () {
            expect(groupSelect).toEqual(jasmine.any(Function));
        });

    });

    describe('MultiCompare', function () {

        it('new MultiCompare should return an object', function () {
            var mc = new MultiCompare(['a', 'b', 'c'], [1, 2, 3]);
            expect(mc).toEqual(jasmine.any(Object));
        });

        it('sameFieldsAs should compare keys', function () {
            var mc1 = new MultiCompare(['a', 'b', 'c'], [1, 2, 3]),
                mc2 = new MultiCompare(['a', 'b', 'c'], [3, 4, 5]),
                res = mc1.sameFieldsAs(mc2);
            expect(res).toBe(true);
        });

        it('sameFieldsAs should compare keys', function () {
            var mc1 = new MultiCompare(['a', 'b', 'c'], [1, 2, 3]),
                mc2 = new MultiCompare(['a', 'b1', 'c'], [3, 4, 5]),
                res = mc1.sameFieldsAs(mc2);
            expect(res).toBe(false);
        });

    });

    describe('OptimizedMultiCompare', function () {
        it('new MultiCompare should return an object', function () {
            var mc1 = new MultiCompare(['a', 'b', 'c'], [1, 2, 3]),
                omc = new OptimizedMultiCompare(mc1);
            expect(omc).toEqual(jasmine.any(Object));
        });

        it('OptimizedMultiCompare.isMultiValue false on simple comparers', function () {
            var mc1 = new MultiCompare(['a', 'b', 'c'], [1, 2, 3]),
                omc = new OptimizedMultiCompare(mc1);
            expect(omc.isMultiValue()).toBeFalsy();
        });

        it('OptimizedMultiCompare sameFieldsAs returns true if same fields', function () {
            var mc1 = new MultiCompare(['a', 'b', 'c'], [1, 2, 3]),
                mc2 = new MultiCompare(['a', 'b', 'c'], [1, 3, 3]),
                omc1 = new OptimizedMultiCompare(mc1),
                omc2 = new OptimizedMultiCompare(mc2);
            expect(omc1.sameFieldsAs(omc2)).toBeTruthy();
        });

        it('OptimizedMultiCompare sameFieldsAs returns false if different fields', function () {
            var mc1 = new MultiCompare(['a', 'b', 'c'], [1, 2, 3]),
                mc2 = new MultiCompare(['a', 'd', 'c'], [1, 3, 3]),
                omc1 = new OptimizedMultiCompare(mc1),
                omc2 = new OptimizedMultiCompare(mc2);
            expect(omc1.sameFieldsAs(omc2)).toBeFalsy();
        });

        it('OptimizedMultiCompare sameFieldsAs returns false if subset fields', function () {
            var mc1 = new MultiCompare(['a', 'b'], [1, 2]),
                mc2 = new MultiCompare(['a', 'b', 'c'], [1, 3, 3]),
                omc1 = new OptimizedMultiCompare(mc1),
                omc2 = new OptimizedMultiCompare(mc2);
            expect(omc1.sameFieldsAs(omc2)).toBeFalsy();
            expect(omc2.sameFieldsAs(omc1)).toBeFalsy();
        });

        it('OptimizedMultiCompare hasValue returns true on simple comparators', function () {
            var mc1 = new MultiCompare(['a', 'b'], [1, 2]),
                omc1 = new OptimizedMultiCompare(mc1);
            expect(omc1.hasValue(1, 0)).toBeTruthy();
            expect(omc1.hasValue(2, 1)).toBeTruthy();
            expect(omc1.hasValue(3, 1)).toBeFalsy();
        });

        it('OptimizedMultiCompare joinWith returns true if comparers equal', function () {
            var mc1 = new MultiCompare(['a', 'b', 'c'], [1, 3, 4]),
                mc2 = new MultiCompare(['a', 'b', 'c'], [1, 3, 4]),
                omc1 = new OptimizedMultiCompare(mc1),
                omc2 = new OptimizedMultiCompare(mc2);
            expect(omc1.joinWith(omc2)).toBeTruthy();
            expect(omc1.isMultiValue()).toBeFalsy();
        });

        it('OptimizedMultiCompare joinWith returns true if comparers differs on a single field', function () {
            var mc1 = new MultiCompare(['a', 'b', 'c'], [1, 2, 4]),
                mc2 = new MultiCompare(['a', 'b', 'c'], [1, 3, 4]),
                omc1 = new OptimizedMultiCompare(mc1),
                omc2 = new OptimizedMultiCompare(mc2);
            expect(omc1.joinWith(omc2)).toBeTruthy();
            expect(omc1.isMultiValue()).toBeTruthy();
        });

        it('OptimizedMultiCompare joinWith returns false if comparers differs on different fields (multivalue)', function () {
            var mc1 = new MultiCompare(['a', 'b', 'c'], [1, 2, 4]),
                mc2 = new MultiCompare(['a', 'b', 'c'], [1, 3, 4]),
                mc3 = new MultiCompare(['a', 'b', 'c'], [1, 5, 5]),
                mc4 = new MultiCompare(['a', 'b', 'c'], [1, 2, 5]),
                omc1 = new OptimizedMultiCompare(mc1),
                omc2 = new OptimizedMultiCompare(mc2),
                omc3 = new OptimizedMultiCompare(mc3),
                omc4 = new OptimizedMultiCompare(mc4);
            expect(omc1.joinWith(omc2)).toBeTruthy();
            expect(omc1.joinWith(omc3)).toBeFalsy();
            expect(omc1.joinWith(omc4)).toBeFalsy();
        });


        it('OptimizedMultiCompare joinWith returns true if comparers differs on a single field (also on multivalue)', function () {
            var mc1 = new MultiCompare(['a', 'b', 'c'], [1, 2, 4]),
                mc2 = new MultiCompare(['a', 'b', 'c'], [1, 3, 4]),
                mc3 = new MultiCompare(['a', 'b', 'c'], [1, 5, 4]),
                mc4 = new MultiCompare(['a', 'b', 'c'], [1, 6, 4]),
                omc1 = new OptimizedMultiCompare(mc1),
                omc2 = new OptimizedMultiCompare(mc2),
                omc3 = new OptimizedMultiCompare(mc3),
                omc4 = new OptimizedMultiCompare(mc4);
            expect(omc1.joinWith(omc2)).toBeTruthy();
            expect(omc1.joinWith(omc3)).toBeTruthy();
            expect(omc1.joinWith(omc4)).toBeTruthy();
            expect(omc1.isMultiValue()).toBeTruthy();
        });

        it('OptimizedMultiCompare joinWith returns false if subset fields', function () {
            var mc1 = new MultiCompare(['a', 'b'], [1, 2]),
                mc2 = new MultiCompare(['a', 'b', 'c'], [1, 3, 3]),
                omc1 = new OptimizedMultiCompare(mc1),
                omc2 = new OptimizedMultiCompare(mc2);
            expect(omc1.joinWith(omc2)).toBeFalsy();
            expect(omc2.joinWith(omc1)).toBeFalsy();
        });

        it('getFilter() should get a working function', function () {
            var mc1 = new MultiCompare(['a', 'b'], [1, 2]),
                mc2 = new MultiCompare(['a', 'b', 'c'], [1, 3, 3]),
                mc3 = new MultiCompare(['b'], [2]),
                omc1 = new OptimizedMultiCompare(mc1),
                omc2 = new OptimizedMultiCompare(mc2),
                omc3 = new OptimizedMultiCompare(mc3),
                f1 = omc1.getFilter(),
                f2 = omc2.getFilter(),
                f3 = omc3.getFilter();
            expect(f1).toEqual(jasmine.any(Function));
            expect(f2).toEqual(jasmine.any(Function));
            expect(f3).toEqual(jasmine.any(Function));
            var data = [
                {a: 1, b: 3, c: 4},
                {a: 1, b: 2, c: 3},
                {a: 2, b: 2, c: 3},
                {a: 1, b: 3, c: 1},
                {a: 1, b: 2, d: 4}
            ];
            var filtered1 = _.filter(data, f1),
                filtered2 = _.filter(data, f2),
                filtered3 = _.filter(data, f3);
            expect(filtered1.length).toBe(2);
            expect(filtered2.length).toBe(0);
            expect(filtered3.length).toBe(3);

        });
    });


    describe('Select', function () {

        it('Select() should return an object and set columns', function () {
            expect(new Select()).toEqual(jasmine.any(Object));
            expect(new Select().columns).toBe('*');
            expect(new Select('a,b').columns).toBe('a,b');
        });

        it('Select() should have a null filter', function () {
            expect(new Select().getFilter()).toEqual(null);
        });


        it('where should set a filter', function () {
            var filter = $q.eq('a', 1),
                sel = new Select().where(filter);
            expect(sel.getFilter()).toBe(filter);
            expect(sel.isOptimized).toBe(false);
        });

        it('MultiCompare should set a filter', function () {
            var mc = new MultiCompare(['a', 'b'], [1, 2]),
                sel = new Select().multiCompare(mc);
            expect(sel.getFilter()).toEqual(jasmine.any(Function));
            expect(sel.isOptimized).toBe(true);
        });


        it('from() should set tableName and default alias', function () {
            expect(new Select().from('Table').tableName).toBe('Table');
            expect(new Select().from('Table').alias).toBe('Table');
        });

        it('intoTable() should set alias', function () {
            expect(new Select().from('Table').intoTable('anotherTable').alias).toBe('anotherTable');
            expect(new Select().intoTable('anotherTable').from('Table').alias).toBe('anotherTable');
        });

        it('orderBy() should set sorting', function () {
            expect(new Select().from('Table').orderBy('a,b').sorting).toBe('a,b');
        });

        it('getTop() should set top', function () {
            expect(new Select().from('Table').top('10').getTop()).toBe('10');
        });

        it('canAppend() compare tableName and alias (equal)', function () {
            var sel1 = new Select().from('Table').intoTable('anotherTable'),
                sel2 = new Select().intoTable('anotherTable').from('Table');
            expect(sel1.canAppendTo(sel2)).toBeTruthy();
        });

        it('canAppend() compare tableName and alias (alias different)', function () {
            var sel1 = new Select().from('Table'),
                sel2 = new Select().intoTable('anotherTable').from('Table');
            expect(sel1.canAppendTo(sel2)).toBeFalsy();
        });

        it('canAppend() compare tableName and alias (alias different and one table undefined', function () {
            var sel1 = new Select().from('Table'),
                sel3 = new Select().intoTable('anotherTable');
            expect(sel1.canAppendTo(sel3)).toBeFalsy();
        });

        it('canAppend() compare tableName and alias (alias equals one table undefined)', function () {
            var sel2 = new Select().intoTable('anotherTable').from('Table'),
                sel3 = new Select().intoTable('anotherTable');
            expect(sel2.canAppendTo(sel3)).toBeFalsy();
        });


        it('optimizedAppendTo should return false if one of the two  table is not optimized', function () {
            var filter = $q.eq('a', 1),
                selFilter = new Select().where(filter),
                mc = new MultiCompare(['a'], [1]),
                selMc = new Select().multiCompare(mc);
            expect(selFilter.optimizedAppendTo(selMc)).toBeFalsy();
            expect(selMc.optimizedAppendTo(selFilter)).toBeFalsy();
        });

        it('optimizedAppendTo should return false if one of the two  table is not optimized', function () {
            var
                mc1 = new MultiCompare(['a'], [1]),
                mc2 = new MultiCompare(['b'], [1]),
                selMc1 = new Select().multiCompare(mc1),
                selMc2 = new Select().multiCompare(mc2);
            spyOn(selMc1.omc, 'joinWith').and.callThrough();
            spyOn(selMc2.omc, 'joinWith').and.callThrough();
            expect(selMc1.optimizedAppendTo(selMc2)).toBeFalsy();
            expect(selMc1.omc.joinWith).toHaveBeenCalledWith(selMc2.omc);
            expect(selMc2.omc.joinWith).not.toHaveBeenCalled();
        });

        it('optimizedAppendTo should return true if a merge is possible', function () {
            var
                mc1 = new MultiCompare(['a'], [1]),
                mc2 = new MultiCompare(['a'], [2]),
                selMc1 = new Select().multiCompare(mc1),
                selMc2 = new Select().multiCompare(mc2);
            spyOn(selMc1.omc, 'joinWith').and.callThrough();
            spyOn(selMc2.omc, 'joinWith').and.callThrough();
            expect(selMc1.optimizedAppendTo(selMc2)).toBeTruthy();
            expect(selMc1.omc.joinWith).toHaveBeenCalledWith(selMc2.omc);
            expect(selMc2.omc.joinWith).not.toHaveBeenCalled();
        });

        it('appendTo should transform optimized select into not-optimized', function () {
            var
                mc1 = new MultiCompare(['a'], [1]),
                mc2 = new MultiCompare(['a'], [2]),
                selMc1 = new Select().multiCompare(mc1),
                selMc2 = new Select().multiCompare(mc2),
                saveOmc1 = selMc1.omc,
                saveOmc2 = selMc2.omc;
            spyOn(saveOmc1, 'joinWith').and.callThrough();
            spyOn(saveOmc2, 'joinWith').and.callThrough();
            spyOn(saveOmc1, 'getFilter').and.callThrough();
            spyOn(saveOmc2, 'getFilter').and.callThrough();
            spyOn($q, 'or').and.callThrough();
            selMc1.appendTo(selMc2);

            expect(saveOmc1.joinWith).not.toHaveBeenCalled();
            expect(saveOmc2.joinWith).not.toHaveBeenCalled();
            expect(saveOmc1.getFilter).toHaveBeenCalled();
            expect(saveOmc2.getFilter).toHaveBeenCalled();
            expect(saveOmc2.getFilter).toHaveBeenCalled();
            expect($q.or).toHaveBeenCalled();

            expect(selMc1.isOptimized).toBeFalsy();
            expect(selMc1.omc).toBeNull();
            expect(selMc2.omc).toBe(saveOmc2);
        });
    });

    describe('groupSelectStep', function () {
        //simple function that groups together strings starting with same letter
        function StubObj(val) {
            this.value = val;
        }

        StubObj.prototype = {
            constructor: StubObj,
            joinFun: function (other) {
                if (other.value[0] === this.value[0]) {
                    this.value += other.value;
                    return true;
                }
                return false;
            }
        };


        it('should group basing on join function (1)', function () {
            var list = _.map(['a1', 'b1', 'b2', 'a3', 'a5', 'c1'], function (el) {
                    return new StubObj(el);
                }),
                res = groupSelectStep(list, 'joinFun');
            expect(_.map(res, 'value')).toEqual(['a1a3a5', 'b1b2', 'c1']);
        });

        it('should group basing on join function (2)', function () {
            var inputList = ['q0', 'a1', 'b1', 'b2', 'a3', 'a5', 'c1', 'c2', 'c3', 'c4', 'd1'],
                list = _.map(inputList, function (el) {
                    return new StubObj(el);
                }),
                res = groupSelectStep(list, 'joinFun');
            expect(_.map(res, 'value')).toEqual(['q0', 'a1a3a5', 'b1b2', 'c1c2c3c4', 'd1']);

        });

    });

    describe('groupSelectStep', function () {

        //stub a Select. isOptimized is set when first letter is uppercase
        function StubObj(val) {
            this.value = val;
            this.isOptimized = val[0] === val[0].toUpperCase();
        }

        StubObj.prototype = {
            constructor: StubObj,
            //optimizedAppendTo is emulated appending strings where first letter is equal
            optimizedAppendTo: function (other) {
                if (other.value[0] === this.value[0]) {
                    this.value += other.value;
                    return true;
                }
                return false;
            },
            //appendTo is emulated joining strings with a ':' separator and putting isOptimized to false
            appendTo: function (other) {
                if (other.value[0].toUpperCase() === this.value[0].toUpperCase()) {
                    this.value += ':' + other.value;
                    this.isOptimized = false;
                    return true;
                }
                return false;
            }
        };

        it('groupSelect test set 1', function () {
            var inputList = ['q0', 'A1', 'B1', 'B2', 'a3', 'A5', 'c1', 'C2', 'C3', 'c4', 'd1'],
                list = _.map(inputList, function (el) {
                    return new StubObj(el);
                }),
                res = groupSelect(list);
            expect(_.map(res, 'value')).toEqual(['A1A5:a3', 'B1B2', 'C2C3:c1:c4', 'q0', 'd1']);

        });

        it('groupSelect test set 3', function () {
            var inputList = ['q0', 'a1', 'b1', 'b2', 'a3', 'A5', 'c1', 'c2', 'c3', 'C4', 'd1'],
                list = _.map(inputList, function (el) {
                    return new StubObj(el);
                }),
                res = groupSelect(list);
            expect(_.map(res, 'value')).toEqual(['A5:a1:a3', 'C4:c1:c2:c3', 'q0', 'b1:b2', 'd1']);
        });

        it('groupSelect test set 3', function () {
            var inputList = ['q0', 'a1', 'b1', 'b2', 'a3', 'a5', 'c1', 'c2', 'c3', 'c4', 'd1'],
                list = _.map(inputList, function (el) {
                    return new StubObj(el);
                }),
                res = groupSelect(list);
            expect(_.map(res, 'value')).toEqual(['q0', 'a1:a3:a5', 'b1:b2', 'c1:c2:c3:c4', 'd1']);
        });

        it('groupSelect should call both appendTo and  optimizedAppendTo if there are optimized select', function () {
            var inputList = ['q0', 'a1', 'b1', 'b2', 'a3', 'A5', 'c1', 'c2', 'c3', 'C4', 'd1'],
                list = _.map(inputList, function (el) {
                    return new StubObj(el);
                });

            spyOn(StubObj.prototype, 'appendTo').and.callThrough();
            spyOn(StubObj.prototype, 'optimizedAppendTo').and.callThrough();

            groupSelect(list);

            expect(StubObj.prototype.appendTo).toHaveBeenCalled();
            expect(StubObj.prototype.optimizedAppendTo).toHaveBeenCalled();
        });

        it('groupSelect should not call optimizedAppendTo if there is no optimized Select', function () {
            //all lower case so they simulates isOptimized=false
            var inputList = ['q0', 'a1', 'b1', 'b2', 'a3', 'a5', 'c1', 'c2', 'c3', 'c4', 'd1'],
                list = _.map(inputList, function (el) {
                    return new StubObj(el);
                });

            spyOn(StubObj.prototype, 'appendTo').and.callThrough();
            spyOn(StubObj.prototype, 'optimizedAppendTo').and.callThrough();

            groupSelect(list);

            expect(StubObj.prototype.appendTo).toHaveBeenCalled();
            expect(StubObj.prototype.optimizedAppendTo).not.toHaveBeenCalled();

        });


        it('groupSelect should call appendTo even if  Select are all optimized', function () {
            //all lower case so they simulates isOptimized=false
            var inputList = ['Q0', 'A1', 'B1', 'B2', 'B3', 'B5', 'C1', 'C2', 'C3', 'C4', 'D1'],
                list = _.map(inputList, function (el) {
                    return new StubObj(el);
                });

            spyOn(StubObj.prototype, 'appendTo').and.callThrough();
            spyOn(StubObj.prototype, 'optimizedAppendTo').and.callThrough();

            groupSelect(list);

            expect(StubObj.prototype.appendTo).toHaveBeenCalled();
            expect(StubObj.prototype.optimizedAppendTo).toHaveBeenCalled();

        });
    });


});
