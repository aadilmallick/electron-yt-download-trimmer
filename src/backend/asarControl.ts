export function enableAsar() {
  process.env.NODE_ENV === "production" && (process.noAsar = true);
}

export function disableAsar() {
  process.env.NODE_ENV === "production" && (process.noAsar = false);
}
