import type { AttachmentDto, DeviceRegistrationDto, PublishedKeyBundleDto } from '@chat-app/shared';

import { ENCRYPTION_VERSION } from '@chat-app/shared';
import * as SecureStore from 'expo-secure-store';

import { base64 } from '@/features/encryption/base64';

const DEVICE_STORAGE_KEY = 'pulse-mobile-device-record';
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

type PersistedDevice = Omit<DeviceRegistrationDto, 'platform' | 'userAgent' | 'appVersion'> & {
  label: string;
  platform: string;
  userAgent: string;
  appVersion: string;
  identityPrivateKey: string;
  agreementPrivateKey: string;
};

export type LocalDeviceRecord = DeviceRegistrationDto & {
  identityPrivateKey: CryptoKey;
  agreementPrivateKey: CryptoKey;
};

const getCrypto = () => {
  if (!globalThis.crypto?.subtle || !globalThis.crypto.getRandomValues) {
    throw new Error('This mobile runtime does not expose the Web Crypto APIs required for secure messaging yet.');
  }

  return globalThis.crypto;
};

const bytesToHex = (value: Uint8Array) =>
  Array.from(value)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

const asArrayBuffer = (value: Uint8Array) => {
  const copy = new Uint8Array(value.byteLength);
  copy.set(value);
  return copy.buffer;
};

const randomBytes = (length: number) => {
  const value = new Uint8Array(length);
  getCrypto().getRandomValues(value);
  return value;
};

const exportSpki = async (key: CryptoKey) => {
  const exported = await getCrypto().subtle.exportKey('spki', key);
  return base64.encode(new Uint8Array(exported));
};

const exportPkcs8 = async (key: CryptoKey) => {
  const exported = await getCrypto().subtle.exportKey('pkcs8', key);
  return base64.encode(new Uint8Array(exported));
};

const importPrivateKey = (value: string) =>
  getCrypto().subtle.importKey(
    'pkcs8',
    asArrayBuffer(base64.decode(value)),
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey']
  );

const importAgreementPublicKey = (value: string) =>
  getCrypto().subtle.importKey(
    'spki',
    asArrayBuffer(base64.decode(value)),
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    []
  );

const digestBase64 = async (value: Uint8Array) => {
  const digest = await getCrypto().subtle.digest('SHA-256', asArrayBuffer(value));
  return base64.encode(new Uint8Array(digest));
};

const fingerprintFromKeys = async (identityKey: string, agreementKey: string) => {
  const digest = await getCrypto().subtle.digest('SHA-256', textEncoder.encode(`${identityKey}.${agreementKey}`));
  return bytesToHex(new Uint8Array(digest)).slice(0, 60);
};

