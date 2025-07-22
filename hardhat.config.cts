import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
// import "fhevm/plugin"; // Commented out - not needed for deployment
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  // TypeScript configuration for Hardhat
  ...(process.env.TS_NODE_PROJECT ? {} : {
    // Override ts-node config when not set
  }),
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Optimized for deployment cost vs runtime cost balance
        details: {
          yul: true,
          yulDetails: {
            stackAllocation: true,
            optimizerSteps: "dhfoDgvulfnTUtnIf"
          }
        }
      },
      evmVersion: "cancun",
      viaIR: false, // Set to true for better optimization (longer compile time)
    },
  },
  networks: {
    hardhat: {
      // Mock environment for fast local testing
      chainId: 31337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 10,
      },
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: "auto",
      gas: "auto",
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    alice: {
      default: 1,
    },
    bob: {
      default: 2,
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
    alwaysGenerateOverloads: false,
    externalArtifacts: ["externalArtifacts/*.json"],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deploy: "./deploy",
    deployments: "./deployments",
  },
  mocha: {
    timeout: 40000, // 40 seconds for Mock tests
    bail: false,
    allowUncaught: false,
    require: ["ts-node/register"],
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt",
    noColors: true,
    showTimeSpent: true,
    showMethodSig: true,
    token: "ETH",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: [],
  },
};

export default config;
