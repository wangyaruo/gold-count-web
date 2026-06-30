<template>
  <el-card class="gold-price-card" shadow="never">
    <label class="field-label" for="current-gold-price">当前金价</label>
    <div class="price-control">
      <el-input-number
        id="current-gold-price"
        v-model="draftPrice"
        :controls="false"
        :min="0"
        :precision="2"
        class="price-input"
        placeholder="元/克"
      />
      <el-button type="primary" :icon="Check" @click="savePrice">
        保存
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { Check } from "@element-plus/icons-vue";
import { ref, watch } from "vue";

const props = defineProps<{
  modelValue: number;
}>();

const emit = defineEmits<{
  save: [price: number];
}>();

const draftPrice = ref(props.modelValue);

watch(
  () => props.modelValue,
  (price) => {
    draftPrice.value = price;
  }
);

function savePrice(): void {
  emit("save", draftPrice.value ?? 0);
}
</script>
