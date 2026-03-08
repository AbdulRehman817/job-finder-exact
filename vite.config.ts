import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 3000,
    strictPort: true,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          if (id.includes("appwrite")) {
            return "appwrite";
          }

          if (
            id.includes("@radix-ui") ||
            id.includes("lucide-react") ||
            id.includes("next-themes") ||
            id.includes("sonner") ||
            id.includes("vaul")
          ) {
            return "ui";
          }

          if (id.includes("date-fns")) {
            return "date-fns";
          }

          if (
            id.includes("/node_modules/react/") ||
            id.includes("\\node_modules\\react\\") ||
            id.includes("react-dom") ||
            id.includes("react-router-dom") ||
            id.includes("@tanstack/react-query")
          ) {
            return "framework";
          }

          return "vendor";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
