import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const AMOY_RPC_URL = process.env.AMOY_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    amoy: {
      url: AMOY_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};

export default config;