# mock 文件持久化实现计划

> **给执行代理的说明：** 必须逐项执行本计划。推荐使用 `superpowers:subagent-driven-development`，也可以使用 `superpowers:executing-plans`。任务使用复选框语法记录进度。

**目标：** 把用户账本数据保存到 `mock/ledger-data.json`，替代浏览器 `localStorage`。

**架构：** 新增一个本地文件数据层，由 Vite 开发服务器 API 使用。Vue 应用通过 `/api/ledger-data` 加载和保存账本状态，纯账本计算逻辑保持不变。

**技术栈：** Vue 3、TypeScript、Vite dev server middleware、Vitest、Node `fs/promises`。

---

## 文件结构

- 创建 `mock/ledger-data.json`：持久化账本数据文件。
- 创建 `server/mockDataStore.ts`：JSON 文件读写、校验和默认值兜底。
- 创建 `server/mockApiPlugin.ts`：Vite 中间件，提供 `GET /api/ledger-data` 和 `POST /api/ledger-data`。
- 创建 `server/mockDataStore.test.ts`：覆盖文件读取、写入和默认值行为。
- 修改 `src/types.ts`：新增 `LedgerData`。
- 修改 `src/lib/storage.ts`：把 `localStorage` 辅助函数替换为异步 API 客户端。
- 修改 `src/lib/storage.test.ts`：使用 mocked `fetch` 测试 API 客户端加载和保存行为。
- 修改 `src/App.vue`：异步加载账本数据，并在用户编辑后把完整 `LedgerData` 保存到 API。
- 修改 `vite.config.ts`：安装 mock API 插件。
- 修改 `README.md`：说明 `mock/ledger-data.json` 持久化方式和 GitHub Pages 限制。

## 任务清单

- [ ] 为 `server/mockDataStore.ts` 编写失败测试，覆盖读取默认值和写入 JSON。
- [ ] 实现 `mock/ledger-data.json`、`server/mockDataStore.ts` 和 `server/mockApiPlugin.ts`。
- [ ] 为异步 `src/lib/storage.ts` API 辅助函数编写失败测试，使用 mocked `fetch`。
- [ ] 实现异步前端存储辅助函数。
- [ ] 更新 `src/App.vue`，改为加载和保存 `LedgerData`。
- [ ] 更新 README。
- [ ] 运行 `npm run test` 和 `npm run build`。
- [ ] 使用中文提交信息提交，并推送到 `origin/main`。
