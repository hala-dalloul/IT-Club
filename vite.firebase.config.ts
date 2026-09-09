import { defineConfig } from "@lovable.dev/vite-tanstack-config";
// Separate static target; the existing Lovable/SSR build remains unchanged.
export default defineConfig({ nitro: false, tanstackStart: { spa: { enabled: true } } });
