const { ReplaceAll, print } = require("../tools/tool");
const { ParamGenerate } = require("./param_generate");
const { ReturnGenerate } = require("./return_generate");
/**结果直接返回 */
let func_direct_templete = `
struct [func_name]_value_struct {[value_in]
    
    [value_out]
};

[static_define]napi_value [func_name]_middle(napi_env env, napi_callback_info info)
{
    XNapiTool *pxt = std::make_unique<XNapiTool>(env, info).release();
    if (pxt->IsFailed())
    {
        napi_value err = pxt->GetError();
        delete pxt;
        return err;
    }
    [unwarp_instance]

    struct [func_name]_value_struct *vio=new [func_name]_value_struct();
    
    [value_checkout]

    [call_func]

    [value_package]

    delete vio;
    if (pxt->IsFailed())
        result = pxt->GetError();
    delete pxt;// release
    return result;
}`

function GenerateFunctionDirect(func, class_name) {
    //     this.len_to = 0
    //     // print(type, name, values, ret_type)
    let middle_func = ReplaceAll(func_direct_templete, "[func_name]", func.name)
    if(class_name==null)
    {
        middle_func=middle_func.ReplaceAll("[static_define]","")
        middle_func=middle_func.ReplaceAll("[unwarp_instance]","")
    }
    else
    {
        middle_func=middle_func.ReplaceAll("[static_define]","static ")
        middle_func=middle_func.ReplaceAll("[unwarp_instance]","%s *pInstance = (%s *)pxt->UnWarpInstance();".format(class_name,class_name))
    }
    let param = {
        value_in: "",//定义输入
        value_out: "",//定义输出

        value_checkout: "",//解析
        value_fill: "",//填充到函数内
        value_package: "",//输出参数打包
        value_define: ""//impl参数定义
    }

    for (let i in func.value) {
        let v = func.value[i]
        ParamGenerate(i, v.name, v.type, param)
    }

    ReturnGenerate(func.ret, param)

    middle_func = ReplaceAll(middle_func, "[value_in]", param.value_in)//  # 输入参数定义
    middle_func = ReplaceAll(middle_func, "[value_out]", param.value_out)//  # 输出参数定义

    middle_func = ReplaceAll(middle_func, "[value_checkout]", param.value_checkout)//  # 输入参数解析

    let call_func = "%s%s(%s);".format(class_name==null?"":"pInstance->",func.name, param.value_fill)
    middle_func = ReplaceAll(middle_func, "[call_func]", call_func)//执行

    middle_func = ReplaceAll(middle_func, "[value_package]", param.value_package)//输出参数打包

    //     if (type == (FuncType.ASYNC | FuncType.PROMISE)) {
    //         this.generate_value_out(this.callback_type)
    //         middle_func = ReplaceAll(middle_func, "[call_static_func]",
    //             `
    // napi_value result = pxt->StartAsync(%s_execute, vio, %s_complete, pxt->GetArgc() == %s ? pxt->GetArgv(%d) : nullptr);`.format
    //                 (name, name, this.callback_offet + 1, this.callback_offet))
    //         middle_func = ReplaceAll(middle_func, "    delete vio;", "")
    //         middle_func = ReplaceAll(middle_func, "    delete pxt;// release", "")
    //         let ttt = ReplaceAll(codestring.func_promise, "[func_name]", name)
    //         let call_func;

    //         if (cvs == null)
    //             call_func = "%s::%s(%s);".format(this.declare_name, name, param["value_call"])
    //         else
    //             call_func = "%s::%s(%s);".format(cvs[0], cvs[1], param["value_call"])
    //         // print(call_func)
    //         ttt = ReplaceAll(ttt, "[call_static_func]", call_func)
    //         print("=====1======")
    //         let ttt2 = "napi_value result = nullptr;\n%s".format(this.c_to_js("vio->out", this.callback_type, "result"))
    //         // print(this.callback_type)
    //         print("=====2======")
    //         ttt = ReplaceAll(ttt, "[promise_arg]", "%s    napi_value args[1] = {result,};".format(ttt2))
    //         middle_func = middle_func.replace("};", ttt)
    //     }
    //     else if (type == FuncType.SYNC) {
    //         this.generate_value_out(this.callback_type)
    //         let call_func;
    //         if (cvs == null)
    //             call_func = "%s::%s(%s);".format(this.declare_name, name, param["value_call"])
    //         else
    //             call_func = "%s::%s(%s);".format(cvs[0], cvs[1], param["value_call"])
    //         middle_func = ReplaceAll(middle_func, "[call_static_func]",
    //             `%s
    // {
    // napi_value result = nullptr;
    // %s
    // napi_value args[1] = {result};
    // pxt->SyncCallBack(pxt->GetArgv(%d), 1, args);}`.format(call_func,
    //                 this.c_to_js("vio->out", this.callback_type, "result"),
    //                 this.callback_offet))
    //     }

    //     if (ret_type == "void" && type != (FuncType.ASYNC | FuncType.PROMISE))
    //         param["value_package"] = "napi_value result = XNapiTool::UndefinedValue(env);"

    //     middle_func = ReplaceAll(middle_func, "[value_out]", param["value_out"])
    //     if (type != (FuncType.ASYNC | FuncType.PROMISE))
    //         middle_func = ReplaceAll(middle_func, "[value_package]", param["value_package"])
    //     else
    //         middle_func = ReplaceAll(middle_func, "[value_package]", "")

    //     if (cvs == null) {
    let impl_h = "\nbool %s(%s);".format(func.name, param.value_define)
    let impl_cpp = `
bool %s%s(%s) {
    // TODO
    return true;
}
`.format(class_name==null?"":class_name+"::",func.name, param.value_define)

    return [middle_func, impl_h, impl_cpp]
}

module.exports = {
    GenerateFunctionDirect
}