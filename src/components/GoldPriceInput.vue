<template>
  <div class="price-cards-row">
    <el-card class="bank-sell-price-card" shadow="never">
      <span class="field-label">当前卖出价</span>
      <div class="bank-sell-price-value">
        <strong>{{ formatPrice(bankSellPrice) }}</strong>
        <span>元/克</span>
      </div>
      <p class="bank-sell-price-note">当前金价 - 3.8 元/克</p>
    </el-card>

    <el-card class="gold-price-card" shadow="never">
      <div class="price-card-header">
        <div class="price-title-line">
          <span class="field-label">当前金价</span>
          <span class="price-source-badge">
            {{ source ? `来自 ${source}` : "等待行情源返回" }}
          </span>
        </div>
        <el-button
          :disabled="disabled"
          :icon="Refresh"
          :loading="loading"
          size="small"
          text
          @click="emit('refresh')"
        >
          刷新
        </el-button>
      </div>

      <div class="current-price-line">
        <strong>{{ formatPrice(modelValue) }}</strong>
        <span>元/克</span>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Refresh } from "@element-plus/icons-vue";
import { computed } from "vue";
import { calculateBankSellPrice } from "../lib/goldLedger";

const props = defineProps<{
  disabled?: boolean;
  loading?: boolean;
  modelValue: number;
  source?: string;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const bankSellPrice = computed(() => calculateBankSellPrice(props.modelValue));

function formatPrice(price: number): string {
  if (!Number.isFinite(price) || price <= 0) {
    return "--";
  }

  return price.toFixed(2);
}
</script>
