#!/usr/bin/env node
// set-arbitration-fee.js
// One-shot: calls set-arbitration-fee(200) on vaultstx-dispute from deployer key
// Usage: DEPLOYER_KEY=<privkey> node set-arbitration-fee.js

import { config } from 'dotenv';
config();
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const NETWORK           = new StacksMainnet();
const CONTRACT_ADDRESS  = process.env.CONTRACT_ADDRESS;
const DISPUTE_CONTRACT  = process.env.DISPUTE_CONTRACT_NAME || 'vaultstx-dispute';
const DEPLOYER_KEY      = process.env.DEPLOYER_KEY;
const NEW_FEE           = 200; // uSTX

if (!DEPLOYER_KEY) {
  console.error('Set DEPLOYER_KEY=<private_key> in .env or env');
  process.exit(1);
}

console.log(`Setting arbitration fee to ${NEW_FEE} uSTX`);
console.log(`Contract: ${CONTRACT_ADDRESS}.${DISPUTE_CONTRACT}`);

const tx = await makeContractCall({
  contractAddress:   CONTRACT_ADDRESS,
  contractName:      DISPUTE_CONTRACT,
  functionName:      'set-arbitration-fee',
  functionArgs:      [uintCV(NEW_FEE)],
  senderKey:         DEPLOYER_KEY,
  network:           NETWORK,
  anchorMode:        AnchorMode.Any,
  postConditionMode: PostConditionMode.Allow,
  fee:               400,
});

const result = await broadcastTransaction(tx, NETWORK);

if (result.error) {
  console.error('Broadcast failed:', JSON.stringify(result.error));
  process.exit(1);
}

console.log(`✓ txid: ${result.txid}`);
console.log('Wait 1-2 blocks then restart the bot.');
