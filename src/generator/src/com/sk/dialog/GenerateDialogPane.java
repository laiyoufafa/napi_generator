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
package com.sk.dialog;

import com.intellij.notification.NotificationType;
import com.intellij.openapi.diagnostic.Logger;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.ui.ValidationInfo;
import com.sk.action.BrowseAction;
import com.sk.action.GenAction;
import com.sk.action.ScriptAction;
import com.sk.utils.FileUtil;
import com.sk.utils.GenNotification;
import org.apache.http.util.TextUtils;
import org.jetbrains.annotations.Nullable;

import javax.swing.JComponent;
import javax.swing.JDialog;
import javax.swing.JPanel;
import javax.swing.JTextField;
import javax.swing.JLabel;
import javax.swing.JButton;
import javax.swing.KeyStroke;
import java.awt.event.KeyEvent;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.awt.event.WindowListener;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * GenerateDialogPane生成工具主界面
 *
 * @author: xudong
 * @see: select generate dialog
 * @version: v1.0.0
 * @since 2022-02-21
 */
public class GenerateDialogPane extends JDialog {
    private static final Logger LOG = Logger.getInstance(GenerateDialogPane.class);
    private static final String COMMAND_STATEMENT = "add_library(napitest SHARED x_napi_tool.cpp napitest.cpp "
            + "napitest_middle.cpp)" + FileUtil.getNewline() + "target_link_libraries(napitest libace_napi.z.so)";
    private static final String REGEX = "napitest";
    private static final Pattern LF_PATTERN = Pattern.compile(REGEX, Pattern.CASE_INSENSITIVE | Pattern.MULTILINE);

    private JPanel contentPane;
    private JTextField interPath;
    private JTextField genPath;
    private JTextField scriptPath;
    private JButton selectInter;
    private JButton selectGenPath;
    private JButton selectScriptPath;
    private JLabel genText;
    private JLabel scriptText;
    private JLabel interText;
    private boolean generateSuccess = true;
    private String sErrorMessage = "";
    private String destPath;
    private String directoryPath;
    private String fileName;
    private Project project;


    /**
     * 构造函数
     *
     * @param project       projectid
     * @param interFilePath 接口文件路径
     * @param genDir        生成框架文件路径
     * @param scriptDir     脚本目录
     */
    public GenerateDialogPane(Project project, String interFilePath, String genDir, String scriptDir) {
        this.project = project;
        this.destPath = interFilePath;
        this.directoryPath = genDir;
        this.fileName = scriptDir;

        interText.setText("接口文件:");
        genText.setText("生成框架路径:");
        scriptText.setText("编译脚本路径:");

        interPath.setText(destPath);
        genPath.setText(directoryPath);
        scriptPath.setText(directoryPath);

        // call onCancel() on ESCAPE
        contentPane.registerKeyboardAction(actionEvent -> onCancel(), KeyStroke.getKeyStroke(KeyEvent.VK_ESCAPE, 0),
                JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT);

        BrowseAction browseAction = new BrowseAction(project, selectInter, interPath, genPath, scriptPath);
        selectInter.addActionListener(browseAction);
        selectGenPath.addActionListener(new GenAction(selectGenPath, genPath));
        selectScriptPath.addActionListener(new ScriptAction(selectScriptPath, scriptPath));
    }

    @Override
    public synchronized void addWindowListener(WindowListener windowListener) {
        super.addWindowListener(windowListener);
        new WindowAdapter() {
            /**
             * close dialog
             *
             * @param windowEvent WindowEvent
             */
            @Override
            public void windowClosing(WindowEvent windowEvent) {
                onCancel();
            }
        };
    }

    /**
     * 验证文本选择框是否空。是否替换已存在的内容
     *
     * @return ValidationInfo 返回不符要求的信息。
     */
    @Nullable
    public ValidationInfo validationInfo() {
        String fileInter = interPath.getText();
        String scriptDir = scriptPath.getText();
        String filegypDir = genPath.getText();
        boolean isEmptyFile = TextUtils.isEmpty(fileInter)
                || TextUtils.isEmpty(scriptDir)
                || TextUtils.isEmpty(filegypDir);

        ValidationInfo validationInfo = null;
        if (isEmptyFile) {
            String warnMsg = "接口文件、框架、编译脚本路径不能为空";
            warningMessage("Please input interface,gen and gyp file directory", warnMsg);
            validationInfo = new ValidationInfo(warnMsg);
            return validationInfo;
        }

        File file = new File(filegypDir + "/binding.gyp");
        if (file.exists()) {
            ConfirmDialog confirmDialog = new ConfirmDialog("是否替换已存在的编译脚本?");
            if (!confirmDialog.showAndGet()) {
                validationInfo = new ValidationInfo(String.format("不替换现有编译脚本：%s", file));
                return validationInfo;
            }
        }
        return validationInfo;
    }

