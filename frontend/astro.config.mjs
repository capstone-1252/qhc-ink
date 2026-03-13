// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify'; // ← ADDED

export default defineConfig({
  output: "static",
  integrations: [react()],
  adapter: netlify(),
});