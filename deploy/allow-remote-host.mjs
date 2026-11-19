// Fork-Patch fuer den Betrieb hinter einem Reverse-Proxy.
//
// server.ts weist jede Anfrage ab, deren Host-Header nicht localhost,
// 127.0.0.1 oder [::1] ist (HTTP 403). Hinter Traefik kommt aber immer
// die oeffentliche Domain an. Dieses Skript deaktiviert ausschliesslich
// diese eine Bedingung und bricht ab, wenn sie im Quelltext nicht mehr
// gefunden wird - dann hat sich upstream geaendert und der Patch muss
// nachgezogen werden.
import { readFileSync, writeFileSync } from 'node:fs';

const file = 'server.ts';
const needle = "if (host && !['localhost', '127.0.0.1', '[::1]'].includes(new URL('http://' + host).hostname))";
const patched = "if (false && !['localhost', '127.0.0.1', '[::1]'].includes(new URL('http://' + host).hostname))";

const source = readFileSync(file, 'utf8');

if (source.includes(patched)) {
  console.log('host check already patched');
  process.exit(0);
}

if (!source.includes(needle)) {
  console.error('host check not found - upstream changed, review the patch');
  process.exit(1);
}

writeFileSync(file, source.replace(needle, patched));
console.log('host check disabled for reverse-proxy use');
