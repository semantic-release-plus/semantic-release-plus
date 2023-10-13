#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createCommitMessage } from '../lib/commitmatic';
import { writeMsgToTempFile } from '../lib/write-msg-to-temp-file';

const argv = yargs(hideBin(process.argv)).argv;

createCommitMessage().then((message) => {
  writeMsgToTempFile(message);
});
