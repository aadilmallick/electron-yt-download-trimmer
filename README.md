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

## Code signing

Run this code to self-sign your app:

```bash
# interactive
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365

# non-interactive and 10 years expiration
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 3650 -nodes -subj "/C=US/ST=Virginia/L=Restone/O=Company Name/OU=Org/CN=www.aadilmallick.com"
```

You can also create a self-signed certificate using electron builder, like so:

```bash
npx electron-builder create-self-signed-cert -p aadilmallick
```

## Creating appx output

1. Install electron windows store by running powershell as an administrator.

   ```bash
   npm install -g electron-windows-store
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
   ```

2. Create app package output by running `npm run package`, and then make sure to rename your executable files to omit any hyphens, as that will cause an error.
3. Use this command, keeping in mind the package name should not have any hyphens and should be the same name as the renamed executable. When prompted to create a certificate password, select None for the password.

```bash
electron-windows-store --input-directory <package-directory> --output-directory <output-directory> --package-version 1.0.0.0 --package-name <package-name>
```

You can see all the important value in the `.electron-windows-store` file in your home directory
