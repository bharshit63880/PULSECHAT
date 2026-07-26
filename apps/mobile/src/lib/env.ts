const ensureEnv = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`${name} is required for the mobile workspace`);
  }

  return value;
};

const runtimeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

export const mobileEnv = {
  apiUrl: ensureEnv(runtimeEnv.EXPO_PUBLIC_API_URL, 'EXPO_PUBLIC_API_URL'),
  socketUrl: ensureEnv(runtimeEnv.EXPO_PUBLIC_SOCKET_URL, 'EXPO_PUBLIC_SOCKET_URL')
};
