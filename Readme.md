# Do you have difficulties to switch to Wagmi V2 / Viem V2 / RainbowKit V2 ?

Here is a basic repo to create your DApp.

## Backend 

### Installation

```yarn install```

### Launch local Blockchain

```yarn hardhat node```

### Launch Tests

```yarn hardhat test```

### Deploy Smart Contract

```yarn hardhat run scripts/deploy.js --network localhost```

## FrontEnd

### Installation

```npm install```

### Rename .env.local.example to .env.local

Fill the WalletConnect ID, you can find it and cloud.walletconnect

### Launch Application

```npm run dev```