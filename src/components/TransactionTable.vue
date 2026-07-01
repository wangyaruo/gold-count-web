<template>
  <el-card class="table-card" shadow="never">
    <template #header>
      <div class="panel-header table-header">
        <div>
          <p class="panel-kicker">Records</p>
          <h2>交易明细</h2>
        </div>
        <el-segmented v-model="selectedFilter" :options="filterOptions" />
      </div>
    </template>

    <div class="table-scroll">
      <el-table :data="transactions" class="transaction-table">
        <el-table-column label="日期" prop="date" min-width="112" />
        <el-table-column label="类型" min-width="86">
          <template #default="{ row }">
            <el-tag :type="row.type === 'buy' ? 'success' : 'warning'">
              {{ row.type === "buy" ? "买入" : "卖出" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="克数" min-width="96" align="right">
          <template #default="{ row }">{{ formatGrams(row.grams) }}</template>
        </el-table-column>
        <el-table-column label="单价" min-width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.unitPrice) }}</template>
        </el-table-column>
        <el-table-column label="费用" min-width="100" align="right">
          <template #default="{ row }">{{ formatMoney(row.amount) }}</template>
        </el-table-column>
        <el-table-column label="备注" prop="note" min-width="150" />
        <el-table-column label="操作" fixed="right" width="132">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button
                :icon="Edit"
                circle
                title="编辑"
                @click="emit('edit', row)"
              />
              <el-popconfirm
                title="确认删除这笔交易？"
                confirm-button-text="删除"
                cancel-button-text="取消"
                @confirm="emit('delete', row.id)"
              >
                <template #reference>
                  <el-button :icon="Delete" circle title="删除" type="danger" />
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { Delete, Edit } from "@element-plus/icons-vue";
import { computed } from "vue";
import type {
  GoldTransaction,
  TransactionFilter
} from "../types";

const props = defineProps<{
  transactions: GoldTransaction[];
  filter: TransactionFilter;
}>();

const emit = defineEmits<{
  edit: [transaction: GoldTransaction];
  delete: [id: string];
  "update:filter": [filter: TransactionFilter];
}>();

const filterOptions = [
  { label: "全部", value: "all" },
  { label: "买入", value: "buy" },
  { label: "卖出", value: "sell" }
];

const selectedFilter = computed({
  get: () => props.filter,
  set: (value) => emit("update:filter", value as TransactionFilter)
});

function formatMoney(value: number): string {
  return `¥${value.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatGrams(value: number): string {
  return `${value.toLocaleString("zh-CN", {
    maximumFractionDigits: 4
  })} g`;
}

</script>
