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
const re = require("../tools/re");
const { FuncType, NumberIncrease, isEnum, EnumValueType, enumIndex } = require("../tools/common");
const { analyzeParams } = require("./params");
const { analyzeReturn } = require("./return");
const { NapiLog } = require("../tools/NapiLog");

/**函数解析 */
function analyzeFunction(data, name, values, ret) {
    values = re.replaceAll(re.replaceAll(values, " ", ""), "\n", "")
    let tmp = analyzeParams(values)
    values = tmp[0]
    let funcType = tmp[1]
    tmp = analyzeReturn(ret)
    ret = tmp[0]
    if (tmp[1])
        funcType = FuncType.PROMISE
    if (funcType == FuncType.ASYNC || funcType == FuncType.PROMISE) {
        // 查看是否有同名的函数，async_callback和promise，
        // 只需要保留一个，这里简单处理，忽略所有promise
        if (funcType == FuncType.PROMISE) return null;
    }
    for (let j in values) {
        let v = values[j]
        let arrayType = re.match("(Async)*Callback<(Array<([a-zA-Z_0-9]+)>)>", v["type"])
        let parameter = v["type"]
        if (arrayType) {
            parameter = re.getReg(v["type"], arrayType.regs[2])
        }
        if(isEnum(parameter, data)){
            let index = enumIndex(parameter, data)
            if (data.enum[index].body.enumValueType == EnumValueType.ENUM_VALUE_TYPE_NUMBER) {
                v["type"] = v["type"].replace(parameter, "NUMBER_TYPE_" + NumberIncrease.getAndIncrease())
            } else if (data.enum[index].body.enumValueType == EnumValueType.ENUM_VALUE_TYPE_STRING) {
                v["type"] = v["type"].replace(parameter, "string")
            } else {
                NapiLog.logError(`returnGenerate is not support`);
                return
            }
        }
        if (parameter.indexOf("number") >= 0) {
            v["type"] = v["type"].replace("number", "NUMBER_TYPE_" + NumberIncrease.getAndIncrease())
        }
    }
    if (ret.indexOf("number") >= 0) {
        ret = ret.replace("number", "NUMBER_TYPE_" + NumberIncrease.getAndIncrease())
    }
    let result = {
        name: name,
        type: funcType,
        value: values,
        ret: ret,
    }
    return result
}

module.exports = {
    analyzeFunction
}