# Contract Interface & Metadata Extraction Guide

## Overview

The StellarStream contract metadata is now embedded in the WASM binary using the `contractmeta!` macro. This guide explains how to extract the interface and use it for TypeScript bindings.

## What Was Added

### 1. Contract Metadata (contracts/src/lib.rs)

```rust
soroban_sdk::contractmeta!(
    desc = "StellarStream: Token streaming with multi-sig proposals, dynamic vesting curves (linear/exponential), yield optimization, and OFAC compliance. Create, manage, and withdraw from streams with flexible approval workflows.",
    version = "0.1.0",
    name = "StellarStream"
);
```

**Components:**
- `name`: Human-readable contract name
- `version`: Semantic version matching Cargo.toml
- `desc`: Detailed feature description for explorers

### 2. TypeScript Bindings Template

**File:** `frontend/lib/contracts/stellarstream.ts`

Provides:
- Type-safe interface definitions
- Function parameter types
- Data structure interfaces
- Helper functions for conversions
- Error code enumeration

## Extraction Process

### Step 1: Build WASM Binary

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release
```

**Output:** `target/wasm32-unknown-unknown/release/stellarstream_contracts.wasm`

### Step 2: Inspect Contract Interface

Using Soroban CLI v21.0.0+:

```bash
soroban contract inspect \
  target/wasm32-unknown-unknown/release/stellarstream_contracts.wasm \
  --output json
```

**Output Example:**

```json
{
  "name": "StellarStream",
  "version": "0.1.0",
  "description": "StellarStream: Token streaming with multi-sig proposals...",
  "functions": [
    {
      "name": "create_proposal",
      "params": [
        {
          "name": "sender",
          "type": "Address"
        },
        {
          "name": "receiver",
          "type": "Address"
        },
        {
          "name": "token",
          "type": "Address"
        },
        {
          "name": "total_amount",
          "type": "i128"
        },
        {
          "name": "start_time",
          "type": "u64"
        },
        {
          "name": "end_time",
          "type": "u64"
        },
        {
          "name": "required_approvals",
          "type": "u32"
        },
        {
          "name": "deadline",
          "type": "u64"
        }
      ],
      "returns": "u64"
    },
    {
      "name": "approve_proposal",
      "params": [
        {
          "name": "proposal_id",
          "type": "u64"
        },
        {
          "name": "approver",
          "type": "Address"
        }
      ],
      "returns": null
    },
    // ... more functions
  ]
}
```

### Step 3: Generate Full Interface

Save the output to a file for reference:

```bash
soroban contract inspect \
  target/wasm32-unknown-unknown/release/stellarstream_contracts.wasm \
  --output json > contract-interface.json
```

### Step 4: Create Integration Bindings

The TypeScript types in `frontend/lib/contracts/stellarstream.ts` already match the contract interface. To integrate with the actual Soroban SDK:

```typescript
import type { StellarStreamContractClient } from '@/lib/contracts/stellarstream';
import { nativeToScVal } from '@stellar/js-stellar-sdk';

// Initialize client with your contract address
const contractAddress = 'CONTRACTADDRESS';

// When using @stellar/js-stellar-sdk with soroban bindings:
// const client = new StellarStreamClient({ contractId: contractAddress });
```

## Verification Checklist

### Local Verification (Before Deployment)

- [ ] Contract builds successfully: `cargo build --target wasm32-unknown-unknown --release`
- [ ] WASM binary exists: `ls -lh target/wasm32-unknown-unknown/release/stellarstream_contracts.wasm`
- [ ] Inspect succeeds: `soroban contract inspect <wasm-file>`
- [ ] Output includes all expected functions
- [ ] Metadata displays correctly (name, version, description)

### Post-Deployment Verification

#### On Testnet:

```bash
# Via Soroban CLI
soroban contract inspect \
  --network testnet \
  CBFQRVD4KJCZK2OWZS67WVEWPLPSGF3N2YCBHQQTADV3K3WK5EBVL
```

#### Via Stellar.Expert:

1. Navigate to: `https://stellar.expert/explorer/testnet/contract/CBFQRVD4KJCZK2OWZS67WVEWPLPSGF3N2YCBHQRQ...`
2. Verify:
   - Contract name displays as "StellarStream"
   - Version shows as "0.1.0"
   - Description visible
   - All functions listed with correct parameters

