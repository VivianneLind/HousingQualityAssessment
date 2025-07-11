const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment to Sepolia (v2.0 - Simplified)...\n");

  const [deployer] = await hre.ethers.getSigners();

  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  console.log("📦 Deploying AnonymousHousingQualityAssessment v2.0...");
  console.log("   (Simplified version without Gateway dependency)\n");

  // Deploy the contract (no Gateway parameter needed)
  const Contract = await hre.ethers.getContractFactory("AnonymousHousingQualityAssessment");
  const contract = await Contract.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log("\n✅ Deployment successful!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Owner Address:", deployer.address);
  console.log("🔄 Version: 2.0 (Simplified Verification)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("🔍 View on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${contractAddress}\n`);

  console.log("📋 Next steps:");
  console.log("   1. Verify contract on Etherscan (if needed)");
  console.log("   2. Update frontend with contract address");
  console.log("   3. Test the contract functionality");
  console.log("   4. Register assessors and start testing\n");

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: "sepolia",
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    version: "2.0"
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to: deployment-info.json\n");

  // Update frontend contract address
  const contractsConfig = `export const CONTRACT_ADDRESS = "${contractAddress}" as const;

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint32",
        "name": "assessmentId",
        "type": "uint32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "assessor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "AssessmentSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint32",
        "name": "assessmentId",
        "type": "uint32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "verifier",
        "type": "address"
      }
    ],
    "name": "AssessmentVerified",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "assessor",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "certifier",
        "type": "address"
      }
    ],
    "name": "AssessorCertified",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "assessor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "AssessorRegistered",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "registerAssessor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "assessor",
        "type": "address"
      }
    ],
    "name": "certifyAssessor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "_structuralScore",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "_safetyScore",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "_utilityScore",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "_locationScore",
        "type": "uint32"
      },
      {
        "internalType": "string",
        "name": "_encryptedPropertyId",
        "type": "string"
      }
    ],
    "name": "submitQualityAssessment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "assessmentId",
        "type": "uint32"
      }
    ],
    "name": "verifyAssessment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "assessmentId",
        "type": "uint32"
      }
    ],
    "name": "getAssessmentInfo",
    "outputs": [
      {
        "internalType": "address",
        "name": "assessor",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isVerified",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isCompleted",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "encryptedPropertyId",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "assessmentId",
        "type": "uint32"
      }
    ],
    "name": "getQualityReport",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "publicOverallScore",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "hasStructuralIssues",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "hasSafetyIssues",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "hasUtilityIssues",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "reportTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "assessor",
        "type": "address"
      }
    ],
    "name": "getAssessorStats",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isRegistered",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isCertified",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "totalAssessments",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "verifiedAssessments",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "registrationTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "encryptedPropertyId",
        "type": "string"
      }
    ],
    "name": "getPropertyAssessmentCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "encryptedPropertyId",
        "type": "string"
      }
    ],
    "name": "getPropertyAssessmentIds",
    "outputs": [
      {
        "internalType": "uint32[]",
        "name": "",
        "type": "uint32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalAssessments",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
`;

  fs.writeFileSync("src/config/contracts.ts", contractsConfig);
  console.log("✅ Frontend config updated: src/config/contracts.ts\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed!");
    console.error(error);
    process.exit(1);
  });
