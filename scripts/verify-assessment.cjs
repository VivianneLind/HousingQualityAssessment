const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔍 Verifying assessment...\n");

  // Read deployment info
  let deploymentInfo;
  try {
    const data = fs.readFileSync("deployment-info.json", "utf8");
    deploymentInfo = JSON.parse(data);
  } catch (error) {
    console.error("❌ Error: deployment-info.json not found!");
    process.exit(1);
  }

  const contractAddress = deploymentInfo.contractAddress;
  const [owner] = await hre.ethers.getSigners();

  console.log("📋 Verification Details:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Owner Address:", owner.address);
  console.log("💰 Owner Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(owner.address)), "ETH");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Get contract instance
  const Contract = await hre.ethers.getContractFactory("AnonymousHousingQualityAssessment");
  const contract = Contract.attach(contractAddress);

  // Get total assessments
  const totalAssessments = await contract.getTotalAssessments();
  console.log("📊 Total Assessments:", totalAssessments.toString());

  if (totalAssessments == 0) {
    console.log("\n⚠️  No assessments to verify!");
    console.log("   Please submit an assessment first.");
    process.exit(0);
  }

  // List all assessments
  console.log("\n📋 Available Assessments:\n");

  for (let i = 1; i <= totalAssessments; i++) {
    const info = await contract.getAssessmentInfo(i);
    console.log(`   Assessment ID ${i}:`);
    console.log(`      - Assessor: ${info[0]}`);
    console.log(`      - Timestamp: ${new Date(Number(info[1]) * 1000).toLocaleString()}`);
    console.log(`      - Verified: ${info[2] ? "Yes ✅" : "No ❌"}`);
    console.log(`      - Completed: ${info[3] ? "Yes ✅" : "No ❌"}`);
    console.log(`      - Property ID: ${info[4]}`);
    console.log();
  }

  // Get assessment ID from command line or default to 1
  const assessmentId = process.argv[2] || 1;

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🔄 Verifying Assessment ID: ${assessmentId}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  try {
    // Check if already verified
    const info = await contract.getAssessmentInfo(assessmentId);
    if (info[2]) {
      console.log("⚠️  This assessment is already verified!");
      console.log("   Skipping verification.\n");

      // Show quality report
      try {
        const report = await contract.getQualityReport(assessmentId);
        console.log("📊 Quality Report:");
        console.log("   - Overall Score:", report[0].toString());
        console.log("   - Structural Issues:", report[1] ? "Yes ⚠️" : "No ✅");
        console.log("   - Safety Issues:", report[2] ? "Yes ⚠️" : "No ✅");
        console.log("   - Utility Issues:", report[3] ? "Yes ⚠️" : "No ✅");
        console.log("   - Report Time:", new Date(Number(report[4]) * 1000).toLocaleString());
      } catch (err) {
        console.log("   (Report not available)");
      }

      process.exit(0);
    }

    if (!info[3]) {
      console.log("❌ Error: Assessment is not completed!");
      process.exit(1);
    }

    // Verify the assessment
    console.log("⏳ Sending verification transaction...");
    const tx = await contract.verifyAssessment(assessmentId);
    console.log("📝 Transaction Hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...\n");

    const receipt = await tx.wait();

    console.log("✅ Assessment verified successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📝 Transaction:", tx.hash);
    console.log("⛽ Gas Used:", receipt.gasUsed.toString());
    console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Get and display the quality report
    console.log("📊 Quality Report Generated:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const report = await contract.getQualityReport(assessmentId);
    console.log("   - Assessment ID:", assessmentId);
    console.log("   - Overall Score:", report[0].toString());
    console.log("   - Structural Issues:", report[1] ? "Yes ⚠️" : "No ✅");
    console.log("   - Safety Issues:", report[2] ? "Yes ⚠️" : "No ✅");
    console.log("   - Utility Issues:", report[3] ? "Yes ⚠️" : "No ✅");
    console.log("   - Report Time:", new Date(Number(report[4]) * 1000).toLocaleString());
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("✨ Verification Complete!\n");

  } catch (error) {
    console.error("\n❌ Verification failed!");

    if (error.message.includes("Not authorized")) {
      console.error("   Error: Only the contract owner can verify assessments");
      console.error(`   Owner address: ${owner.address}`);
      console.error(`   Make sure you're using the correct account in MetaMask\n`);
    } else if (error.message.includes("Assessment not completed")) {
      console.error("   Error: Assessment is not completed yet");
    } else if (error.message.includes("Already verified")) {
      console.error("   Error: Assessment is already verified");
    } else {
      console.error("   Error:", error.message);
    }

    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
