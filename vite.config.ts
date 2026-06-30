import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "./",
  plugins: [vue()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === "INVALID_ANNOTATION" &&
          warning.message.includes("@vueuse/core")
        ) {
          return;
        }

        warn(warning);
      }
    }
  },
  test: {
    globals: true,
    environment: "node"
  }
});
