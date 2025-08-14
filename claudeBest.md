### Claude Code：代理式编码最佳实践（中文要点摘要）

来源：[Claude Code: Best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices)

—— 发布于 2025-04-18，概述了在不同代码库、语言与环境中高效使用 Claude Code（命令行代理式编码工具）的实践建议。

## 适用对象
- **工程师/研究者**：希望把 Claude 融入日常命令行/自动化工作流。
- **团队维护者**：希望统一项目约定、工具白名单、工作流与文档。

## 关键实践速览
- **定制环境**：编写并持续打磨 `CLAUDE.md`；调优提示；建立工具白名单；安装 `gh` CLI。
- **赋能工具**：让 Claude 使用 Bash 工具、自定义脚本、MCP 服务器；提供使用说明与 `--help` 文档；配置自定义 Slash 命令。
- **聚焦上下文**：用 `/clear` 定期清空上下文；用清单/草稿本（Markdown 或 Issue）驱动复杂任务。
- **数据输入**：剪贴板、管道输入（如 `cat foo.txt | claude`）、命令拉取、读取文件、抓取 URL/图片。
- **无头模式自动化**：`claude -p` + `--output-format stream-json`；用于问题分拣、主观“类 Linter”检查等。
- **多 Claude 协作**：分工编写/评审/测试；多仓库检出或 `git worktree`；基于 headless 的批处理/流水线。

## 1. 定制你的设置
### a. 创建与组织 `CLAUDE.md`
- `CLAUDE.md` 会被自动纳入上下文，建议记录：常用命令、核心文件/工具、代码风格、测试指令、协作流程、环境要求、异常/踩坑提示等。
- 放置位置（均可被使用）：
  - 仓库根目录（团队共享，推荐）/ `CLAUDE.local.md`（忽略入 git）。
  - 运行目录的父目录（适合 Monorepo）。
  - 子目录（按需拉取子项目说明）。
  - 用户级别 `~/.claude/CLAUDE.md`（所有会话生效）。
- 运行 `/init` 可自动生成初稿。

### b. 持续打磨 `CLAUDE.md`
- 把它当“提示词的一部分”反复调优，避免无效堆料；可用提示增强词（如 “IMPORTANT”/“YOU MUST”）提升遵循度。
- 在会话中按 `#` 可将指令写回 `CLAUDE.md`，纳入版本控制，团队共享。

### c. 管理工具白名单（安全优先）
- 允许方式：
  - 会话提示选择 “Always allow”。
  - 用 `/permissions` 添加/移除（如允许 `Edit`，`Bash(git commit:*)`）。
  - 编辑 `.claude/settings.json` 或 `~/.claude.json`。
  - CLI 传 `--allowedTools` 仅对本次会话生效。

### d. 集成 GitHub CLI
- 安装 `gh` 以便创建/查看 Issue、PR、评论等；若无 `gh`，也可经 API 或 MCP 使用。

## 2. 给 Claude 更多工具
### a. Bash 工具与自定义脚本
- 向 Claude 说明工具名称、典型用法，并可让其运行 `--help` 获取帮助；把常用工具写入 `CLAUDE.md`。

### b. MCP（Model Context Protocol）
- 作为客户端连接多个 MCP 服务器：项目配置、全局配置或仓库内 `.mcp.json`（团队即装即用）。
- 排查配置问题可用 `--mcp-debug`。

### c. 自定义 Slash 命令
- 在 `.claude/commands` 存放 Markdown 模板，调用时通过 `/` 菜单选择。
- 支持 `$ARGUMENTS` 作为参数占位符，适合固定化工作流（如自动拉取并修复某个 GitHub Issue）。

## 3. 保持上下文专注与可控
### a. 用 `/clear` 重置会话
- 长会话容易混入无关上下文，影响效果；在任务间勤用 `/clear`。

### b. 用清单/草稿本推进复杂任务
- 先把 Lint/构建错误或待办列表写成 Markdown 清单，再逐项勾选修复；适用于大规模改造、迁移、脚本化修复。

### c. 多种数据注入方式
- 直接粘贴、管道传入（日志/CSV/大数据）、命令抓取、读取文件/URL/图片；通常混合使用更高效。

## 4. 无头模式（Headless）用于自动化/CI
- 用 `claude -p "<prompt>" --output-format stream-json` 在非交互环境运行；会话不持久，每次需重新触发。
- 典型用法：
  - **Issue 分拣**：自动读取新 Issue 并分配标签。
  - **“类 Linter”**：做主观代码审查（命名、注释、异味等），补充传统 Lint 的不足。

## 5. 多 Claude 协作/并行化
### a. 写-审-改 分离
- 一个 Claude 写代码；另一个评审；再开一个据评审改代码。也可一组写测试，另一组补实现。

### b. 多检出与 `git worktree`
- 并行独立任务：
  - 多目录多检出，或用 `git worktree` 轻量多分支并行（共享历史，目录隔离）。
  - 建议统一命名、每任务一终端标签、IDE 多窗口、完成后清理 worktree。

### c. 结合无头模式的自动化
- 两种模式：
  - **Fanning out（发散批处理）**：批量迁移/分析，循环调用 `claude -p` 并限制允许工具（如 `Edit`、`Bash(git commit:*)`）。
  - **Pipelining（流水线）**：`claude -p "..." --json | next_step` 把结构化输出接入后续环节；调试期可 `--verbose`，生产建议关闭。

## 实操清单（可复制）
1) 新建/完善 `CLAUDE.md`
   - 记录：构建/测试命令、代码风格、关键约定、目录结构、常见坑、环境说明。
   - 用“必须”和强调语提升遵循度；用 `#` 快速补充；纳入版本控制。
2) 设置工具白名单
   - 允许 `Edit`；必要时允许 `Bash(git commit:*)`；团队统一 `.claude/settings.json`。
3) 准备常用工具
   - 安装并登录 `gh`；为内部脚本写 `--help`；在 `CLAUDE.md` 提供示例。
4) 配置 MCP 与 Slash 命令
   - 在 `.mcp.json` 接入常用服务；在 `.claude/commands` 存放模板，使用 `$ARGUMENTS`。
5) 养成会话卫生
   - 任务切换用 `/clear`；复杂任务用 Markdown 清单/Issue 追踪。
6) 自动化与并行
   - 在 CI 或批处理用 `claude -p`；大型任务用 fanning out；数据管线用 pipelining。
   - 并行独立任务用多检出或 `git worktree`。

## 备注
- 以上实践并非金科玉律，需结合项目与团队习惯灵活采用与迭代。
- 建议从小范围试点（单目录/单任务）开始，逐步扩大覆盖面。


