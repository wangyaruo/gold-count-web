<template>
  <el-card class="form-card" shadow="never">
    <template #header>
      <div class="panel-header">
        <div>
          <p class="panel-kicker">Transaction</p>
          <h2>{{ editingTransaction ? "编辑交易" : "新增交易" }}</h2>
        </div>
        <el-button
          v-if="editingTransaction"
          :icon="Close"
          :disabled="disabled"
          text
          @click="emit('cancel-edit')"
        >
          取消
        </el-button>
      </div>
    </template>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="transaction-form"
      @submit.prevent
    >
      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio-button label="buy">买入</el-radio-button>
          <el-radio-button label="sell">卖出</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="form.date"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          class="full-width"
        />
      </el-form-item>

      <div class="form-row">
        <el-form-item label="克数" prop="grams">
          <el-input-number
            v-model="form.grams"
            :controls="false"
            :min="0"
            :precision="4"
            class="full-width"
            placeholder="克"
            @update:model-value="handleLinkedFieldUpdate('grams', $event)"
          />
        </el-form-item>

        <el-form-item label="单价" prop="unitPrice">
          <el-input-number
            v-model="form.unitPrice"
            :controls="false"
            :min="0"
            :precision="2"
            class="full-width"
            placeholder="元/克"
            @update:model-value="handleLinkedFieldUpdate('unitPrice', $event)"
          />
        </el-form-item>
      </div>

      <el-form-item label="费用" prop="amount">
        <el-input-number
          v-model="form.amount"
          :controls="false"
          :min="0"
          :precision="2"
          class="full-width"
          placeholder="本笔总费用"
          @update:model-value="handleLinkedFieldUpdate('amount', $event)"
        />
      </el-form-item>

      <el-form-item label="备注" prop="note">
        <el-input
          v-model="form.note"
          maxlength="80"
          placeholder="如：周大福手镯、银行金条"
          show-word-limit
        />
      </el-form-item>

      <el-button
        class="submit-button"
        type="primary"
        :disabled="disabled"
        :icon="editingTransaction ? Edit : Plus"
        @click="submitForm"
      >
        {{ editingTransaction ? "保存修改" : "添加交易" }}
      </el-button>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { Close, Edit, Plus } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import { reactive, ref, watch } from "vue";
import {
  deriveLinkedTransactionFields,
  type LinkedTransactionField
} from "../lib/transactionFields";
import type { GoldTransaction, TransactionDraft } from "../types";

const props = defineProps<{
  disabled?: boolean;
  editingTransaction: GoldTransaction | null;
  resetToken: number;
}>();

const emit = defineEmits<{
  save: [draft: TransactionDraft];
  "cancel-edit": [];
}>();

const emptyForm = (): TransactionDraft => ({
  type: "buy",
  date: new Date().toISOString().slice(0, 10),
  grams: 0,
  unitPrice: 0,
  amount: 0,
  note: ""
});

const formRef = ref<FormInstance>();
const form = reactive<TransactionDraft>(emptyForm());
const isDeriving = ref(false);

const rules: FormRules<TransactionDraft> = {
  type: [{ required: true, message: "请选择交易类型", trigger: "change" }],
  date: [{ required: true, message: "请选择交易日期", trigger: "change" }],
  grams: [
    {
      type: "number",
      min: 0.0001,
      message: "克数必须大于 0",
      trigger: "blur"
    }
  ],
  unitPrice: [
    {
      type: "number",
      min: 0.01,
      message: "单价必须大于 0",
      trigger: "blur"
    }
  ],
  amount: [
    {
      type: "number",
      min: 0,
      message: "费用不能小于 0",
      trigger: "blur"
    }
  ]
};

function assignForm(nextForm: TransactionDraft): void {
  Object.assign(form, nextForm);
}

function setLinkedField(field: LinkedTransactionField, value: number): void {
  if (field === "grams") {
    form.grams = value;
  }

  if (field === "amount") {
    form.amount = value;
  }

  if (field === "unitPrice") {
    form.unitPrice = value;
  }
}

function handleLinkedFieldUpdate(
  field: LinkedTransactionField,
  value: number | undefined
): void {
  if (isDeriving.value) {
    return;
  }

  isDeriving.value = true;
  setLinkedField(field, value ?? 0);
  const derivedValues = deriveLinkedTransactionFields(
    {
      grams: form.grams ?? 0,
      amount: form.amount ?? 0,
      unitPrice: form.unitPrice ?? 0
    },
    field
  );

  form.grams = derivedValues.grams;
  form.amount = derivedValues.amount;
  form.unitPrice = derivedValues.unitPrice;
  isDeriving.value = false;
}

watch(
  () => props.editingTransaction,
  (transaction) => {
    assignForm(transaction ? { ...transaction } : emptyForm());
    formRef.value?.clearValidate();
  },
  { immediate: true }
);

watch(
  () => props.resetToken,
  () => {
    assignForm(emptyForm());
    formRef.value?.clearValidate();
  }
);

async function submitForm(): Promise<void> {
  if (!formRef.value) {
    return;
  }

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }

  emit("save", {
    type: form.type,
    date: form.date,
    grams: form.grams ?? 0,
    unitPrice: form.unitPrice ?? 0,
    amount: form.amount ?? 0,
    note: form.note.trim()
  });
}
</script>
