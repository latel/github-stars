# GitHub Stars MCP 服务器

一个基于 Cloudflare 的 MCP（Model Context Protocol）服务器，允许您使用自然语言搜索和查询您的 GitHub 标星仓库。

[English](/README.md) | 简体中文

---

## 概述

该项目通过以下步骤创建了一个可搜索的 GitHub 标星仓库数据库：

1. 使用 GitHub API 获取您所有的标星仓库
2. 从每个仓库中提取并处理 README 文件
3. 将处理后的数据上传到 Cloudflare R2 存储
4. 使用 Cloudflare AutoRAG 创建嵌入向量以实现高效搜索
5. 提供一个 MCP 服务器，允许通过自然语言查询这些仓库

## 特性

- 自动获取并处理 GitHub 标星仓库
- 通过 GitHub Actions 安排每周更新
- 存储仓库元数据和 README 内容
- 通过 Cloudflare AutoRAG 提供语义搜索功能
- 提供与 AI 代理集成的 MCP 兼容 API

## 设置

### 前提条件

- Node.js（推荐 v22）
- PNPM 包管理器
- GitHub 个人访问令牌（具有 `repo` 权限）
- Cloudflare 账户

### 配置

1. 克隆此仓库
2. 设置 Cloudflare R2：
   - 创建一个 R2 存储桶
   - 配置 R2 访问凭证

3. 为 CI/CD 工作流配置 GitHub Secrets：
   - `GITHUB_TOKEN`：用于获取标星仓库的 GitHub 令牌
   - `R2_ACCOUNT_ID`：Cloudflare 账户 ID
   - `R2_ACCESS_KEY_ID`：R2 访问密钥
   - `R2_SECRET_ACCESS_KEY`：R2 密钥
   - `R2_BUCKET`：R2 存储桶名称

4. 配置 Cloudflare AutoRAG：
   - 在 Cloudflare 中创建一个 AutoRAG 实例
   - 在 Cloudflare Worker 中设置 `AUTO_RAG_NAME` 环境变量

### 本地开发

本地开发：

```bash
# 安装依赖
pnpm install

# 在本地获取您的 GitHub 标星
pnpm dev:stars

# 本地运行 MCP 服务器
pnpm dev:mcp
```

### 部署

部署到 Cloudflare Workers：

```bash
pnpm deploy
```

GitHub Action 将自动：

1. 每周运行以更新您的标星仓库
2. 将处理后的文件上传到 R2
3. 重建 AutoRAG 索引

## 使用方法

部署后，您可以使用任何 MCP 兼容客户端与 MCP 服务器交互：

SSE: `https://your-worker-url.workers.dev`

## API 参考

### MCP 工具：`search_github_stars`

搜索您标星的 GitHub 仓库。

参数：

- `query`（字符串）：搜索仓库的自然语言查询

响应：

- 包含匹配仓库和相关 README 内容的 JSON 结果
