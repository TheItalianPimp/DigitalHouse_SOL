# Metaverse Dropshipping Platform on Solana

This project enables users to purchase metaverse assets (lands, houses, NFTs) using either **SOL** or a custom SPL token (**$HOUSE**).  
No inventory is needed: assets are purchased automatically from external marketplaces and transferred to the user.

---

## Smart Contract (Anchor)

The smart contract allows:

- **Payments** in SOL or $HOUSE token.
- **Automatic fee** of 0.1% sent to the platform fee wallet.
- **Separation** of treasury and fee accounts.
- **Validation** of payment method and amounts.

### Main functions:
- `purchase_asset`:
  - Validates the payment.
  - Transfers the net amount and platform fee.
  - Triggers external bot/backend for asset delivery.

---

## Bot Server (Node.js)

The bot listens to incoming payments and automates:

- **Detection** of payments in SOL or $HOUSE.
- **Purchase** of assets from external metaverse marketplaces (e.g., Magic Eden).
- **NFT transfer** directly to the buyer’s wallet using Metaplex SDK.

### Main flow:
1. Monitor transactions to the treasury wallet(s).
2. On valid payment, match the purchase request.
3. Execute asset acquisition from marketplace.
4. Transfer the asset to the buyer's wallet.

---

## Installation

### Prerequisites
- Node.js >= 18
- Yarn or NPM
- Rust + Solana CLI (for smart contract deployment)
- Firebase account (optional, for backend and hosting)

### 1. Smart Contract Setup

```bash
cd smart-contract
anchor build
anchor deploy
