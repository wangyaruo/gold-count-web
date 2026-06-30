# 黄金小账本初始实现计划

> **给执行代理的说明：** 必须逐项执行本计划。推荐使用 `superpowers:subagent-driven-development`，也可以使用 `superpowers:executing-plans`。任务使用复选框语法记录进度。

> **状态说明：** 这份计划描述的是项目初始版本，数据持久化目标是浏览器 `localStorage`。后续把数据迁移到 `mock/ledger-data.json` 的工作见 `docs/superpowers/plans/2026-06-30-mock-file-persistence.md`。

**目标：** 构建并推送一个 Vue 3 + Element Plus 的个人黄金账本，用来记录黄金买入和卖出交易，并展示当前持仓、已实现盈亏、持仓浮盈和总盈亏。

**架构：** 使用纯前端 Vite 应用。账本计算放在纯 TypeScript 模块中，浏览器本地持久化放在独立存储模块中，Vue 组件只负责交互和展示。

**技术栈：** Vue 3、TypeScript、Vite、Element Plus、Vitest、vue-tsc。

---

## 文件结构

- 创建 `package.json`：项目脚本和依赖。
- 创建 `index.html`、`vite.config.ts`、`tsconfig.json`、`tsconfig.node.json`：Vite 和 TypeScript 配置。
- 创建 `src/main.ts`：Vue 应用启动和 Element Plus 注册。
- 创建 `src/App.vue`：应用外壳、状态协调、新增、编辑、删除处理。
- 创建 `src/types.ts`：共享交易、表单和汇总类型。
- 创建 `src/lib/goldLedger.ts`：纯 FIFO 计算和交易校验逻辑。
- 创建 `src/lib/goldLedger.test.ts`：计算规则的 Vitest 覆盖。
- 创建 `src/lib/storage.ts`：`localStorage` 读写辅助函数和解析兜底。
- 创建 `src/components/SummaryCards.vue`：汇总指标展示。
- 创建 `src/components/GoldPriceInput.vue`：当前金价编辑器。
- 创建 `src/components/TransactionForm.vue`：新增和编辑交易表单。
- 创建 `src/components/TransactionTable.vue`：带筛选和操作的交易表格。
- 创建 `src/components/EmptyLedger.vue`：空状态。
- 创建 `src/styles.css`：应用级响应式样式和 Element Plus 样式微调。
- 创建 `.gitignore`、`README.md`：仓库忽略规则和使用说明。

## 任务 1：项目脚手架

**文件：**

- 创建 `package.json`
- 创建 `index.html`
- 创建 `vite.config.ts`
- 创建 `tsconfig.json`
- 创建 `tsconfig.node.json`
- 创建 `src/main.ts`
- 创建 `src/App.vue`
- 创建 `src/styles.css`
- 创建 `.gitignore`

- [ ] **步骤 1：创建 Vite Vue 项目文件**

使用 Vue 3、TypeScript、Element Plus、Vitest 和 vue-tsc 脚本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **步骤 2：安装依赖**

运行：

```bash
npm install
```

预期结果：依赖安装成功，并生成 `package-lock.json`。

- [ ] **步骤 3：验证脚手架构建**

运行：

```bash
npm run build
```

预期结果：初始应用编译成功，构建命令以状态码 0 退出。

- [ ] **步骤 4：提交脚手架**

```bash
git add .
git commit -m "初始化 Vue 黄金账本脚手架"
```

## 任务 2：用 TDD 实现账本计算

**文件：**

- 创建 `src/types.ts`
- 创建 `src/lib/goldLedger.test.ts`
- 创建 `src/lib/goldLedger.ts`

- [ ] **步骤 1：先写失败测试**

覆盖以下场景：

```ts
it("calculates buy-only holdings with fees", () => {});
it("matches sells against oldest buy lots first", () => {});
it("applies sell fees to realized profit", () => {});
it("keeps remaining cost after partial sells", () => {});
it("calculates unrealized and total profit from current price", () => {});
it("reports oversell validation errors", () => {});
```

