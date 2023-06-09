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
const { NapiLog } = require("./NapiLog");
const re = require("./re");
let vscode = null;
try {
    vscode = require('vscode');
}
catch (err) {
    vscode = null;
}

function print(...args) {
    if (vscode) {
        vscode.window.showInformationMessage(...args);
    }
    NapiLog.logInfo(...args);
}

String.prototype.format = function (...args) {
    var result = this;
    let reg = new RegExp("%[sd]{1}")
    for (let i = 0; i < args.length; i++) {
        let p = result.search(reg)
        if (p < 0) break;
        result = result.substring(0, p) + args[i] + result.substring(p + 2, result.length)
    }
    return result;
}

String.prototype.replaceAll = function (...args) {
    let result = this;
    while (result.indexOf(args[0]) >= 0) {
        result = result.replace(args[0], args[1])
    }
    return result;
}

function checkOutBody(body, off, flag, binside) {
    off = off || 0;
    flag = flag || ["{", "}"];
    binside = binside || false;
    let idx = {
        "(": ")",
        "{": "}",
        "<": ">",
        //"<": "<",
        //">": ">",
    };
    let csl = {};
    let csr = {};
    for (let f in idx) {
        csl[f] = 0
        csr[idx[f]] = 0
    }
    let cs1 = 0
    if (flag[0].length > 0 && body.substring(off, off + flag[0].length) != flag[0]) {
        return null;
    }

    for (let i = off + flag[0].length; i < body.length; i++) {
        if (body[i] == '"') cs1 += 1
        if (cs1 % 2 == 0) {
            let tb1 = true;
            for (let k in csl) {
                if (csl[k] != csr[idx[k]]) {
                    tb1 = false;
                    break;
                }
            }
            if (tb1 && body.substring(i, i + flag[1].length) == flag[1]) {
                if (binside)
                    return body.substring(off + flag[0].length, i);
                return body.substring(off, i + flag[1].length);
            }

            if (body[i] in csl) {
                csl[body[i]] += 1;
                if (body[i] in csr) csr[body[i]] += 1;
            }
            if (body[i] in csr) {
                csr[body[i]] += 1;
            }
        }

    }

    return null;
}

function removeExplains(data) {
    while (data.indexOf("/*") >= 0) {
        let i1 = data.indexOf("/*")
        let i2 = data.indexOf("*/") + 2
        data = data.substring(0, i1) + data.substring(i2, data.length)
    }
    while (true) {
        let tt = re.search("\n *//([a-zA-Z .]+)\n", data)
        if (tt != null) {
            data = data.substring(0, tt.regs[0][0]) + data.substring(tt.regs[0][1], data.length)
        }
        else break;
    }
    return data
}

function getLicense(data) {
    while (data.indexOf("/*") >= 0) {
        let i1 = data.indexOf("/*")
        let i2 = data.indexOf("*/") + 2
        let licenseData = data.substring(i1, i2)
        if (licenseData.search("Copyright")) {
            return licenseData
        }
    }
}

function removeEmptyLine(data) {
    while (data.indexOf("\r") >= 0) {
        data = data.replace("\r", "")
    }
    while (data.indexOf(" \n") >= 0) {
        data = data.replace(" \n", "\n")
    }
    while (data.indexOf("\n ") >= 0) {
        data = data.replace("\n ", "\n")
    }
    while (data.indexOf("\n\n") >= 0) {
        data = data.replace("\n\n", "\n")
    }
    while (data.indexOf("\n") == 0) {
        data = data.substring(1, data.length)
    }
    while (data.indexOf(" ") == 0) {
        data = data.substring(1, data.length)
    }
    return data
}

function removeEmptyLine2(data) {
    while (data.indexOf(" \n"))
        data = data.replace(" \n", "\n")
    while (data.indexOf("\n\n\n"))
        data = data.replace("\n\n\n", "\n\n")
    return data
}

function replaceAll(s, sfrom, sto) {
    while (s.indexOf(sfrom) >= 0) {
        s = s.replace(sfrom, sto)
    }
    return s;
}

module.exports = {
    checkOutBody,
    removeExplains,
    removeEmptyLine,
    removeEmptyLine2,
    replaceAll,
    print,
    getLicense
}