const toBase64 = (value: Uint8Array) => {
  let output = '';

  value.forEach((byte) => {
    output += String.fromCharCode(byte);
  });

  return window.btoa(output);
};

const fromBase64 = (value: string) => {
  const binary = window.atob(value);
  const output = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    output[index] = binary.charCodeAt(index);
  }

  return output;
};

export const base64 = {
  encode: toBase64,
  decode: fromBase64
};
