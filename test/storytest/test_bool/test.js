/*
* Copyright (c) 2022 Shenzhen Kaihong Digital Industry Development Co., Ltd. 
* Licensed under the Apache License, Version 2.0 (the "License"); 
* you may not use this file except in compliance with the License. 
* You may obtain a copy of the License at 
*
* http://www.apache.org/licenses/LICENSE-2.0 
*
* Unless required by applicable law or agreed to in writing, software 
* distributed under the License is distributed on an "AS IS" BASIS, 
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
* See the License for the specific language governing permissions and 
* limitations under the License. 
*/
const test = require("./out/build/Release/napitest")
var assert = require("assert");

describe('boolean', function () {
    it('test fun1', function () {
        let ret = test.fun1(true);
        assert.deepStrictEqual(ret, false);
    });

    it('test fun2', function () {
        let ret = test.fun2(true, [true, false]);
        assert.deepStrictEqual(ret, []);
    });

    it('test fun3', function () {
        let ret = test.fun3([true, false], false);
        assert.deepStrictEqual(ret, []);
    });

    it('test fun4', function () {
        let ret = test.fun4({ 'isTrue': true, 'isExit': false });
        assert.deepStrictEqual(ret, false);
    });

    it('test fun5', function () {
        let ret = test.fun5({ 'isTrue': true, 'isExit': false }, true);
        assert.deepStrictEqual(ret, false);
    });

    function asynFun1(err, ret) {
        assert.strictEqual(err.code, 0)
        assert.deepStrictEqual(ret, false)
    }

    function def1(ret) {
        assert.deepStrictEqual(ret, false);
    }

    it('test fun6', function () {
        test.fun6(15, asynFun1);
        test.fun6(15).then(def1);
    });

    it('test fun6', function () {
        let promiseObj = test.fun6(15);
        promiseObj.then(ret => { def1(ret) });
    });
});


describe('boolean', function () {
    function asynFun2(err, ret) {
        assert.deepStrictEqual(err.code, 0)
        assert.deepStrictEqual(ret, [])
    }

    function def2(ret) {
        assert.deepStrictEqual(ret, []);
    }

    it('test fun7', function () {
        test.fun7(15, asynFun2);
        test.fun7(15).then(def2);
    });

    it('test fun7', function () {
        let promiseObj = test.fun7(15);
        promiseObj.then(ret => { def2(ret) });
    });

    function cb1(ret) {
        assert.deepStrictEqual(ret, false)
    }

    it('test fun9', function () {
        test.fun9(15, cb1);
    });

    it('test fun10', function () {
        let ret = test.fun10(
            { age: true, height: [false, false], width: [true, true] });
        assert.deepStrictEqual(typeof ret, 'object');
        assert.strictEqual(ret.age, false)
        assert.deepStrictEqual(ret.height, [])
        assert.deepStrictEqual(ret.width, [])
    });
});
