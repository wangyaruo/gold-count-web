import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { createMockApiMiddleware } from "./server/mockApiPlugin";

export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    {
      name: "gold-ledger-mock-api",
      configureServer(server) {
        server.middlewares.use(createMockApiMiddleware());
      }
    }
  ],
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
