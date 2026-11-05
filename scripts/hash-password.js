#!/usr/bin/env node
'use strict';
/**
 * Prints a password hash for an account's "passwordHash" in ugs.config.json.
 *   npm run hash-password            (prompts, input hidden)
 *   npm run hash-password -- secret  (from argv; ends up in shell history)
 */
const readline = require('node:readline');
const { hashPassword } = require('../server/lib/auth');

function prompt(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => {
      if (s.startsWith(question)) process.stdout.write(s);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

(async () => {
  const pw = process.argv[2] || (await prompt('Password: '));
  if (!pw) {
    console.error('No password given.');
    process.exit(1);
  }
  console.log(await hashPassword(pw));
  process.exit(0);
})();
