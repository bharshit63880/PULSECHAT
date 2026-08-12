# Security Policy

## Supported reporting path

Do not place vulnerabilities, credentials, plaintext messages, private keys, or live account details in public issues. Report security concerns privately to the repository owner with a minimal reproduction and affected version/commit.

## Scope notes

PulseChat's direct-message implementation is browser-side encryption with ciphertext persistence. It is not a complete Signal protocol implementation and must not be described as providing forward secrecy or secure multi-device fan-out.

## Credential handling

- Keep provider credentials and token secrets only in the deployment platform's secret manager.
- Never commit `.env` files or paste real secrets into issues, screenshots, logs, or pull requests.
- Rotate credentials immediately after accidental disclosure.
- Treat production-like data as sensitive; use isolated test accounts for verification, media, and call smoke tests.
