import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['./src/index.ts'],
    format: ['esm'],
    dts: true,
    external: [/^@primeuix\/(.*)$/, /^@ngx-prime\/(.*)$/],
    splitting: false,
    clean: true,
    shims: true,
    banner: {
        js: '#!/usr/bin/env node'
    }
});