    private void onCancel() {
        dispose();
    }

    private void warningMessage(String message, String title) {
        GenNotification.notifyMessage(this.project, message, title, NotificationType.WARNING);
    }

    /**
     * 执行主程序入口
     *
     * @return 执行状态
     * @throws IOException 文件打开
     */
    public boolean runFun() {
        GenNotification.notifyMessage(this.project, "", "正在生成", NotificationType.INFORMATION);
        destPath = interPath.getText();
        String parentPath = genPath.getText();

        String command;
        command = genCommand(destPath, parentPath);

        try {
            if (!TextUtils.isEmpty(command) && callExtProcess(command)) {
                GenNotification.notifyMessage(project, directoryPath, "提示", NotificationType.INFORMATION, true);
                return true;
            }
        } catch (IOException | InterruptedException ex) {
            GenNotification.notifyMessage(project, directoryPath, "Command exec error", NotificationType.ERROR);
            LOG.error(ex);
        }
        return false;
    }

    /**
     * 生成命令行指令
     *
     * @param destPath   目标文件
     * @param parentPath 父目录文件
     * @return 返回命令行执行内容
     */
    private String genCommand(String destPath, String parentPath) {
        String sysName = System.getProperties().getProperty("os.name").toUpperCase();
        String tmpDirFile = System.getProperty("java.io.tmpdir");
        String execFn;
        if (sysName.indexOf("WIN") >= 0) {
            execFn = "cmds/win/napi_generator-win.exe";
            tmpDirFile += "napi_generator-win.exe";
        } else if (sysName.indexOf("LINUX") >= 0) {
            execFn = "cmds/linux/napi_generator-linux";
            tmpDirFile += "napi_generator-linux";
        } else {
            execFn = "cmds/mac/napi_generator-macos";
            tmpDirFile += "napi_generator-macos";
        }
        File file = new File(tmpDirFile);
        if (!file.exists()) {
            try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream(execFn)) {
                if (inputStream == null) {
                    throw new IOException("exec File InputStream is Null");
                }
                byte[] bs = inputStream.readAllBytes();
                writeTmpFile(tmpDirFile, bs);
                if (sysName.indexOf("LINUX") >= 0 || sysName.indexOf("MAC OS") >= 0) {
                    executable(tmpDirFile);
                }
            } catch (IOException | InterruptedException e) {
                GenNotification.notifyMessage(this.project, e.getMessage(), "Can not Find File:" + execFn,
                        NotificationType.ERROR);
                LOG.error(e);
                return "";
            }
        }

