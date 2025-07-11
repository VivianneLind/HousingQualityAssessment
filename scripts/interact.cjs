const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔄 Starting contract interaction script...\n");

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
  const [signer] = await hre.ethers.getSigners();

  console.log("📋 Interaction Details:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Signer Address:", signer.address);
  console.log("💰 Signer Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(signer.address)), "ETH");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Get contract instance
  const Contract = await hre.ethers.getContractFactory("AnonymousHousingQualityAssessment");
  const contract = Contract.attach(contractAddress);

  // Menu-driven interaction
  console.log("📚 Available Interactions:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1️⃣  Check contract owner");
  console.log("2️⃣  Register as assessor");
  console.log("3️⃣  Check assessor status");
  console.log("4️⃣  Get total assessments");
  console.log("5️⃣  Submit quality assessment");
  console.log("6️⃣  Verify assessment (owner only)");
  console.log("7️⃣  Get quality report");
  console.log("8️⃣  Get assessor statistics");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Execute all read operations
  try {
    // 1. Check owner
    console.log("1️⃣  Checking contract owner...");
    const owner = await contract.owner();
    console.log("   ✅ Owner:", owner);
    console.log("   📌 Is signer owner?", owner.toLowerCase() === signer.address.toLowerCase() ? "Yes" : "No");
    console.log();

    // 2. Check assessor status
    console.log("2️⃣  Checking assessor status for signer...");
    const assessorStats = await contract.getAssessorStats(signer.address);
    console.log("   ✅ Assessor Status:");
    console.log("      - Registered:", assessorStats[0]);
    console.log("      - Certified:", assessorStats[1]);
    console.log("      - Total Assessments:", assessorStats[2].toString());
    console.log("      - Verified Assessments:", assessorStats[3].toString());
    console.log();

    // 3. Get total assessments
    console.log("3️⃣  Getting total assessments...");
    const totalAssessments = await contract.getTotalAssessments();
    console.log("   ✅ Total Assessments in System:", totalAssessments.toString());
    console.log();

    // Interactive actions
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎯 Interactive Actions (Uncomment to use)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Example: Register as assessor
    console.log("💡 To register as assessor, uncomment the following code:");
    console.log(`
    // if (!assessorStats[0]) {
    //   console.log("4️⃣  Registering as assessor...");
    //   const tx = await contract.registerAssessor();
    //   await tx.wait();
    //   console.log("   ✅ Registered successfully!");
    //   console.log("   📝 Transaction:", tx.hash);
    // }
    `);

    // Example: Submit assessment
    console.log("💡 To submit an assessment (requires certification), uncomment:");
    console.log(`
    // if (assessorStats[1]) {
    //   console.log("5️⃣  Submitting quality assessment...");
    //   const tx = await contract.submitQualityAssessment(
    //     85,  // structural score
    //     90,  // safety score
    //     80,  // utility score
    //     88,  // location score
    //     "property_encrypted_id_001"
    //   );
    //   await tx.wait();
    //   console.log("   ✅ Assessment submitted!");
    //   console.log("   📝 Transaction:", tx.hash);
    // }
    `);

    // Example: Certify assessor (owner only)
    if (owner.toLowerCase() === signer.address.toLowerCase()) {
      console.log("💡 As owner, to certify an assessor, uncomment:");
      console.log(`
    // const assessorAddress = "0x..."; // Address to certify
    // console.log("6️⃣  Certifying assessor...");
    // const tx = await contract.certifyAssessor(assessorAddress);
    // await tx.wait();
    // console.log("   ✅ Assessor certified!");
    // console.log("   📝 Transaction:", tx.hash);
      `);
    }

    // Example: Get assessment info
    if (totalAssessments > 0) {
      console.log("\n7️⃣  Getting assessment info for ID 1...");
      try {
        const assessmentInfo = await contract.getAssessmentInfo(1);
        console.log("   ✅ Assessment Info:");
        console.log("      - Assessor:", assessmentInfo[0]);
        console.log("      - Timestamp:", new Date(Number(assessmentInfo[1]) * 1000).toLocaleString());
        console.log("      - Verified:", assessmentInfo[2]);
        console.log("      - Completed:", assessmentInfo[3]);
        console.log("      - Property ID:", assessmentInfo[4]);
        console.log();

        // Try to get quality report
        console.log("8️⃣  Checking for quality report...");
        try {
          const report = await contract.getQualityReport(1);
          console.log("   ✅ Quality Report:");
          console.log("      - Overall Score:", report[0].toString());
          console.log("      - Structural Issues:", report[1]);
          console.log("      - Safety Issues:", report[2]);
          console.log("      - Utility Issues:", report[3]);
          console.log("      - Report Time:", new Date(Number(report[4]) * 1000).toLocaleString());
        } catch (error) {
          console.log("   ℹ️  No quality report generated yet (needs verification)");
        }
      } catch (error) {
        console.log("   ℹ️  No assessment found with ID 1");
      }
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Interaction script completed!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📚 Next Steps:");
    console.log("   1. Uncomment the interactive sections to perform write operations");
    console.log("   2. Modify parameters as needed for your use case");
    console.log("   3. Run the script again after making changes");
    console.log("   4. View transactions on Etherscan:");
    console.log(`      https://sepolia.etherscan.io/address/${contractAddress}\n`);

  } catch (error) {
    console.error("\n❌ Interaction failed!");
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
