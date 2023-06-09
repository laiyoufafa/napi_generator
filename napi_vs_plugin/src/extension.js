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

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const re = require("./gen/tools/VsPluginRe");
let compressing = require('compressing');
let http = require("https");
const { VsPluginLog } = require("./gen/tools/VsPluginLog");
const { detectPlatform, readFile } = require('./gen/tools/VsPluginTool');
const url = "https://repo.huaweicloud.com/harmonyos/develop_tools/napi_generator/napi_generator_20220319.tart.gz";
var exeFilePath = null;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "gnapi" is now active!');
	let disposable = register(context, 'generate_napi');
	let disposableMenu = register(context, 'generate_napi_menu');
	context.subscriptions.push(disposable);
	context.subscriptions.push(disposableMenu);
	var platform = detectPlatform();
	if (platform == 'win') {
		exeFilePath = __dirname + "/napi_generator/napi_generator-win.exe";
	} else if (platform == 'mac') {
		exeFilePath = __dirname + "/napi_generator/napi_generator-macos";
	} else if (platform == 'Linux') {
		exeFilePath = __dirname + "/napi_generator-linux";
	}
	if (!exeFileExit()) {
		requestFile(null, null, null);
	}
}

function executor(name, genDir, mode) {
	var exec = require('child_process').exec;
	exec(genCommand(name, genDir, mode), function (error, stdout, stderr) {
		VsPluginLog.logInfo('VsPlugin: stdout =' + stdout + ", stderr =" + stderr);
		if (error) {
			vscode.window.showErrorMessage("genError:" + error);
			return VsPluginLog.logError("VsPlugin:" + error);
		}
		vscode.window.showInformationMessage("Generated successfully");
	});
}

function genCommand(name, genDir, mode) {
	var genFileMode = mode == 0 ? " -f " : " -d ";
	return exeFilePath + genFileMode + name + " -o " + genDir;
}

function exeFileExit() {
	if (fs.existsSync(exeFilePath)) {
		return true;
	}
	return false;
}

function register(context, command) {
	let disposable = vscode.commands.registerCommand(command, function (uri) {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const panel = vscode.window.createWebviewPanel(
			'generate', // Identifies the type of WebView
			'Generate Napi Frame', // Title of the panel displayed to the user
			vscode.ViewColumn.One, // Display the WebView panel in the form of new columns in the editor
			{
				enableScripts: true, // Enable or disable JS, default is Enable
				retainContextWhenHidden: true, // Keep the WebView state when it is hidden to avoid being reset
			}
		);
		panel.webview.html = getWebviewContent();
		panel.webview.onDidReceiveMessage(message => {
			if (message == "cancel") {
				panel.dispose();
			} else {
				let mode = message.mode;
				let name = message.fileNames;
				let genDir = message.genDir;
				checkMode(name, genDir, mode);
			}
		}, undefined, context.subscriptions);
		let fn = re.getFileInPath(uri.fsPath);
		let tt = re.match("@ohos.[a-zA-Z_0-9]+.d.ts", fn);
		panel.webview.postMessage(tt ? uri.fsPath : "");
	});
	return disposable;
}

function checkMode(name, genDir, mode) {
	name = re.replaceAll(name, " ", "");
	if ("" == name) {
		vscode.window.showErrorMessage("Please enter the path!");
		return;
	}
	if (mode == 0) {
		if (name.indexOf(".") < 0) {
			vscode.window.showErrorMessage("Please enter the correct file path!");
			return;
		}
	} else {
		if (name.indexOf(".") > 0) {
			vscode.window.showErrorMessage("Please enter the correct folder path!");
			return;
		}
	}
	if (exeFileExit()) {
		executor(name, genDir, mode);
	} else {
		requestFile(name, genDir, mode);
	}
}

// this method is called when your extension is deactivated
function deactivate() { }

function getWebviewContent() {
	let data = readFile(__dirname + '/vs_plugin_view.html');
	return data.toString();
}

function requestFile(name, genDir, mode) {
	http.get(url, function (res) {
		let imgData = "";
		let contentLength = parseInt(res.headers['content-length']);
		res.setEncoding("binary");
		res.on("data", function (chunk) {
			imgData += chunk;
			let process = ((imgData.length) / contentLength) * 100;
			let percent = parseInt(((process).toFixed(0)));
			VsPluginLog.logInfo("VsPlugin:" + percent);
		});
		res.on("end", function () {
			fs.writeFile(__dirname + "/napi_generator.tart.gz", imgData, "binary", function (err) {
				if (err) {
					VsPluginLog.logInfo("VsPlugin: down fail");
				} else {
					VsPluginLog.logInfo("VsPlugin: down success");
					decompress(__dirname + '/' + 'napi_generator.tart.gz', __dirname, name, genDir, mode);
				}
			});
		});
	});
}

const decompress = function (filePath, decompressPath = __dirname, name, genDir, mode) {
	compressing.tgz.uncompress(filePath, decompressPath, { zipFileNameEncoding: 'GBK' })
		.then(() => {
			VsPluginLog.logInfo('VsPlugin: success' + exeFilePath);
			if(name != null){
				executor(name, genDir, mode);
			}
		})
		.catch(err => {
			VsPluginLog.logInfo("VsPlugin:" + err);
		})
}

module.exports = {
	activate,
	deactivate
}