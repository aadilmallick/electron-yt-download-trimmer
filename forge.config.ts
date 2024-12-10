import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
// import { MakerAppX } from "@electron-forge/maker-appx";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// console.log("Certificate password", process.env.VITE_CERTIFICATE_PASSWORD);

const config: ForgeConfig = {
  packagerConfig: {
    asar: {
      unpack: "**/node_modules/lw-ffmpeg-node/**/*",
    },
    // asar: true,
    extraResource: [path.join(__dirname, "src", "binaries")],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel(),
    // new MakerZIP({}, ["linux", "win32", "darwin"]),
    new MakerRpm({}),
    new MakerDeb({
      options: {
        maintainer: "aadilmallick",
        homepage: "https://aadilmallick.com/",
      },
    }),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main.ts",
          config: "vite.main.config.ts",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
    new AutoUnpackNativesPlugin({}),
  ],
  publishers: [],
  outDir: "out4",
};

export default config;