        String command = file.toString();
        String inArgs = genInArgs(destPath);
        command += inArgs + " -o " + parentPath;
        return command;
    }

    /**
     * 生成 -f -d 输入参数。
     *
     * @param destPath 源文件路径。
     * @return 生成后的值-f -d的值
     */
    private String genInArgs(String destPath) {

        String[] interArr = destPath.split(",");
        String tsParam = " -f ";
        String dirParam = " -d ";
        String inputCommand = "";
        if (interArr.length > 0) {
            for (String interStr : interArr) {
                File interFile = new File(interStr);
                if (interFile.isDirectory()) {
                    dirParam += interStr + " ";
                } else {
                    tsParam += interStr + ",";
                }
            }
            if (!TextUtils.isEmpty(tsParam.replaceAll("-f", ""))
                    && !TextUtils.isBlank(tsParam.replaceAll("-f", ""))) {
                inputCommand += tsParam.substring(0, tsParam.length() - 1);
            }
            if (!TextUtils.isEmpty(dirParam.replace("-d", ""))
                    && !TextUtils.isBlank(dirParam.replace("-d", ""))) {
                inputCommand += dirParam.substring(0, dirParam.length() - 1);
            }
        }
        return inputCommand;
    }

    private boolean callExtProcess(String command) throws IOException, InterruptedException {

        if (TextUtils.isEmpty(command)) {
            GenNotification.notifyMessage(this.project, "执行命令文件为空", "空命令行提示", NotificationType.ERROR);
            return false;
        }
        Process process = Runtime.getRuntime().exec(command);
        genResultLog(process);

        StreamConsumer errConsumer = new StreamConsumer(process.getErrorStream());
        StreamConsumer outputConsumer = new StreamConsumer(process.getInputStream());

        errConsumer.start();
        outputConsumer.start();

        if (generateSuccess) {
            writeCommand();
        } else {
            GenNotification.notifyMessage(project, sErrorMessage, "提示", NotificationType.ERROR);
            return false;
        }
        errConsumer.join();
        outputConsumer.join();
        return true;
    }

    /**
     * 写makeFile.txt文件
     *
     * @throws IOException 文件异常
     */
    private void writeCommand() {
        FileUtil fileUtil = new FileUtil();
        String filePath = fileUtil.makeFile(directoryPath + "/makeFile.txt");
        if (TextUtils.isEmpty(filePath)) {
            LOG.error("makeFile is error");
            return;
        }
        Matcher matcher = LF_PATTERN.matcher(COMMAND_STATEMENT);
        String statement = matcher.replaceAll(fileName);
        try {
            if (!fileUtil.findStringInFile(filePath, statement)) {
                fileUtil.writeErrorToTxt(filePath, statement);
            }
        } catch (IOException ioException) {
            LOG.error("writeCommand io error" + ioException);
        }
    }

    /**
     * 赋值可执行文件权限。
     *
     * @param execFn 可执行命令
     * @throws IOException          打开文件异常
     * @throws InterruptedException 中断异常
     */
    private void executable(String execFn) throws IOException, InterruptedException {
        callExtProcess("chmod a+x " + execFn);
    }

    /**
     * 拷贝可执行文件到临时文件夹
     *
     * @param path 目标文件路径
     * @param bs   字节内容
     * @throws IOException exception
     */
    private void writeTmpFile(String path, byte[] bs) throws IOException {
        File file = new File(path);
        if (!file.exists()) {
            boolean isNewFile = file.createNewFile();
            if (!isNewFile) {
                LOG.info("writeTmpFile createNewFile error");
            }
        }
        FileOutputStream fw = new FileOutputStream(file);
        fw.write(bs, 0, bs.length);
        fw.close();
    }

    /**
     * 获取生成成功结果文件。
     *
     * @param process 进程ID
     */
    private void genResultLog(Process process) {
        BufferedReader stdInput = new BufferedReader(new InputStreamReader(process.getInputStream()));
        BufferedReader stdError = new BufferedReader(new InputStreamReader(process.getErrorStream()));
        String sErr;
        String sOut;
        sErr = getErrorResult(stdError);
        if (TextUtils.isEmpty(sErr)) {
            sOut = genInputLog(stdInput);
            if (!generateIsSuccess(sOut)) {
                sErrorMessage = sOut;
            }
            return;
        }
        generateSuccess = false;
        sErrorMessage = sErr;
    }

    /**
     * 获取生成失败结果文件。
     *
     * @param stdError error buff
     * @return ErrorResult
     */
    private String getErrorResult(BufferedReader stdError) {
        String sErr = "";
        while (true) {
            String sTmp;
            try {
                if ((sTmp = stdError.readLine()) == null) {
                    break;
                }
                sErr += sTmp + FileUtil.getNewline();
            } catch (IOException ioException) {
                LOG.error(" genResultLog stdInput error" + ioException);
            }
        }
        return sErr;
    }

    private boolean generateIsSuccess(String sOut) {
        if (sOut.indexOf("success") >= 0 || TextUtils.isEmpty(sOut)) {
            generateSuccess = true;
        } else {
            generateSuccess = false;
        }
        return generateSuccess;
    }

    /**
     * 获取生成文本内容。
     *
     * @param stdInput input buff
     * @return 返回当前输入框内容
     */
    private String genInputLog(BufferedReader stdInput) {
        String sOut = "";
        while (true) {
            String sTmp;
            try {
                if ((sTmp = stdInput.readLine()) == null) {
                    break;
                }
                sOut += sTmp + FileUtil.getNewline();
            } catch (IOException ioException) {
                LOG.error(" genResultLog stdInput error" + ioException);
            }
        }
        return sOut;
    }

    class StreamConsumer extends Thread {
        InputStream is;

        StreamConsumer(InputStream is) {
            super.setName("StreamConsumer");
            this.is = is;
        }

        @Override
        public void run() {
            try {
                InputStreamReader isr = new InputStreamReader(is);
                BufferedReader br = new BufferedReader(isr);
                String line;
                while ((line = br.readLine()) != null) {
                    LOG.error("StreamConsumer" + line);
                }
            } catch (IOException ioException) {
                LOG.error("StreamConsumer io error" + ioException);
            }
        }
    }

    JPanel getContentPanel() {
        return contentPane;
    }
}
