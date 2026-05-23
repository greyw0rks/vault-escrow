# VaultSTX Library

Utility functions and hooks powering the VaultSTX escrow frontend.

## Structure

- `contract.ts` — Stacks contract read/write helpers
- `constants.ts` — App-wide config values
- `format.ts` — STX and address formatting
- `validation.ts` — Form input validators
- `errors.ts` — Contract error code mapping
- `types.ts` — Shared TypeScript interfaces
- `analytics.ts` — Event tracking
- `cache.ts` — In-memory TTL cache
- `storage.ts` — localStorage wrappers
- `logger.ts` — Structured logging
- `events.ts` — Client-side event bus
- `network.ts` — Stacks network config
- `permissions.ts` — Role-based action checks
- `stacks-api.ts` — Hiro API wrappers
- `schema.ts` — Runtime validation
- `math.ts` — Escrow financial math
- `bigint.ts` — BigInt arithmetic helpers

## Usage

\`\`\`ts
import { microToSTX, truncatePrincipal } from '@/lib/contract';
import { useWallet } from '@/hooks/useWallet';
\`\`\`