const deriveTransportKey = async (privateKey: CryptoKey, peerPublicKey: string) => {
  const importedPeer = await importAgreementPublicKey(peerPublicKey);

  return getCrypto().subtle.deriveKey(
    { name: 'ECDH', public: importedPeer },
    privateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

const getFallbackUuid = () => `mobile-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const isUsablePublicKey = (value?: string | null) => {
  if (!value) {
    return false;
  }

  const normalized = value.trim();

  if (!/^[A-Za-z0-9+/=]+$/.test(normalized) || normalized.length < 40) {
    return false;
  }

  try {
    return base64.decode(normalized).byteLength > 32;
  } catch {
    return false;
  }
};

export const ensureLocalDevice = async () => {
  const stored = await SecureStore.getItemAsync(DEVICE_STORAGE_KEY);

  if (stored) {
    const parsed = JSON.parse(stored) as PersistedDevice;
    return {
      ...parsed,
      identityPrivateKey: await importPrivateKey(parsed.identityPrivateKey),
      agreementPrivateKey: await importPrivateKey(parsed.agreementPrivateKey)
    } satisfies LocalDeviceRecord;
  }

  const crypto = getCrypto();
  const [identityKeys, agreementKeys] = await Promise.all([
    crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey']),
    crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey'])
  ]);

  const publicIdentityKey = await exportSpki(identityKeys.publicKey);
  const publicAgreementKey = await exportSpki(agreementKeys.publicKey);
  const persisted: PersistedDevice = {
    deviceId: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : getFallbackUuid(),
    label: 'Pulse Mobile secure session',
    platform: 'mobile',
    userAgent: 'expo-react-native',
    appVersion: 'mobile-1',
    publicIdentityKey,
    publicAgreementKey,
    fingerprint: await fingerprintFromKeys(publicIdentityKey, publicAgreementKey),
    identityPrivateKey: await exportPkcs8(identityKeys.privateKey),
    agreementPrivateKey: await exportPkcs8(agreementKeys.privateKey)
  };

  await SecureStore.setItemAsync(DEVICE_STORAGE_KEY, JSON.stringify(persisted));

  return {
    ...persisted,
    identityPrivateKey: identityKeys.privateKey,
    agreementPrivateKey: agreementKeys.privateKey
  } satisfies LocalDeviceRecord;
};

export const getFirstUsablePeerDevice = (bundle?: PublishedKeyBundleDto | null) =>
  bundle?.devices.find((device) => isUsablePublicKey(device.publicAgreementKey)) ?? null;

export const computeSafetyNumber = async (localFingerprint: string, peerFingerprint: string) => {
  const digest = await getCrypto().subtle.digest('SHA-256', textEncoder.encode(`${localFingerprint}.${peerFingerprint}`));
  return bytesToHex(new Uint8Array(digest)).match(/.{1,4}/g)?.join('-') ?? '';
};

export const encryptPlaintext = async (
  plaintext: string,
  localDevice: LocalDeviceRecord,
  peerPublicAgreementKey: string
) => {
  const transportKey = await deriveTransportKey(localDevice.agreementPrivateKey, peerPublicAgreementKey);
  const iv = randomBytes(12);
  const encrypted = await getCrypto().subtle.encrypt(
    { name: 'AES-GCM', iv },
    transportKey,
    textEncoder.encode(plaintext)
  );
  const ciphertextBytes = new Uint8Array(encrypted);

  return {
    ciphertext: base64.encode(ciphertextBytes),
    iv: base64.encode(iv),
    digest: await digestBase64(ciphertextBytes),
    encryptionVersion: ENCRYPTION_VERSION
  };
};

export const decryptPlaintext = async (
  payload: { ciphertext: string; iv: string },
  localDevice: LocalDeviceRecord,
  peerPublicAgreementKey: string
) => {
  const transportKey = await deriveTransportKey(localDevice.agreementPrivateKey, peerPublicAgreementKey);
  const decrypted = await getCrypto().subtle.decrypt(
    { name: 'AES-GCM', iv: base64.decode(payload.iv) },
    transportKey,
    asArrayBuffer(base64.decode(payload.ciphertext))
  );

  return textDecoder.decode(decrypted);
};

export const decryptAttachment = async (
  attachment: AttachmentDto,
  localDevice: LocalDeviceRecord,
  peerPublicAgreementKey: string
) => {
  const response = await fetch(attachment.url);
  const payload = new Uint8Array(await response.arrayBuffer());
  const fileIv = payload.slice(0, 12);
  const ciphertext = payload.slice(12);
  const transportKey = await deriveTransportKey(localDevice.agreementPrivateKey, peerPublicAgreementKey);
  const rawFileKey = await getCrypto().subtle.decrypt(
    { name: 'AES-GCM', iv: base64.decode(attachment.encryption!.iv) },
    transportKey,
    asArrayBuffer(base64.decode(attachment.encryption!.wrappedFileKey))
  );
  const fileKey = await getCrypto().subtle.importKey('raw', rawFileKey, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const decrypted = await getCrypto().subtle.decrypt({ name: 'AES-GCM', iv: fileIv }, fileKey, asArrayBuffer(ciphertext));
  return new Blob([decrypted], { type: attachment.mimeType });
};
