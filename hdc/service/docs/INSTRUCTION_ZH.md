# SERVICE框架生成工具使用说明
## 简介

SERVICE框架生成工具支持三种入口，分别是可执行程序、VS Code插件、IntelliJ插件，使用者可以根据自己的需要选择合适的工具。可执行文件、IntelliJ插件、VS Code插件下载路径如下：

[下载链接](暂无)

下载文件说明如下：

	│   │   |── service_IntelliJ_plugin.jar        # IntelliJ插件
	│   │   |── service-0.0.1.vsix                 # VS Code插件
	│   │   |── header_parser.exe                  # python脚本独立程序
	│   │   |── service-gen-linux                  # Linux可执行程序 
	│   │   |── service-gen-win.exe                # Windows可执行程序    
	│   │   └── service-gen-macos                  # Mac可执行程序                

## 工具介绍

通过SERVICE框架生成工具，使用者只需提供一个定义远程方法的.h头文件，一键生成SERVICE框架代码，主要包含Ability注册、proxy/stub类实现、MessageParcel数据包构造、Service子系统编译及开机自启动相关配置文件。

## 生成框架

### 可执行程序使用方法
#### Linux

1.下载python脚本可执行程序header_parser.exe与linux可执行程序service-gen-linux，下载链接如下：

[下载链接](暂无)

2.将待转换的.h文件放到任意目录下，建议放到可执行程序service-gen-linux与header_parser.exe同级目录下，如下所示：

	harmony@Ubuntu-64:~/service/napi_generator_8/hdc/service-gen/examples$ ls
	exam.h  header_parser  service-gen-linux

3.在终端中进入到可执行程序service-gen-linux所在的目录，并运行service-gen-linux，命令如下：

	harmony@Ubuntu-64:~/service/napi_generator_8/hdc/service-gen/examples$ ./service-gen-linux -f exam.h -o ./ -s 9001 

其中,参数详情如下：
  -f，定义远程服务的.h文件；
  -d, 指定目录下的.h文件；
  -o, 生成框架代码输入到指定路径下；
  -s, 指定serviceID。

4.运行成功后会在当前目录下生成对应的文件，如下所示：

	harmony@Ubuntu-64:~/service/napi_generator_8/hdc/service-gen/examples$ ls
	exam.h  header_parser  napi_gen.log  service-gen-linux  testaservice

#### Windows

1.下载python脚本可执行程序header_parser.exe与linux可执行程序service-gen-win.exe，下载链接如下：

[下载链接](暂无)

2.将要转换的.h文件放到任意目录下，建议放到可执行程序service-gen-win.exe与header_parser.exe同级目录下，如下所示：

	E:\demo\service>dir /B
	exam.h
	header_parser.exe
	service-gen-win.exe

3.在终端中进入到可执行程序service-gen-win.exe所在的目录，并运行service-gen-win.exe，命令如下：

	E:\demo\service>service-gen-win.exe -f exam.h -o ./ -s 9001 

其中,参数详情如下：
  -f，定义远程服务的.h文件；
  -d,指定目录下的.h文件；
  -o,生成框架代码输入到指定路径下；
  -s,指定serviceID。

4.运行成功后会在当前目录下生成对应的文件，如下所示：

	E:\demo\service>dir /B
	exam.h
	header_parser.exe
	napi_gen.log
	service-gen-win.exe
	testaservice

#### Mac

方法步骤参考windows、Linux的使用方法。

### VS Code插件使用方法

具体的插件使用步骤，可以左键单击以下链接了解：

[VS插件使用说明](https://gitee.com/openharmony/napi_generator/tree/master/hdc/service/service_vs_plugin/docs/INSTRUCTION_ZH.md)

### IntelliJ插件使用方法

具体的插件使用步骤，可以左键单击以下链接了解：

[IntelliJ插件使用说明](https://gitee.com/openharmony/napi_generator/tree/master/hdc/service/service_IntelliJ_plugin/docs/INSTRUCTION_ZH.md)