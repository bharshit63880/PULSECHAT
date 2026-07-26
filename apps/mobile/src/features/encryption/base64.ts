import { Buffer } from 'buffer';

export const base64 = {
  encode: (value: Uint8Array) => Buffer.from(value).toString('base64'),
  decode: (value: string) => Uint8Array.from(Buffer.from(value, 'base64'))
};
