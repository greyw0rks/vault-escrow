# VaultSTX

Trustless milestone escrow on Stacks. Lock STX into a contract, release it when work is done — no intermediaries, no trust required.

---

## Overview

VaultSTX lets two parties transact on deliverables without trusting each other. A client funds an escrow upfront; the provider earns each milestone as it's approved. If something goes wrong, either party can open a dispute and have an arbitrator resolve it on-chain.

**Contracts:**

| Contract | Purpose |
|---|---|
| `vaultstx-escrow` | Core single-escrow trustless milestone logic |
| `vaultstx-factory` | Multi-escrow registry; create and manage many escrows |
| `vaultstx-dispute` | Arbitration module for contested escrows |

**Deployer:** `SP1SY1E599GN04XRD2DQBKV7E62HYBJR2CT9S5QKK`  
**Mainnet:** `SP1SY1E599GN04XRD2DQBKV7E62HYBJR2CT9S5QKK.vaultstx-escrow`  
**Network:** Stacks Mainnet  
**Clarity Version:** v3 (Epoch 3.1)

---

## How It Works

### Escrow Lifecycle

```
CREATED (funded) → ACTIVE → milestones released one by one → COMPLETED
                          ↘ CANCELLED (remaining STX refunded to client)
                          ↘ DISPUTED → arbitrator resolves → funds split
```

1. **Client** creates an escrow, deposits full STX amount, defines milestones
2. **Provider** delivers work
3. **Client** approves each milestone, triggering payment to provider
4. When all milestones are released, escrow is marked complete
5. Client can cancel at any time and recover unreleased funds

### Milestones

Each escrow is divided into up to 10 milestones. The client sets the STX amount and description for each. Milestones are released sequentially or independently — whatever the parties agree.

### Dispute Resolution

Either party can open a dispute on an active escrow. A designated arbitrator reviews the case and records an award split on-chain. The arbitration fee (default: 1 STX) is paid at dispute opening and is non-refundable.

---

## Contract Reference

### `vaultstx-factory`

```clarity
;; Create a new escrow (client funds it immediately)
(create-escrow
  (provider principal)
  (total-amount uint)
  (num-milestones uint)
  (description (string-utf8 128))
)
;; Returns: (ok escrow-id)

;; Define a milestone
(set-milestone
  (escrow-id uint)
  (index uint)
  (amount uint)
  (description (string-utf8 64))
)

;; Client approves a completed milestone
(approve-milestone (escrow-id uint) (index uint))

;; Release approved milestone payment to provider
(release-milestone (escrow-id uint) (index uint))

;; Cancel and refund remaining balance to client
(cancel-escrow (escrow-id uint))

;; Read-only
(get-escrow (escrow-id uint))
(get-milestone (escrow-id uint) (index uint))
(get-escrow-balance (escrow-id uint))
(get-total-volume)
```

### `vaultstx-dispute`

```clarity
;; Open a dispute (either party, pays arbitration fee)
(open-dispute
  (escrow-id uint)
  (client principal)
  (provider principal)
  (disputed-amount uint)
  (client-claim uint)
  (provider-claim uint)
  (reason (string-utf8 256))
)
;; Returns: (ok dispute-id)

;; Arbitrator resolves with an award split
(resolve-dispute
  (dispute-id uint)
  (client-award uint)
  (provider-award uint)
  (notes (string-utf8 256))
)

;; Opener withdraws dispute (fee non-refundable)
(withdraw-dispute (dispute-id uint))

;; Read-only
(get-dispute (dispute-id uint))
(get-dispute-by-escrow (escrow-id uint))
(has-open-dispute (escrow-id uint))
```

---

## Error Codes

### Factory

| Code | Meaning |
|---|---|
| `u100` | Not authorized |
| `u101` | Invalid amount (must be > 0) |
| `u102` | Invalid milestone index or count |
| `u103` | Escrow not found |
| `u104` | Wrong state for this action |
| `u105` | Caller is not a participant |
| `u106` | Milestone already released |
| `u107` | Insufficient escrow balance |
| `u108` | Max escrows per user reached (50) |

### Dispute

| Code | Meaning |
|---|---|
| `u100` | Not authorized |
| `u101` | Dispute not found |
| `u102` | Dispute already open for this escrow |
| `u103` | Wrong state |
| `u104` | Not a participant in this escrow |
| `u105` | Client + provider claims don't equal disputed amount |
| `u106` | Caller is not the arbitrator |
| `u107` | Dispute already resolved |
| `u108` | Invalid amount |

---

## Development

**Requirements:** [Clarinet](https://github.com/hirosystems/clarinet) ≥ 2.0

```bash
# Clone and install
git clone https://github.com/greyw0rks/vaultstx
cd vaultstx
clarinet check

# Run tests
clarinet test

# Deploy to devnet
clarinet deployments apply --devnet
```

**Project structure:**
```
contracts/
  vaultstx-escrow.clar
  vaultstx-factory.clar
  vaultstx-dispute.clar
tests/
  escrow_test.ts
  factory_test.ts
  dispute_test.ts
Clarinet.toml
```

---

## Security

- STX is held in-contract; no external custody
- `as-contract` used for all outbound transfers — only the contract can move its funds
- `burn-block-height` used for Bitcoin-anchored timing
- Underflow guarded in all balance arithmetic
- One dispute per escrow enforced at the contract level
- Max 50 escrows per user prevents unbounded map growth

---

## License

MIT
