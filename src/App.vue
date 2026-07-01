<template>
  <main class="app-shell">
    <section class="app-header">
      <div>
        <p class="eyebrow">Gold Ledger</p>
        <h1>黄金小账本</h1>
        <p>记录每一笔黄金买卖，清楚看到持仓、浮盈和已实现盈亏。</p>
      </div>
      <GoldPriceInput
        :disabled="isLoading"
        :loading="isPriceLoading"
        :model-value="currentGoldPrice"
        :source="currentGoldPriceSource"
        @refresh="handleGoldPriceRefresh"
      />
    </section>

    <SummaryCards :summary="summary" />

    <section class="workspace-grid">
      <TransactionForm
        :disabled="isLoading"
        :editing-transaction="editingTransaction"
        :reset-token="formResetToken"
        @cancel-edit="editingTransaction = null"
        @save="handleTransactionSave"
      />

      <div class="ledger-panel">
        <TransactionTable
          v-if="transactions.length > 0"
          :filter="transactionFilter"
          :transactions="filteredTransactions"
          @delete="handleTransactionDelete"
          @edit="handleTransactionEdit"
          @update:filter="handleFilterChange"
        />
        <EmptyLedger v-else />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import EmptyLedger from "./components/EmptyLedger.vue";
import GoldPriceInput from "./components/GoldPriceInput.vue";
import SummaryCards from "./components/SummaryCards.vue";
import TransactionForm from "./components/TransactionForm.vue";
import TransactionTable from "./components/TransactionTable.vue";
import {
  calculateLedger,
  sortTransactionsForDisplay,
  validateTransactionDraft
} from "./lib/goldLedger";
import {
  loadCurrentGoldPrice,
  loadLedgerData,
  saveLedgerData
} from "./lib/storage";
import type {
  GoldTransaction,
  LedgerData,
  TransactionDraft,
  TransactionFilter
} from "./types";

const transactions = ref<GoldTransaction[]>([]);
const currentGoldPrice = ref(0);
const transactionFilter = ref<TransactionFilter>("all");
const editingTransaction = ref<GoldTransaction | null>(null);
const formResetToken = ref(0);
const isLoading = ref(true);
const isPriceLoading = ref(false);
const currentGoldPriceSource = ref("");

const summary = computed(() =>
  calculateLedger(transactions.value, currentGoldPrice.value)
);

const filteredTransactions = computed(() => {
  const rows = sortTransactionsForDisplay(transactions.value);
  return transactionFilter.value === "all"
    ? rows
    : rows.filter((transaction) => transaction.type === transactionFilter.value);
});

function createTransactionId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function buildLedgerData(overrides: Partial<LedgerData> = {}): LedgerData {
  return {
    currentGoldPrice: currentGoldPrice.value,
    transactionFilter: transactionFilter.value,
    transactions: transactions.value,
    ...overrides
  };
}

function applyLedgerData(data: LedgerData): void {
  currentGoldPrice.value = data.currentGoldPrice;
  transactionFilter.value = data.transactionFilter;
  transactions.value = data.transactions;
}

async function persistLedgerData(data: LedgerData): Promise<boolean> {
  try {
    applyLedgerData(await saveLedgerData(data));
    return true;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "保存账本数据失败");
    return false;
  }
}

onMounted(async () => {
  applyLedgerData(await loadLedgerData());
  isLoading.value = false;
  await refreshCurrentGoldPrice();
});

async function refreshCurrentGoldPrice(showSuccess = false): Promise<void> {
  if (isPriceLoading.value) {
    return;
  }

  isPriceLoading.value = true;
  try {
    const currentPrice = await loadCurrentGoldPrice();
    if (!currentPrice) {
      ElMessage.warning("当前金价获取失败，已继续使用上次保存的金价");
      return;
    }

    const saved = await persistLedgerData(
      buildLedgerData({ currentGoldPrice: currentPrice.price })
    );

    if (saved) {
      currentGoldPriceSource.value = currentPrice.source;
      if (showSuccess) {
        ElMessage.success("当前金价已刷新");
      }
    }
  } finally {
    isPriceLoading.value = false;
  }
}

async function handleGoldPriceRefresh(): Promise<void> {
  await refreshCurrentGoldPrice(true);
}

async function handleFilterChange(filter: TransactionFilter): Promise<void> {
  await persistLedgerData(buildLedgerData({ transactionFilter: filter }));
}

function handleTransactionEdit(transaction: GoldTransaction): void {
  editingTransaction.value = transaction;
}

async function handleTransactionDelete(id: string): Promise<void> {
  const saved = await persistLedgerData(
    buildLedgerData({
      transactions: transactions.value.filter(
        (transaction) => transaction.id !== id
      )
    })
  );

  if (!saved) {
    return;
  }

  if (editingTransaction.value?.id === id) {
    editingTransaction.value = null;
  }

  ElMessage.success("交易已删除");
}

async function handleTransactionSave(draft: TransactionDraft): Promise<void> {
  const editingId = editingTransaction.value?.id;
  const errors = validateTransactionDraft(
    draft,
    transactions.value,
    editingId
  );

  if (errors.length > 0) {
    ElMessage.error(errors[0]);
    return;
  }

  if (editingId) {
    const saved = await persistLedgerData(
      buildLedgerData({
        transactions: transactions.value.map((transaction) =>
          transaction.id === editingId
            ? { id: editingId, ...draft }
            : transaction
        )
      })
    );
    if (!saved) {
      return;
    }

    editingTransaction.value = null;
    ElMessage.success("交易已更新");
  } else {
    const saved = await persistLedgerData(
      buildLedgerData({
        transactions: [
          ...transactions.value,
          {
            id: createTransactionId(),
            ...draft
          }
        ]
      })
    );
    if (!saved) {
      return;
    }

    ElMessage.success("交易已添加");
  }

  formResetToken.value += 1;
}
</script>
