/*
* Copyright (c) 2021 Shenzhen Kaihong Digital Industry Development Co., Ltd. 
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
const { print, RemoveExplains, RemoveEmptyLine, CheckOutBody } = require("../tools/tool");
const { FuncType,NumberIncrease } = require("../tools/common");

const { AnalyzeFunction }=require("./function");

/**interface解析 */
function AnalyzeInterface(data) {//same as class
    let body = re.replace_all(data, "\n", "").split(";")//  # replace(" ", "").
    // print(body)
    let result = {
        value: [],
        function: []
    }
    for (let i in body) {
        let t = body[i]
        while (t.length > 0 && t[0] == ' ')//去除前面的空格
            t = t.substring(1, t.length)
        while (t.length > 0 && t[-1] == ' ')//去除后面的空格
            t = t.substring(0, t.length - 1)
        if (t == "") break//如果t为空直接返回
        // print(t)
        let tt = re.match(" *([a-zA-Z0-9_]+) *: *([a-zA-Z_0-9<>]+)", t)
        if (tt) {//变量

            let value_name = re.get_reg(t, tt.regs[1])
            let value_type = re.get_reg(t, tt.regs[2])
            if (value_type.indexOf("number") >= 0) {
                value_type = value_type.replace("number", "NUMBER_TYPE_" + NumberIncrease.GetAndIncrease())
            }
            result.value.push({
                name: value_name,
                type: value_type
            })
            continue
        }
        tt = re.match(" *([A-Za-z0-9_]+)\\(([\n a-zA-Z:;=,_0-9?<>{}|]*)\\) *: *([A-Za-z0-9_<>{}:, .]+)", t)
        if (tt) {//函数
            let func_detail = AnalyzeFunction(re.get_reg(t, tt.regs[1]), re.get_reg(t, tt.regs[2]), re.get_reg(t, tt.regs[3]))
            if (func_detail != null)
                result.function.push(func_detail)
            continue
        }
    }
    return result
}

module.exports = {
    AnalyzeInterface
}