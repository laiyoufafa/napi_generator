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
const { generateFunctionDirect } = require("./function_direct");
const { generateFunctionSync } = require("./function_sync");
const { generateFunctionAsync } = require("./function_async");
const { generateInterface } = require("./interface");
const { generateClass } = require("./class");
const { FuncType, InterfaceList } = require("../tools/common");
const { generateEnum } = require("./enum");

//生成module_middle.cpp、module.h、module.cpp
function generateNamespace(name, data, inNamespace = "") {
    let implH = ""
    let implCpp = ""
    let middleFunc = ""
    let middleInit = ""
    middleInit += formatMiddleInit(inNamespace, name)
    InterfaceList.push(data.interface)
    for (let i in data.interface) {
        let ii = data.interface[i]
        let result = generateInterface(ii.name, ii.body, inNamespace + name + "::")
        middleFunc += result.middleBody
        implH += result.implH
        implCpp += result.implCpp
        middleInit += result.middleInit
    }
    for (let i in data.class) {
        let ii = data.class[i]
        let result = generateClass(ii.name, ii.body, inNamespace + name + "::", ii.functiontType)
        middleFunc += result.middleBody
        implH += result.implH
        implCpp += result.implCpp
        middleInit += result.middleInit
    }
    generateEnumResult(data, implH, implCpp);
    for (let i in data.function) {
        let func = data.function[i]
        let tmp = generateFunction(func, data)
        middleFunc += tmp[0]
        implH += tmp[1]
        implCpp += tmp[2]
        middleInit += '    pxt->DefineFunction("%s", %s%s::%s_middle%s);\n'
            .format(func.name, inNamespace, name, func.name, inNamespace.length > 0 ? ", " + name : "")
    }
    for (let i in data.namespace) {
        let ns = data.namespace[i]
        let result = generateNamespace(ns.name, ns.body, inNamespace + name + "::")
        middleFunc += result.middleBody
        implH += result.implH
        implCpp += result.implCpp
        middleInit += result.middleInit
    }
    InterfaceList.pop();
    if (inNamespace.length > 0) {
        middleInit += "}"
    }
    return generateResult(name, implH, implCpp, middleFunc, middleInit)
}

function generateEnumResult(data, implH, implCpp) {
    for (let i in data.enum) {
        let enumm = data.enum[i]
        let result = generateEnum(enumm.name, enumm.body)
        implH += result.implH
        implCpp += result.implCpp
    }
}

function generateResult(name, implH, implCpp, middleFunc, middleInit) {
    let result = {
        implH: `namespace %s {%s\n}`.format(name, implH),
        implCpp: `namespace %s {%s}`.format(name, implCpp),
        middleBody: `namespace %s {%s}`.format(name, middleFunc),
        middleInit: middleInit
    }
    return result;
}

function generateFunction(func, data) {
    let tmp;
    switch (func.type) {
        case FuncType.DIRECT:
            tmp = generateFunctionDirect(func, data)
            break;
        case FuncType.SYNC:
            tmp = generateFunctionSync(func, data)
            break
        case FuncType.ASYNC:
        case FuncType.PROMISE:
            tmp = generateFunctionAsync(func, data)
            break
        default:
            return
    }
    return tmp
}

function formatMiddleInit(inNamespace, name) {
    let middleInit = ""
    if (inNamespace.length > 0) {
        let nsl = inNamespace.split("::")
        nsl.pop()
        let parentNs = nsl[nsl.length - 1]
        middleInit = `{\nnapi_value %s=pxt->CreateSubObject(%s,"%s");\n`
            .format(name, nsl.length == 1 ? "exports" : parentNs, name)
    }
    return middleInit
}

module.exports = {
    generateNamespace
}