- [ ] **步骤 2：运行测试确认 RED**

运行：

```bash
npm run test -- src/lib/goldLedger.test.ts
```

预期结果：测试失败，因为 `goldLedger` 实现尚不存在。

- [ ] **步骤 3：实现最小账本模块**

实现：

```ts
export function calculateLedger(transactions: GoldTransaction[], currentGoldPrice: number): LedgerSummary;
export function validateTransactionDraft(draft: TransactionDraft, existing: GoldTransaction[], editingId?: string): string[];
export function sortTransactionsForDisplay(transactions: GoldTransaction[]): GoldTransaction[];
```

使用 FIFO 买入批次。每个批次记录剩余克数和剩余成本。

- [ ] **步骤 4：运行测试确认 GREEN**

运行：

```bash
npm run test -- src/lib/goldLedger.test.ts
```

预期结果：所有账本计算测试通过。

- [ ] **步骤 5：提交账本逻辑**

```bash
git add src/types.ts src/lib/goldLedger.ts src/lib/goldLedger.test.ts
git commit -m "新增黄金账本计算逻辑"
```

## 任务 3：本地存储模块

**文件：**

- 创建 `src/lib/storage.ts`

- [ ] **步骤 1：添加存储辅助函数**

实现交易、当前金价和交易筛选条件的读写函数。无效 JSON 需要回退到默认值。

- [ ] **步骤 2：运行类型和构建检查**

运行：

```bash
npm run build
```

预期结果：TypeScript 和 Vite 构建通过。

- [ ] **步骤 3：提交存储模块**

```bash
git add src/lib/storage.ts
git commit -m "新增本地账本持久化"
```

## 任务 4：Vue 组件

**文件：**

- 创建 `src/components/SummaryCards.vue`
- 创建 `src/components/GoldPriceInput.vue`
- 创建 `src/components/TransactionForm.vue`
- 创建 `src/components/TransactionTable.vue`
- 创建 `src/components/EmptyLedger.vue`
- 修改 `src/App.vue`

- [ ] **步骤 1：构建展示组件**

使用 Element Plus 组件创建汇总卡片、金价输入、空状态和表格组件，例如 `el-card`、`el-statistic`、`el-input-number`、`el-table`、`el-segmented`、`el-button` 和 `el-popconfirm`。

- [ ] **步骤 2：构建交易表单**

使用 `el-form`、`el-date-picker`、`el-radio-group`、`el-input-number` 和 `el-input`。校验必填日期、必填类型、克数大于 0、单价大于 0、费用不小于 0。

- [ ] **步骤 3：串联应用状态**

`App.vue` 加载已保存数据，通过 `calculateLedger` 计算汇总，通过 `validateTransactionDraft` 阻止超卖，并在数据变化后保存。

- [ ] **步骤 4：运行构建**

运行：

```bash
npm run build
```

预期结果：应用和所有组件编译通过。

- [ ] **步骤 5：提交界面**

```bash
git add src
git commit -m "构建黄金账本界面"
```

## 任务 5：样式、文档、验证和推送

**文件：**

- 修改 `src/styles.css`
- 修改 `README.md`

- [ ] **步骤 1：编写响应式布局样式**

首屏直接展示账本本身，使用紧凑的财务工具布局、响应式堆叠、稳定卡片尺寸，不做营销式首页。

- [ ] **步骤 2：编写使用文档**

在 README 中说明安装、开发、测试、构建、数据保存方式和计算规则。

- [ ] **步骤 3：运行最终验证**

运行：

```bash
npm run test
npm run build
```

预期结果：测试通过，生产构建以状态码 0 退出。

- [ ] **步骤 4：添加 GitHub 远端并推送**

运行：

```bash
git remote add origin git@github.com:wangyaruo/gold-count-web.git
git branch -M main
git push -u origin main
```

预期结果：`main` 分支推送到 `wangyaruo/gold-count-web`。
