<template>
  <section class="summary-grid" aria-label="账本总览">
    <el-card
      v-for="item in summaryItems"
      :key="item.label"
      class="summary-card"
      shadow="never"
    >
      <p class="summary-label">{{ item.label }}</p>
      <p :class="['summary-value', item.tone]">{{ item.value }}</p>
      <p class="summary-hint">{{ item.hint }}</p>
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { LedgerSummary } from "../types";

const props = defineProps<{
  summary: LedgerSummary;
}>();

function formatMoney(value: number): string {
  return `¥${value.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatSignedMoney(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatMoney(value)}`;
}

function formatGrams(value: number): string {
  return `${value.toLocaleString("zh-CN", {
    maximumFractionDigits: 4
  })} g`;
}

function tone(value: number): string {
  if (value > 0) {
    return "is-profit";
  }

  if (value < 0) {
    return "is-loss";
  }

  return "";
}

const summaryItems = computed(() => [
  {
    label: "持仓克数",
    value: formatGrams(props.summary.holdingGrams),
    hint: "当前剩余黄金",
    tone: ""
  },
  {
    label: "剩余成本",
    value: formatMoney(props.summary.remainingCost),
    hint: "未卖出部分成本",
    tone: ""
  },
  {
    label: "当前估值",
    value: formatMoney(props.summary.currentValue),
    hint: "当前金价 × 持仓克数",
    tone: ""
  },
  {
    label: "持仓浮盈",
    value: formatSignedMoney(props.summary.unrealizedProfitLoss),
    hint: "未卖出部分盈亏",
    tone: tone(props.summary.unrealizedProfitLoss)
  },
  {
    label: "已实现盈亏",
    value: formatSignedMoney(props.summary.realizedProfitLoss),
    hint: "卖出后锁定的盈亏",
    tone: tone(props.summary.realizedProfitLoss)
  },
  {
    label: "总盈亏",
    value: formatSignedMoney(props.summary.totalProfitLoss),
    hint: "已实现 + 持仓浮盈",
    tone: tone(props.summary.totalProfitLoss)
  }
]);
</script>
