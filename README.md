# Learning

## Setting up

1. Create a new vite electron app with `npm init electron-app@latest my-new-app -- --template=vite-typescript`
2. Run `npm i @vitejs/plugin-react react react-dom`. Run `npm i --save-dev @types/react-dom` and `npm i --save-dev @types/react`.
3. Set up react with vite in the `vite.renderer.config.ts` file by adding it to the plugins array

   ```ts
   import type { ConfigEnv, UserConfig } from "vite";
   import { defineConfig } from "vite";
   import { pluginExposeRenderer } from "./vite.base.config";
   import react from "@vitejs/plugin-react";

   // https://vitejs.dev/config
   export default defineConfig((env) => {
     const forgeEnv = env as ConfigEnv<"renderer">;
     const { root, mode, forgeConfigSelf } = forgeEnv;
     const name = forgeConfigSelf.name ?? "";

     return {
       root,
       mode,
       base: "./",
       build: {
         outDir: `.vite/renderer/${name}`,
       },
       plugins: [pluginExposeRenderer(name), react()],
       resolve: {
         preserveSymlinks: true,
       },
       clearScreen: false,
     } as UserConfig;
   });
   ```

## Types

1. Create the context bridge in the `preload.ts`:

   ```ts
   import { contextBridge } from "electron";

   const api = {} as const;

   contextBridge.exposeInMainWorld("api", api);

   export type Clipmaster = typeof api;
   ```

2. In a type declaration file, redeclare the window interface so you can use those types in the renderer:

   ```ts
   declare interface Window {
     api: import("../src/preload").Clipmaster;
   }
   ```

## Preload scripts

- You cannot use the fs node module in the preload scripts. You only have access to a select few node modules.
- Only JSON-compatible data can be serialized in IPC. This means you can't send functions or classes over IPC.
