/// <reference types="vite/client" />
/// <reference types="electron" />

declare interface Window {
  appApi: import("./preload").AppApi;
}
