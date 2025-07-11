const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🎭 Starting complete workflow simulation...\n");

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
  const [deployer, alice, bob, carol] = await hre.ethers.getSigners();

  console.log("📋 Simulation Setup:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Owner (Deployer):", deployer.address);
  console.log("👤 Assessor Alice:", alice.address);
  console.log("👤 Assessor Bob:", bob.address);
  console.log("👤 Assessor Carol:", carol.address);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Get contract instance
  const Contract = await hre.ethers.getContractFactory("AnonymousHousingQualityAssessment");
  const contract = Contract.attach(contractAddress);

  try {
    // ============================================
    // Step 1: Register Assessors
    // ============================================
    console.log("📝 Step 1: Registering Assessors");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("   👤 Alice registering...");
    let tx = await contract.connect(alice).registerAssessor();
    await tx.wait();
    console.log("   ✅ Alice registered - TX:", tx.hash);

    console.log("   👤 Bob registering...");
    tx = await contract.connect(bob).registerAssessor();
    await tx.wait();
    console.log("   ✅ Bob registered - TX:", tx.hash);

    console.log("   👤 Carol registering...");
    tx = await contract.connect(carol).registerAssessor();
    await tx.wait();
    console.log("   ✅ Carol registered - TX:", tx.hash);
    console.log();

    // ============================================
    // Step 2: Certify Assessors
    // ============================================
    console.log("🎓 Step 2: Certifying Assessors (Owner Action)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("   🎓 Certifying Alice...");
    tx = await contract.connect(deployer).certifyAssessor(alice.address);
    await tx.wait();
    console.log("   ✅ Alice certified - TX:", tx.hash);

    console.log("   🎓 Certifying Bob...");
    tx = await contract.connect(deployer).certifyAssessor(bob.address);
    await tx.wait();
    console.log("   ✅ Bob certified - TX:", tx.hash);

    console.log("   ℹ️  Carol not certified (for testing purposes)");
    console.log();

    // ============================================
    // Step 3: Submit Quality Assessments
    // ============================================
    console.log("📊 Step 3: Submitting Quality Assessments");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Alice submits high-quality assessment
    console.log("   📊 Alice assessing Property A (High Quality)...");
    tx = await contract.connect(alice).submitQualityAssessment(
      90, // structural score
      92, // safety score
      88, // utility score
      85, // location score
      "PROPERTY_A_ENC_001"
    );
    await tx.wait();
    console.log("   ✅ Assessment submitted - TX:", tx.hash);
    console.log("      Property: A | Scores: [90, 92, 88, 85]");

    // Bob submits medium-quality assessment
    console.log("   📊 Bob assessing Property B (Medium Quality)...");
    tx = await contract.connect(bob).submitQualityAssessment(
      70, // structural score
      75, // safety score
      72, // utility score
      68, // location score
      "PROPERTY_B_ENC_002"
    );
    await tx.wait();
    console.log("   ✅ Assessment submitted - TX:", tx.hash);
    console.log("      Property: B | Scores: [70, 75, 72, 68]");

    // Alice submits low-quality assessment (critical issues)
    console.log("   📊 Alice assessing Property C (Low Quality - Critical Issues)...");
    tx = await contract.connect(alice).submitQualityAssessment(
      25, // structural score - CRITICAL!
      28, // safety score - CRITICAL!
      40, // utility score
      35, // location score
      "PROPERTY_C_ENC_003"
    );
    await tx.wait();
    console.log("   ✅ Assessment submitted - TX:", tx.hash);
    console.log("      Property: C | Scores: [25, 28, 40, 35] ⚠️  CRITICAL ISSUES DETECTED!");

    // Bob submits another assessment for Property A
    console.log("   📊 Bob assessing Property A (Second Opinion)...");
    tx = await contract.connect(bob).submitQualityAssessment(
      88, // structural score
      90, // safety score
      85, // utility score
      87, // location score
      "PROPERTY_A_ENC_001"
    );
    await tx.wait();
    console.log("   ✅ Assessment submitted - TX:", tx.hash);
    console.log("      Property: A | Scores: [88, 90, 85, 87]");
    console.log();

    // ============================================
    // Step 4: Verify Assessments
    // ============================================
    console.log("✅ Step 4: Verifying Assessments (Owner Action)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    for (let i = 1; i <= 4; i++) {
      console.log(`   ✅ Verifying Assessment ID ${i}...`);
      tx = await contract.connect(deployer).verifyAssessment(i);
      await tx.wait();
      console.log(`   ✅ Assessment ${i} verified - TX:`, tx.hash);
    }
    console.log();

    // ============================================
    // Step 5: Retrieve and Display Results
    // ============================================
    console.log("📈 Step 5: Retrieving Results");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Get total assessments
    const totalAssessments = await contract.getTotalAssessments();
    console.log("   📊 Total Assessments:", totalAssessments.toString());
    console.log();

    // Get assessor statistics
    console.log("   👥 Assessor Statistics:");
    for (const [name, assessor] of [["Alice", alice], ["Bob", bob], ["Carol", carol]]) {
      const stats = await contract.getAssessorStats(assessor.address);
      console.log(`      ${name}:`);
      console.log(`         - Registered: ${stats[0]}`);
      console.log(`         - Certified: ${stats[1]}`);
      console.log(`         - Total Assessments: ${stats[2]}`);
      console.log(`         - Verified Assessments: ${stats[3]}`);
    }
    console.log();

    // Get quality reports
    console.log("   📋 Quality Reports:");
    for (let i = 1; i <= 4; i++) {
      const assessmentInfo = await contract.getAssessmentInfo(i);
      const report = await contract.getQualityReport(i);

      console.log(`      Assessment ID ${i}:`);
      console.log(`         - Assessor: ${assessmentInfo[0] === alice.address ? "Alice" : "Bob"}`);
      console.log(`         - Property ID: ${assessmentInfo[4]}`);
      console.log(`         - Overall Score: ${report[0]}`);
      console.log(`         - Structural Issues: ${report[1] ? "Yes ⚠️" : "No ✅"}`);
      console.log(`         - Safety Issues: ${report[2] ? "Yes ⚠️" : "No ✅"}`);
      console.log(`         - Utility Issues: ${report[3] ? "Yes ⚠️" : "No ✅"}`);
      console.log(`         - Timestamp: ${new Date(Number(assessmentInfo[1]) * 1000).toLocaleString()}`);
      console.log();
    }

    // Get property assessment counts
    console.log("   🏠 Property Assessment Counts:");
    const propertyA = await contract.getPropertyAssessmentCount("PROPERTY_A_ENC_001");
    const propertyB = await contract.getPropertyAssessmentCount("PROPERTY_B_ENC_002");
    const propertyC = await contract.getPropertyAssessmentCount("PROPERTY_C_ENC_003");

    console.log(`      Property A: ${propertyA} assessments`);
    console.log(`      Property B: ${propertyB} assessment`);
    console.log(`      Property C: ${propertyC} assessment ⚠️  CRITICAL`);
    console.log();

    // ============================================
    // Summary
    // ============================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✨ Simulation Completed Successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📊 Summary:");
    console.log(`   • Total Assessments: ${totalAssessments}`);
    console.log(`   • Registered Assessors: 3`);
    console.log(`   • Certified Assessors: 2`);
    console.log(`   • Properties Assessed: 3`);
    console.log(`   • Critical Issues Found: 1 (Property C)`);
    console.log();

    console.log("🔗 View on Etherscan:");
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}\n`);

    console.log("📚 Demonstrated Features:");
    console.log("   ✅ Assessor registration");
    console.log("   ✅ Assessor certification");
    console.log("   ✅ Quality assessment submission");
    console.log("   ✅ Assessment verification");
    console.log("   ✅ Quality report generation");
    console.log("   ✅ Critical issue detection");
    console.log("   ✅ Multi-assessor property evaluation");
    console.log("   ✅ Privacy-preserving encrypted scores\n");

  } catch (error) {
    console.error("\n❌ Simulation failed!");
    console.error("Error:", error.message);

    if (error.message.includes("Not a certified assessor")) {
      console.error("\n💡 This error is expected if trying to submit as Carol (uncertified)");
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
