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
let genDir = "../../src/gen/"
const { generateNamespace } = require(genDir + "generate/namespace");
const { analyzeFile } = require(genDir + "analyze");
var assert = require("assert");
const { readFile } = require(genDir + "tools/FileRW");
const { jsToC, paramGenerate } = require(genDir + "generate/param_generate");
const { cToJs, returnGenerate } = require(genDir + "generate/return_generate");
const { generateInterface } = require(genDir + "generate/interface");
const { generateFunctionAsync } = require(genDir + "generate/function_async");
const { generateFunctionDirect } = require(genDir + "generate/function_direct");
const { generateFunctionSync } = require(genDir + "generate/function_sync");

let result = {
    exportDefault: [],
    exports: [],
    declareType: [],
    declareFunction: [],
    declareNamespace: [],
    declareInterface: [],
    declareLicense: [],
}

function funcAsyncAssert() {
    let valueFi = { name: 'v1', type: 'string' };
    let value1Se = { name: 'cb', type: 'AsyncCallback<string>' };
    let funParam = { name: 'if_async', type: 4, value: [valueFi, value1Se], ret: 'string' }
    let ret = generateFunctionAsync(funParam, 'data', 'TestClass1');
    let retJson = JSON.stringify(ret);
    return retJson
}


function funcDirectAssert() {
    let valueFi = { name: 'v1', type: 'string' };
    let value1Se = { name: 'cb', type: 'AsyncCallback<string>' };
    let funParam = { name: 'if_async', type: 4, value: [valueFi, value1Se], ret: 'string' };
    let ret = generateFunctionDirect(funParam, 'data', 'TestClass1');
    let retJson = JSON.stringify(ret);
    return retJson
}

function funcSyncAssert() {
    let valueFi = { name: 'v1', type: 'string' };
    let value1Se = { name: 'cb', type: 'Callback<string>' };
    let funParam = { name: 'if_callback', type: 2, value: [valueFi, value1Se], ret: 'string' };
    let ret = generateFunctionSync(funParam, 'data', 'TestClass1');
    let retJson = JSON.stringify(ret);
    return retJson
}

function cToJsParam() {
    let value = 'uint32_t len1=a.size();\n' +
        '    for(uint32_t i=0;i<len1;i++) {\n' +
        '        napi_value tnv1 = nullptr;\n' +
        '        tnv1 = pxt->SwapC2JsUtf8(a[i].c_str());\n' +
        '        pxt->SetArrayElement(b, i, tnv1);\n' +
        '    }'
    return value
}

function cToJsParamArray() {
    let value = 'uint32_t len1=a.size();\n' +
        '    for(uint32_t i=0;i<len1;i++) {\n' +
        '        napi_value tnv1 = nullptr;\n' +
        '        tnv1 = pxt->SwapC2JsUtf8(a[i].c_str());\n' +
        '        pxt->SetArrayElement(b, i, tnv1);\n' +
        '    }'
    return value
}

function jsToCParam() {
    let value = '    uint32_t len13=pxt->GetArrayLength(b);\n' +
        '    for(uint32_t i13=0;i13<len13;i13++) {\n' +
        '        std::string tt13;\n' +
        '        pxt->SwapJs2CUtf8(pxt->GetArrayElement(b,i13), tt13);\n' +
        '        a.push_back(tt13);\n' +
        '    }'
    return value
}

function jsToCParamArray() {
    let value = '    uint32_t len14=pxt->GetArrayLength(b);\n' +
        '    for(uint32_t i14=0;i14<len14;i14++) {\n' +
        '        std::string tt14;\n' +
        '        pxt->SwapJs2CUtf8(pxt->GetArrayElement(b,i14), tt14);\n' +
        '        a.push_back(tt14);\n' +
        '    }'
    return value
}

function paramGenerateAndAssert(dataType, structOfTs) {
    param = {
        valueIn: "",
        valueOut: "",

        valueCheckout: "",
        valueFill: "",
        valuePackage: "",
        valueDefine: ""
    }
    if (null != structOfTs) {
        paramGenerate(0, "a", dataType, param, structOfTs)
    } else {
        paramGenerate(0, "a", dataType, param)
    }
    let result = JSON.stringify(param);
    return result
}

function returnGenerateAndAssert(dataType, structOfTs) {
    param = {
        valueIn: "",
        valueOut: "",

        valueCheckout: "",
        valueFill: "",
        valuePackage: "",
        valueDefine: ""
    }
    if (null != structOfTs) {
        returnGenerate(dataType, param, structOfTs)
    } else {
        returnGenerate(dataType, param)
    }
    let result = JSON.stringify(param);
    return result
}

function partOfTest() {
    it('test gen/generate/param_generate jsToC', function () {
        assert.strictEqual(jsToC("a", "b", "string"), "pxt->SwapJs2CUtf8(b, a);");

        assert.strictEqual(jsToC("a", "b", "NUMBER_TYPE_1"), "NUMBER_JS_2_C(b,NUMBER_TYPE_1,a);");
        assert.strictEqual(jsToC("a", "b", "boolean"), "BOOLEAN_JS_2_C(b,bool,a);");
        assert.strictEqual(jsToC("a", "b", "Array<string>"), jsToCParam());
        assert.strictEqual(jsToC("a", "b", "string[]"), jsToCParamArray());
    });

    it('test gen/generate/return_generate cToJs', function () {
        assert.strictEqual(cToJs("a", "string", "b", 1), "b = pxt->SwapC2JsUtf8(a.c_str());");

        ret = cToJs("a", "NUMBER_TYPE_1", "b", 1)
        assert.strictEqual(ret, "b = NUMBER_C_2_JS(pxt, a);");

        ret = cToJs("a", "boolean", "b", 1)
        assert.strictEqual(ret, "b = pxt->SwapC2JsBool(a);");

        assert.strictEqual(cToJs("a", "Array<string>", "b", 1), cToJsParam());

        assert.strictEqual(cToJs("a", "string[]", "b", 1), cToJsParamArray());
    });

}

