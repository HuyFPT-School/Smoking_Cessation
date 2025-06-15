import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import rollupNodePolyFill from 'rollup-plugin-polyfill-node';


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Cấu hình chạy trên cổng 3000 vĩnh viễn
  },
  
  // cấu hình cho WebSocket
  resolve: {
    alias: {
      // Nếu cần shim thêm
      stream: "rollup-plugin-polyfill-node/polyfills/stream",
      util: "rollup-plugin-polyfill-node/polyfills/util",
    },
  },
  define: {
    global: "globalThis", // ✅ fix lỗi "global is not defined"
  },
  optimizeDeps: {
    include: ["sockjs-client"], // ✅ buộc Vite pre-bundle sockjs
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()], // ✅ shim polyfills khi build
    },
  },
});
