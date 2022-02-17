package com.sk.ng;

import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.actionSystem.PlatformDataKeys;
import com.intellij.openapi.diagnostic.Logger;
import com.intellij.openapi.ui.Messages;
import com.intellij.openapi.vfs.VirtualFile;

import java.io.IOException;
import java.net.URL;
import java.util.regex.Pattern;

public class GenDTS extends AnAction {
    private static final Logger LOG = Logger.getInstance(GenDTS.class);

    @Override
    public void actionPerformed(AnActionEvent e) {
        //获取需要处理的.d.ts文件绝对路径
        VirtualFile file = e.getData(PlatformDataKeys.VIRTUAL_FILE);
        if (file == null) return;
        //正则匹配所选文件名是否符合规范
        if (!Pattern.matches("@ohos.[a-zA-Z0-9]+.d.ts", file.getName())) {
            Messages.showErrorDialog("选择@ohos.xxx.d.ts文件生成", "错误");
            return;
        }
        String dest_path = file.getPath();

        //执行命令行
        RunFun(dest_path);

        Messages.showMessageDialog(e.getProject(), dest_path, "generating", Messages.getInformationIcon());
    }

    public void RunFun(String dest_path) {
        String command = "";
        String sysName = System.getProperties().getProperty("os.name").toUpperCase();
        if (sysName.indexOf("WIN") >= 0) {
            URL res = getClass().getClassLoader().getResource("cmds/win/napi_generator-win.exe");
            String exePath = res.getPath().substring(1);
            command = exePath.replace("%20", " ") + " " + dest_path.replace("/", "\\");
        } else if (sysName.indexOf("LINUX") >= 0) {
            URL res = getClass().getClassLoader().getResource("cmds/linux/napi_generator-linux");
            command = res.getPath() + "  " + dest_path;
        } else {
            //mac support
        }

        try {
            Runtime.getRuntime().exec(command);
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }

    @Override
    public void update(AnActionEvent event) {
        //根据所选文件名，判断是否显示生成菜单项
        VirtualFile file = event.getData(PlatformDataKeys.VIRTUAL_FILE);
        if (file == null) {
            event.getPresentation().setEnabledAndVisible(false);
            return;
        } else {
            String extension = file.getExtension();
            if (extension != null && "ts".equals(extension)) {
                event.getPresentation().setEnabledAndVisible(true);
            } else {
                event.getPresentation().setEnabledAndVisible(false);
            }
        }
    }
}
