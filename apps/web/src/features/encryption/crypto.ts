import type { AttachmentDto, PublishedKeyBundleDto } from '@chat-app/shared';

import { ENCRYPTION_VERSION } from '@chat-app/shared';

import type { LocalDeviceRecord } from './types';
import { secureStore } from './secure-store';
import { base64 } from '@/utils/base64';

const DEVICE_STORAGE_KEY = 'pulse-chat-device-id';
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const asArrayBuffer = (value: Uint8Array) => {
  const copy = new Uint8Array(value.byteLength);
  copy.set(value);
  return copy.buffer;
};

const bytesToHex = (value: Uint8Array) =>
  Array.from(value)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

const randomBytes = (length: number) => {
  const output = new Uint8Array(length);
  window.crypto.getRandomValues(output);
  return output;
};

export const isUsablePublicKey = (value?: string | null) => {
  if (!value) {
    return false;
  }

  const normalized = value.trim();

  if (!/^[A-Za-z0-9+/=]+$/.test(normalized) || normalized.length < 40) {
    return false;
  }

  try {
    const decoded = base64.decode(normalized);
    return decoded.byteLength > 32;
  } catch {
    return false;
  }
};

const exportPublicKey = async (key: CryptoKey) => {
  const exported = await window.crypto.subtle.exportKey('spki', key);
  return base64.encode(new Uint8Array(exported));
};

const digestBase64 = async (value: Uint8Array) => {
  const digest = await window.crypto.subtle.digest('SHA-256', asArrayBuffer(value));
  return base64.encode(new Uint8Array(digest));
};

const fingerprintFromKeys = async (identityKey: string, agreementKey: string) => {
  const digest = await window.crypto.subtle.digest(
    'SHA-256',
    textEncoder.encode(`${identityKey}.${agreementKey}`)
  );
  return bytesToHex(new Uint8Array(digest)).slice(0, 60);
};

const importAgreementPublicKey = (publicKey: string) =>
  window.crypto.subtle.importKey(
    'spki',
    asArrayBuffer(base64.decode(publicKey)),
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    true,
    []
  );

const deriveTransportKey = async (privateKey: CryptoKey, peerPublicKey: string) => {
  const importedPeer = await importAgreementPublicKey(peerPublicKey);

  return window.crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: importedPeer
    },
    privateKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );
};

export const ensureLocalDevice = async () => {
  const existingDeviceId = window.localStorage.getItem(DEVICE_STORAGE_KEY);

  if (existingDeviceId) {
    const existing = await secureStore.getDevice(existingDeviceId);

    if (existing) {
      return existing;
    }
  }

  const [identityKeys, agreementKeys] = await Promise.all([
    window.crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256'
      },
      true,
      ['deriveKey']
    ),
    window.crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256'
      },
      true,
      ['deriveKey']
    )
  ]);

  const deviceId =
    typeof window.crypto.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : `device-${Date.now()}`;
  const publicIdentityKey = await exportPublicKey(identityKeys.publicKey);
  const publicAgreementKey = await exportPublicKey(agreementKeys.publicKey);
  const record: LocalDeviceRecord = {
    deviceId,
    label: `${navigator.platform || 'Browser'} secure session`,
    platform: navigator.platform || null,
    userAgent: navigator.userAgent || null,
    appVersion: 'web',
    publicIdentityKey,
    publicAgreementKey,
    fingerprint: await fingerprintFromKeys(publicIdentityKey, publicAgreementKey),
    identityPrivateKey: identityKeys.privateKey,
    agreementPrivateKey: agreementKeys.privateKey
  };

  await secureStore.saveDevice(record);
  window.localStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
  return record;
};

export const getPeerPrimaryDevice = (bundle?: PublishedKeyBundleDto | null) => bundle?.devices[0] ?? null;
export const getFirstUsablePeerDevice = (bundle?: PublishedKeyBundleDto | null) =>
  bundle?.devices.find((device) => isUsablePublicKey(device.publicAgreementKey)) ?? null;

export const computeSafetyNumber = async (localFingerprint: string, peerFingerprint: string) => {
  const digest = await window.crypto.subtle.digest(
    'SHA-256',
    textEncoder.encode(`${localFingerprint}.${peerFingerprint}`)
  );

  return bytesToHex(new Uint8Array(digest)).match(/.{1,4}/g)?.join('-') ?? '';
};

export const encryptPlaintext = async (
  plaintext: string,
  localDevice: LocalDeviceRecord,
  peerPublicAgreementKey: string
) => {
  const transportKey = await deriveTransportKey(localDevice.agreementPrivateKey, peerPublicAgreementKey);
  const iv = randomBytes(12);
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
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
  payload: {
    ciphertext: string;
    iv: string;
  },
  localDevice: LocalDeviceRecord,
  peerPublicAgreementKey: string
) => {
  const transportKey = await deriveTransportKey(localDevice.agreementPrivateKey, peerPublicAgreementKey);
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: base64.decode(payload.iv)
    },
    transportKey,
    asArrayBuffer(base64.decode(payload.ciphertext))
  );

  return textDecoder.decode(decrypted);
};

export const encryptAttachmentFile = async (
  file: File,
  localDevice: LocalDeviceRecord,
  peerPublicAgreementKey: string
) => {
  const transportKey = await deriveTransportKey(localDevice.agreementPrivateKey, peerPublicAgreementKey);
  const fileKey = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
  const fileIv = randomBytes(12);
  const fileBytes = new Uint8Array(await file.arrayBuffer());
  const encryptedBytes = new Uint8Array(
    await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: fileIv
      },
      fileKey,
      asArrayBuffer(fileBytes)
    )
  );

  const rawFileKey = new Uint8Array(await window.crypto.subtle.exportKey('raw', fileKey));
  const wrapIv = randomBytes(12);
  const wrappedFileKey = new Uint8Array(
    await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: wrapIv
      },
      transportKey,
      rawFileKey
    )
  );

  const merged = new Uint8Array(fileIv.length + encryptedBytes.length);
  merged.set(fileIv, 0);
  merged.set(encryptedBytes, fileIv.length);

  return {
    encryptedBlob: new Blob([merged], { type: 'application/octet-stream' }),
    metadata: {
      isEncrypted: true,
      encryption: {
        algorithm: 'AES-GCM' as const,
        wrappedFileKey: base64.encode(wrappedFileKey),
        iv: base64.encode(wrapIv),
        digest: await digestBase64(encryptedBytes)
      }
    }
  };
};

export const decryptAttachment = async (
  attachment: AttachmentDto,
  localDevice: LocalDeviceRecord,
  peerPublicAgreementKey: string
) => {
  const encryptedResponse = await fetch(attachment.url);
  const payload = new Uint8Array(await encryptedResponse.arrayBuffer());
  const fileIv = payload.slice(0, 12);
  const fileCiphertext = payload.slice(12);
  const transportKey = await deriveTransportKey(localDevice.agreementPrivateKey, peerPublicAgreementKey);
  const rawFileKey = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: base64.decode(attachment.encryption!.iv)
    },
    transportKey,
    asArrayBuffer(base64.decode(attachment.encryption!.wrappedFileKey))
  );
  const fileKey = await window.crypto.subtle.importKey(
    'raw',
    rawFileKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['decrypt']
  );
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: fileIv
    },
    fileKey,
    asArrayBuffer(fileCiphertext)
  );

  return new Blob([decrypted], { type: attachment.mimeType });
};
