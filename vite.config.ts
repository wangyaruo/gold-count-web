import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { createMockApiMiddleware } from "./server/mockApiPlugin";
import { createMarketPriceMiddleware } from "./server/marketPriceProxy";

export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    {
      name: "gold-ledger-mock-api",
      configureServer(server) {
        server.middlewares.use(createMockApiMiddleware());
        server.middlewares.use(createMarketPriceMiddleware());
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
