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
const { fun1, fun2, fun3 } = require("./out/build/Release/napitest")
var assert = require("assert");

describe('String', function () {

    it('test fun1', function () {
        let ret = fun1("1");
        assert.strictEqual(ret, '');
    });

    function abc(ret) {
        assert.strictEqual(ret, '');
    }

    it('test fun2', function () {
        fun2(['1', '2', '3', '4'], abc);
    });

    it('test fun3', function () {
        fun3({ string1: '3' }).then(abc);
    });

});

