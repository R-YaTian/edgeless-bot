# 安装与使用

## 快速开始

确保你已经安装 [Node.js](https://nodejs.org/) 16+ 、 [yarn](https://yarnpkg.com/) 包管理器以及[二进制](#二进制)后，克隆仓库后执行以下命令：

```shell
yarn && yarn dev
```

## 二进制

Edgeless Bot 依赖于一些第三方软件维持运行。为了避免直接整合源代码导致的复杂依赖问题，我们需要你手动安装一些二进制程序。

我们推荐使用包管理器来安装这些程序，比如 Windows 平台的 [Scoop](https://scoop.sh) 或是 Linux / MacOS 平台的 [Homebrew](https://brew.sh/)
等。你可以将相应二进制文件直接放在项目根目录的 `bin` 目录下，或是项目根目录下(不推荐)。

### Aria2

官方网站 https://aria2.github.io/ ，可以使用如下命令安装：

```shell
# Windows
scoop install aria2

# Linux / MacOS
brew install aria2
```

### 7-Zip

官方网站 https://www.7-zip.org/ ，可以使用如下命令安装：

```shell
# Windows
scoop install 7zip
# Linux / MacOS
brew install 7zip
```

### Rclone (选装)

官方网站 https://rclone.org ，如果需要启用远程功能则需要安装，可以使用如下命令安装：

```shell
# Windows
scoop install rclone
# Linux / MacOS
brew install rclone
```

### PECMD (自带)

在执行仅 Windows 平台任务时需要使用，已经预置在 GitHub 仓库的 `bin` 文件夹内。

## 配置

Edgeless Bot 的配置文件默认为项目根目录下的 `config.toml` 文件，如果你不熟悉 toml 的语法规范请访问 [https://toml.io/](https://toml.io/) 了解更多。

```toml
# 是否启用数据库更新
DATABASE_UPDATE = true
# 数据库存储路径
DATABASE_PATH = "./database.json"

# 是否启用远程功能
REMOTE_ENABLE = false
# 远程存储的rclone名称
REMOTE_NAME = "pineapple"
# 远程存储路径
REMOTE_PATH = "/hdisk/edgeless/插件包"

# 任务存储路径
DIR_TASKS = "./tasks"
# 临时工作目录路径
DIR_WORKSHOP = "./workshop"
# 构建存储路径
DIR_BUILDS = "./builds"

# 允许同时存在的最大构建数量
MAX_BUILDS = 1
# 允许的最大爬虫重试次数
MAX_RETRY_SCRAPER = 3
# 允许的最大解析器重试次数
MAX_RETRY_RESOLVER = 1

# 是否启动aria2c
ARIA2_SPAWN = true
# aria2c rpc监听端口
ARIA2_PORT = 16800
# aria2c密钥
#ARIA2_SECRET = "edgeless"
# 最大下载线程数
ARIA2_THREAD = 4
# 全局网络代理
#GLOBAL_PROXY = "http://localhost:8888"

```

通常来说需要修改的配置项不多，可以根据实际情况进行调整。此外 Edgeless Bot 还依赖于一些常量控制程序的行为，你可以在`src/const.ts`中找到它们。

## 参数

Edgeless Bot 支持以下参数的组合使用：

**-d**

Debug，此模式下的数据库更新和远程功能会被禁用，此外可能还有一些微小差异。实践中通常使用`yarn dev` 等效代替 `yarn serve -d`。

示例：`yarn dev` 以调试模式运行全部任务

**-t**

Task(s)，指定需要执行的任务；若需要执行多个任务则添加`""`并用`,`分割不同的任务。不指定此参数时会执行全部任务。

示例：`yarn serve -t "TaskA,Task B,Long name task C"` 仅执行上述三个任务

**-f**

Force，忽略与本地数据库的版本号对比强制重新构建任务，通常与`-t`参数同时给定。

示例：`yarn serve -f -t TaskA` 强制重新构建 TaskA

**-g**

GitHub Actions，通常情况下不需要用到此模式，当 Edgeless Bot 在 GitHub Actions 运行时需要给定此参数用于改善一些行为。

**-c**

Cache，启用下载缓存，仅在 Debug 模式下可用，此时 Bot 会缓存下载的文件到根目录的 `cache` 文件夹中以减少因下载文件产生的不必要等待。

示例：`yarn dev -c -t TaskA` 缓存调试 TaskA 时下载的文件

**-e**

Env，配置环境变量，使用 `key=value` 的格式输入键值对并使用 `,` 分割。

示例：`yarn dev -e "GITHUB_TOKEN=XXX,SECRET=xxx" -t TaskA` 配置环境变量并调试 TaskA

## 环境变量
在项目根目录中放置 `env.json` 作为需要加载的环境变量键值对，例如可以使用以下内容为 GitHub_Release 爬虫和解析器增加验证 token：
```json
{
  "GITHUB_TOKEN": "XXX"
}
```

你也可以通过 `-e` 参数添加环境变量，详见上方