import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Import the plugin
import path from "path"; // Keep for alias

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Use the plugin
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  envPrefix: "CHATBOT_",
});
