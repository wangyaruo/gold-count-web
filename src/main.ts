import { createApp } from "vue";
import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElPopconfirm,
  ElRadioButton,
  ElRadioGroup,
  ElSegmented,
  ElStatistic,
  ElTable,
  ElTableColumn,
  ElTag
} from "element-plus";
import "element-plus/dist/index.css";
import "./styles.css";
import App from "./App.vue";

const app = createApp(App);

[
  ElButton,
  ElCard,
  ElDatePicker,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElPopconfirm,
  ElRadioButton,
  ElRadioGroup,
  ElSegmented,
  ElStatistic,
  ElTable,
  ElTableColumn,
  ElTag
].forEach((component) => {
  if (component.name) {
    app.component(component.name, component);
  }
});

app.mount("#app");
