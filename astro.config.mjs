import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://bumpcompass.com',
  build: {
    format: 'directory',
  },
  trailingSlash: 'always',
});
