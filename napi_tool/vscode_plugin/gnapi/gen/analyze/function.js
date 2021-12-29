const re = require("../tools/re");
const { print, RemoveExplains, RemoveEmptyLine, CheckOutBody } = require("../tools/tool");
const { FuncType,NumberIncrease } = require("../tools/common");
const { AnalyzeParams } = require("./params");
const { AnalyzeReturn }=require("./return");

/**函数解析 */
function AnalyzeFunction(name, values, ret) {
    values = re.replace_all(re.replace_all(values, " ", ""), "\n", "")
    let tmp = AnalyzeParams(values)
    values = tmp[0]
    let func_type = tmp[1]

    tmp = AnalyzeReturn(ret)
    ret = tmp[0]
    if (tmp[1])
        func_type = FuncType.PROMISE

    if (func_type == FuncType.ASYNC || func_type == FuncType.PROMISE) {
        //查看是否有同名的函数，async_callback和promise，只需要保留一个，这里简单处理，忽略所有promise
        if (func_type == FuncType.PROMISE) return null;
    }

    for (let j in values) {
        let v = values[j]
        if (v["type"].indexOf("number") >= 0) {
            v["type"] = v["type"].replace("number", "NUMBER_TYPE_" + NumberIncrease.GetAndIncrease())
        }
    }
    if (ret.indexOf("number") >= 0) {
        ret = ret.replace("number", "NUMBER_TYPE_" + NumberIncrease.GetAndIncrease())
    }

    let result = {
        name: name,
        type: func_type,
        value: values,
        ret: ret,
    }
    return result
}

module.exports = {
    AnalyzeFunction
}