## Contract Functions Reference

### Proposal Management (Multi-Sig)
- `create_proposal` - Create M-of-N approval proposal
- `approve_proposal` - Approve proposal (auto-executes at threshold)
- `get_proposal` - Query proposal details

### Stream Operations
- `create_stream` - Direct stream creation (no multisig)
- `withdraw` - Withdraw unlocked tokens
- `cancel_stream` - Cancel stream and return funds
- `get_stream` - Get stream details
- `get_withdrawable` - Calculate available amount

### Stream Management
- `pause_stream` - Pause token flow
- `unpause_stream` - Resume token flow
- `get_receipt_metadata` - Query NFT metadata
- `get_receipts_by_owner` - List user's stream receipts

### Role-Based Access Control
- `grant_role` - Assign role to address (Admin)
- `revoke_role` - Remove role from address (Admin)
- `check_role` - Check if address has role

### Compliance
- `restrict_address` - Block address from receiving (OFAC)
- `unrestrict_address` - Remove restriction
- `is_address_restricted` - Check restriction status
- `get_restricted_addresses` - List all restricted addresses

### Contract Info
- `get_version` - Current contract version
- `get_metadata` - Contract metadata

## Using the TypeScript Interface

### Example 1: Creating a Proposal

```typescript
import { 
  type CreateProposalParams,
  mockClient 
} from '@/lib/contracts/stellarstream';

const proposalParams: CreateProposalParams = {
  sender: 'GZST3XVCDTUJ76ZAV2HA72KYPSHJSRNQAYZ6E3NFZNKF3ZJY5FV2FSP',
  receiver: 'GCAE4LLDNVWVVSMJ6I4FN5QHQYDNBDMXRGZLXQVDPWDX5H3T7DQLFHSB',
  token: 'CUSDT7K2ZCSHYH5DDYPVPVKR5V3J6IT2FB7Q2NUPQP3FRVB5N5EJ53L',
  totalAmount: BigInt(1_000_000_000_000n), // 100 USDC (7 decimals)
  startTime: BigInt(1708704000n),          // 2024-02-23
  endTime: BigInt(1739240640n),            // 2025-02-23
  requiredApprovals: 2,
  deadline: BigInt(1708790400n),           // 2024-02-24
};

const proposalId = await mockClient.createProposal(proposalParams);
console.log('Proposal created with ID:', proposalId);
```

### Example 2: Type-Safe Stream Query

```typescript
import { formatAmount, type Stream } from '@/lib/contracts/stellarstream';

const stream: Stream = await mockClient.getStream(BigInt(0));

console.log('Stream Details:');
console.log(`- Receiver: ${stream.receiver}`);
console.log(`- Total: ${formatAmount(stream.totalAmount)} USDC`);
console.log(`- Withdrawn: ${formatAmount(stream.withdrawn)} USDC`);
console.log(`- Remaining: ${formatAmount(stream.totalAmount - stream.withdrawn)} USDC`);
```

## FAQ

**Q: Will my contract metadata be visible on Stellar.Expert?**
A: Yes, once deployed, the metadata will be automatically indexed and displayed on Stellar.Expert for your contract address.

**Q: Can I update the metadata after deployment?**
A: No, metadata is embedded in the WASM binary at compile time. To update it, you would need to redeploy a new contract version.

**Q: How do I get the contract address?**
A: After deploying to testnet/mainnet, you'll receive a contract address (starting with 'C...'). Use this in the Stellar.Expert URL.

**Q: Can I add more functions without breaking compatibility?**
A: The interface is forward-compatible. New functions can be added and will appear in future inspections. Old clients won't break.

**Q: What's the format of the contract interface JSON?**
A: It follows the Soroban Specification (XDR-based), which is standardized across all Soroban contracts.

## Related Files

- **Contract Implementation:** [contracts/src/lib.rs](../contracts/src/lib.rs)
- **Contract Metadata Docs:** [contracts/CONTRACT_METADATA.md](../contracts/CONTRACT_METADATA.md)
- **TypeScript Bindings:** [frontend/lib/contracts/stellarstream.ts](stellarstream.ts)
- **Cargo Configuration:** [contracts/Cargo.toml](../contracts/Cargo.toml)