function returnGenerateParam(correctResult) {
    let retJson = returnGenerateAndAssert("string")
    assert.strictEqual(retJson, correctResult['Generate']['returnGenerate']);

    let retJson1 = returnGenerateAndAssert("NUMBER_TYPE_1")
    assert.strictEqual(retJson1, correctResult['Generate1']['returnGenerate']);

    let retJson2 = returnGenerateAndAssert("Array<string>")
    assert.strictEqual(retJson2, correctResult['Generate2']['returnGenerate']);

    let retJson3 = returnGenerateAndAssert("Array<boolean>")
    assert.strictEqual(retJson3, correctResult['Generate3']['returnGenerate']);

    let retJson4 = returnGenerateAndAssert("[string]")
    assert.strictEqual(retJson4, correctResult['Generate4']['returnGenerate']);

    let retJson5 = returnGenerateAndAssert("[boolean]")
    assert.strictEqual(retJson5, correctResult['Generate5']['returnGenerate']);

    let retJson6 = returnGenerateAndAssert("[boolean]")
    assert.strictEqual(retJson6, correctResult['Generate6']['returnGenerate']);

    let retJson7 = returnGenerateAndAssert("GrantStatus", result.declareNamespace[0].body)
    assert.strictEqual(retJson7, correctResult['Generate7']['returnGenerate']);

    let retJson8 = returnGenerateAndAssert("HttpStatus", result.declareNamespace[0].body)
    assert.strictEqual(retJson8, correctResult['Generate8']['returnGenerate']);
}

function paramGenerateResult(correctResult) {
    let retJson = paramGenerateAndAssert("string")
    assert.strictEqual(retJson, correctResult['Generate']['ParamGenerate']);

    let retJson1 = paramGenerateAndAssert("NUMBER_TYPE_1")
    assert.strictEqual(retJson1, correctResult['Generate1']['ParamGenerate']);

    let retJson2 = paramGenerateAndAssert("Array<string>")
    assert.strictEqual(retJson2, correctResult['Generate2']['ParamGenerate']);

    let retJson3 = paramGenerateAndAssert("Array<boolean>")
    assert.strictEqual(retJson3, correctResult['Generate3']['ParamGenerate']);

    let retJson4 = paramGenerateAndAssert("[string]")
    assert.strictEqual(retJson4, correctResult['Generate4']['ParamGenerate']);

    let retJson5 = paramGenerateAndAssert("[boolean]")
    assert.strictEqual(retJson5, correctResult['Generate5']['ParamGenerate']);

    let retJson6 = paramGenerateAndAssert("GrantStatus", result.declareNamespace[0].body)
    assert.strictEqual(retJson6, correctResult['Generate6']['ParamGenerate']);

    let retJson7 = paramGenerateAndAssert("HttpStatus", result.declareNamespace[0].body)
    assert.strictEqual(retJson7, correctResult['Generate7']['ParamGenerate']);
}

describe('Generate', function () {
    var structOfTs;
    var testStr;
    var correctResult;
    before(function () {
        let data = readFile("test/unittest/result.json")
        if (data) {
            correctResult = JSON.parse(data);
        }
        structOfTs = analyzeFile("test/unittest/@ohos.input_sample.d.ts");
        result = analyzeFile("test/unittest/@ohos.input_sample.d.ts");
        testStr = readFile("test/unittest/test.txt");
    });

    it('test gen/generate/function_async generateFunctionAsync', function () {
        assert.strictEqual(funcAsyncAssert(), correctResult['Generate']['generateFunctionAsync']);
    });

    it('test gen/generate/function_direct generateFunctionDirect', function () {
        assert.strictEqual(funcDirectAssert(), correctResult['Generate']['generateFunctionDirect']);
    });

    it('test gen/generate/function_sync generateFunctionSync', function () {
        assert.strictEqual(funcSyncAssert(), correctResult['Generate']['generateFunctionSync']);
    });

    it('test gen/generate/interface generateInterface', function () {
        let ns = structOfTs.declareNamespace[0];
        let ret = generateInterface('a', 'name:string', ns);
        assert.strictEqual(JSON.stringify(ret), correctResult['Generate']['generateInterface']);
    });

    it('test gen/generate/namespace generateNamespace', function () {
        let ns = structOfTs.declareNamespace[0];
        let ret = generateNamespace(ns.name, ns.body);
        assert.strictEqual(JSON.stringify(ret), JSON.stringify(correctResult['Generate']['demo']));
    });

    partOfTest();

    it('test gen/generate/param_generate ParamGenerate', function () {
        paramGenerateResult(correctResult);
    });
    it('test gen/generate/return_generate returnGenerate', function () {
        returnGenerateParam(correctResult);
    });
});
