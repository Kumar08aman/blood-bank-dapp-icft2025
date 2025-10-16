# blood-bank-dapp-icft2025
A full-stack decentralized application (DApp) for secure blood supply chain management using a role-based Solidity smart contract on the Polygon network. Source code for ICFT2025 Paper ID: 157.
# Secure Blood Bank DApp - Source Code

This repository contains the full source code for the "Security In Healthcare (Blood Bank) Using Blockchain" project, submitted to ICFT2025 (Paper ID: 157).

## Project Overview

This project is a full-stack decentralized application (DApp) that provides a secure, transparent, and traceable system for managing the blood supply chain. It consists of two main parts:

1.  **Smart Contract (Backend):** A Solidity-based smart contract (`BloodBank.sol`) that manages roles (Admin, Blood Bank, Hospital) and tracks blood units on the Polygon Amoy testnet.
2.  **Frontend (Web App):** A React and TypeScript application that allows users to interact with the live smart contract through their MetaMask wallet.

## Technology Stack

-   **Blockchain:** Polygon Amoy Testnet
-   **Smart Contract:** Solidity, Hardhat
-   **Frontend:** React, TypeScript, Vite, ethers.js
-   **Wallet:** MetaMask

## How to Run This Project

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn
-   MetaMask browser extension

### 1. Smart Contract Setup

```bash
# Navigate to the smart contract folder
cd polygon-hardhat

# Install dependencies
npm install

# Compile the smart contract
npx hardhat compile

# Run tests
npx hardhat test

# Navigate to the frontend folder
cd my-dapp-frontend

# Install dependencies
npm install

# Start the local development server
npm run dev
