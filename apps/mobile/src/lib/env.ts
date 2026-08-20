const ensureEnv = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`${name} is required for the mobile workspace`);
  }

  return value;
};

// Expo replaces direct EXPO_PUBLIC_* references while bundling a native app.
// Do not read them through globalThis/process dynamically: that works in some
// development environments but leaves the values undefined in a release APK.
declare const process: { env: Record<string, string | undefined> };

export const mobileEnv = {
  apiUrl: ensureEnv(process.env.EXPO_PUBLIC_API_URL, 'EXPO_PUBLIC_API_URL'),
  socketUrl: ensureEnv(process.env.EXPO_PUBLIC_SOCKET_URL, 'EXPO_PUBLIC_SOCKET_URL'),
};
