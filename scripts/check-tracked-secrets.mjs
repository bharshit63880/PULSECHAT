import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const trackedFiles = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter((file) => !file.endsWith('.example'));

const rules = [
  { name: 'Brevo API key', pattern: /xkeysib-[A-Za-z0-9_-]{32,}/ },
  { name: 'Resend API key', pattern: /re_[A-Za-z0-9]{20,}/ },
  { name: 'GitHub personal token', pattern: /gh[pousr]_[A-Za-z0-9]{30,}/ },
  { name: 'AWS access key', pattern: /AKIA[0-9A-Z]{16}/ },
  { name: 'private key block', pattern: /-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----/ }
];

const findings = [];

for (const file of trackedFiles) {
  const contents = await readFile(file, 'utf8').catch(() => null);

  if (contents === null) {
    continue;
  }

  for (const rule of rules) {
    if (rule.pattern.test(contents)) {
      findings.push(`${file}: ${rule.name}`);
    }
  }
}

if (findings.length > 0) {
  console.error('Potential committed secrets detected (values intentionally redacted):');
  console.error(findings.join('\n'));
  process.exit(1);
}

console.log(`Secret scan passed for ${trackedFiles.length} tracked files.`);
