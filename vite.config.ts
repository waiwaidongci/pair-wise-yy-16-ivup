import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The app shell lives at the repository root; the authoritative content
// (mock-data/) stays in place and is consumed directly by the source,
// never copied into a second data store.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
