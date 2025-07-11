const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔍 Starting contract verification on Etherscan...\n");

  // Read deployment info
  let deploymentInfo;
  try {
    const data = fs.readFileSync("deployment-info.json", "utf8");
    deploymentInfo = JSON.parse(data);
  } catch (error) {
    console.error("❌ Error: deployment-info.json not found!");
    console.error("   Please deploy the contract first using: npm run deploy:sepolia");
    process.exit(1);
  }

  const contractAddress = deploymentInfo.contractAddress;
  const network = deploymentInfo.network;

  console.log("📋 Verification Details:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🌐 Network:", network);
  console.log("📦 Contract Name: AnonymousHousingQualityAssessment");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("⏳ Waiting 30 seconds for Etherscan to index the contract...");
  await new Promise(resolve => setTimeout(resolve, 30000));

  try {
    console.log("\n🔄 Verifying contract on Etherscan...\n");

    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // No constructor arguments
      contract: "contracts/AnonymousHousingQualityAssessment.sol:AnonymousHousingQualityAssessment"
    });

    console.log("\n✅ Contract verified successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔗 View verified contract:");
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}#code\n`);

    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verificationTime = new Date().toISOString();

    fs.writeFileSync(
      "deployment-info.json",
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("💾 Verification info saved to deployment-info.json\n");

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✅ Contract is already verified on Etherscan!");
      console.log(`🔗 View contract: https://sepolia.etherscan.io/address/${contractAddress}#code\n`);
    } else {
      console.error("\n❌ Verification failed!");
      console.error("Error:", error.message);
      console.error("\n💡 Troubleshooting tips:");
      console.error("   1. Check that ETHERSCAN_API_KEY is set in .env");
      console.error("   2. Wait a bit longer and try again");
      console.error("   3. Verify manually on Etherscan using the contract source code");
      console.error("   4. Check network connection and Etherscan API status\n");
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
