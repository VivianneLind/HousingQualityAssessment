import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import type { AnonymousHousingQualityAssessment } from "../types";
import { expect } from "chai";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

describe("AnonymousHousingQualityAssessment - Sepolia Integration Tests", function () {
  let signers: Signers;
  let contract: AnonymousHousingQualityAssessment;
  let contractAddress: string;

  before(async function () {
    // Skip if running in Mock environment
    if (fhevm.isMock) {
      console.warn("⏭️  Skipping Sepolia tests - Mock environment detected");
      this.skip();
    }

    // Extended timeout for Sepolia network
    this.timeout(4 * 40000); // 160 seconds

    console.log("🚀 Starting Sepolia integration tests...");

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
    };

    console.log("📝 Deployer address:", signers.deployer.address);
    console.log("📝 Alice address:", signers.alice.address);
    console.log("📝 Bob address:", signers.bob.address);

    // Get deployed contract
    const deployment = await deployments.get("AnonymousHousingQualityAssessment");
    contractAddress = deployment.address;
    contract = await ethers.getContractAt(
      "AnonymousHousingQualityAssessment",
      contractAddress
    ) as unknown as AnonymousHousingQualityAssessment;

    console.log("✅ Connected to contract at:", contractAddress);
  });

  describe("Step 1: Contract Verification", function () {
    it("should verify contract is deployed and accessible", async function () {
      this.timeout(40000);

      console.log("  🔍 Verifying contract deployment...");

      expect(contractAddress).to.be.properAddress;
      expect(await contract.getAddress()).to.equal(contractAddress);

      const owner = await contract.owner();
      expect(owner).to.be.properAddress;

      console.log("  ✅ Contract verified at:", contractAddress);
      console.log("  ✅ Owner:", owner);
    });

    it("should have correct initial state", async function () {
      this.timeout(40000);

      console.log("  🔍 Checking initial state...");

      const nextId = await contract.nextAssessmentId();
      expect(nextId).to.be.gte(1);

      console.log("  ✅ Next Assessment ID:", nextId.toString());
    });
  });

  describe("Step 2: Assessor Registration on Sepolia", function () {
    it("should allow new assessor registration", async function () {
      this.timeout(80000);

      console.log("  📝 Registering Alice as assessor...");

      // Check if already registered
      const profileBefore = await contract.assessors(signers.alice.address);

      if (!profileBefore.isRegistered) {
        const tx = await contract.connect(signers.alice).registerAssessor();
        console.log("  ⏳ Transaction sent:", tx.hash);

        const receipt = await tx.wait();
        console.log("  ✅ Registration confirmed in block:", receipt!.blockNumber);

        expect(receipt!.status).to.equal(1);
      } else {
        console.log("  ℹ️  Alice already registered, skipping");
      }

      const profileAfter = await contract.assessors(signers.alice.address);
      expect(profileAfter.isRegistered).to.be.true;

      console.log("  ✅ Alice is now registered");
    });

    it("should track registration stats correctly", async function () {
      this.timeout(40000);

      console.log("  🔍 Checking registration stats...");

      const stats = await contract.getAssessorStats(signers.alice.address);

      expect(stats.isRegistered).to.be.true;
      expect(stats.registrationTime).to.be.gt(0);

      console.log("  ✅ Registration time:", new Date(Number(stats.registrationTime) * 1000).toISOString());
      console.log("  ✅ Total assessments:", stats.totalAssessments.toString());
      console.log("  ✅ Verified assessments:", stats.verifiedAssessments.toString());
    });
  });

  describe("Step 3: Assessor Certification on Sepolia", function () {
    it("should allow owner to certify registered assessor", async function () {
      this.timeout(80000);

      console.log("  🎓 Certifying Alice...");

      // Check if already certified
      const profileBefore = await contract.assessors(signers.alice.address);

      if (!profileBefore.isCertified) {
        const tx = await contract.connect(signers.deployer).certifyAssessor(signers.alice.address);
        console.log("  ⏳ Transaction sent:", tx.hash);

        const receipt = await tx.wait();
        console.log("  ✅ Certification confirmed in block:", receipt!.blockNumber);

        expect(receipt!.status).to.equal(1);
      } else {
        console.log("  ℹ️  Alice already certified, skipping");
      }

      const profileAfter = await contract.assessors(signers.alice.address);
      expect(profileAfter.isCertified).to.be.true;

      console.log("  ✅ Alice is now certified");
    });
  });

  describe("Step 4: Assessment Submission on Sepolia", function () {
    it("should allow certified assessor to submit quality assessment", async function () {
      this.timeout(120000);

      console.log("  📊 Submitting quality assessment...");

      const structuralScore = 85;
      const safetyScore = 90;
      const utilityScore = 75;
      const locationScore = 80;
      const propertyId = `SEPOLIA-TEST-${Date.now()}`;

      console.log("  📝 Property ID:", propertyId);
      console.log("  📝 Scores: Structural(85), Safety(90), Utility(75), Location(80)");

      const nextIdBefore = await contract.nextAssessmentId();
      console.log("  📝 Current assessment ID:", nextIdBefore.toString());

      const tx = await contract.connect(signers.alice).submitQualityAssessment(
        structuralScore,
        safetyScore,
        utilityScore,
        locationScore,
        propertyId
      );

      console.log("  ⏳ Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("  ✅ Assessment submitted in block:", receipt!.blockNumber);

      expect(receipt!.status).to.equal(1);

      const nextIdAfter = await contract.nextAssessmentId();
      expect(nextIdAfter).to.equal(nextIdBefore + 1n);

      console.log("  ✅ New assessment ID:", nextIdBefore.toString());
      console.log("  ✅ Next assessment ID will be:", nextIdAfter.toString());
    });

    it("should track assessor statistics after submission", async function () {
      this.timeout(40000);

      console.log("  🔍 Checking updated stats...");

      const stats = await contract.getAssessorStats(signers.alice.address);

      expect(stats.totalAssessments).to.be.gt(0);

      console.log("  ✅ Total assessments by Alice:", stats.totalAssessments.toString());
      console.log("  ✅ Verified assessments:", stats.verifiedAssessments.toString());
    });
  });

  describe("Step 5: Property Query on Sepolia", function () {
    it("should query property assessment count", async function () {
      this.timeout(40000);

      console.log("  🔍 Querying property assessments...");

      const totalAssessments = await contract.getTotalAssessments();

      expect(totalAssessments).to.be.gt(0);

      console.log("  ✅ Total assessments in system:", totalAssessments.toString());
    });
  });

  describe("Step 6: Gas Usage Analysis", function () {
    it("should record gas usage for registration", async function () {
      this.timeout(80000);

      console.log("  ⛽ Testing gas usage for registration...");

      // Register Bob if not already registered
      const profileBefore = await contract.assessors(signers.bob.address);

      if (!profileBefore.isRegistered) {
        const tx = await contract.connect(signers.bob).registerAssessor();
        console.log("  ⏳ Transaction sent:", tx.hash);

        const receipt = await tx.wait();
        console.log("  ✅ Transaction confirmed");

        const gasUsed = receipt!.gasUsed;
        console.log("  ⛽ Gas used for registration:", gasUsed.toString());

        expect(gasUsed).to.be.lt(1000000n); // Should be less than 1M gas
      } else {
        console.log("  ℹ️  Bob already registered, skipping gas test");
      }
    });

    it("should record gas usage for assessment submission", async function () {
      this.timeout(120000);

      console.log("  ⛽ Testing gas usage for assessment submission...");

      // Ensure Bob is certified
      const profileBefore = await contract.assessors(signers.bob.address);

      if (!profileBefore.isCertified) {
        console.log("  🎓 Certifying Bob first...");
        const certTx = await contract.connect(signers.deployer).certifyAssessor(signers.bob.address);
        await certTx.wait();
        console.log("  ✅ Bob certified");
      }

      const propertyId = `GAS-TEST-${Date.now()}`;
      const tx = await contract.connect(signers.bob).submitQualityAssessment(
        80, 85, 70, 75, propertyId
      );

      console.log("  ⏳ Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed;

      console.log("  ⛽ Gas used for assessment:", gasUsed.toString());

      expect(gasUsed).to.be.lt(2000000n); // Should be less than 2M gas
    });
  });

  describe("Step 7: Network Verification", function () {
    it("should confirm deployment on Sepolia network", async function () {
      this.timeout(40000);

      console.log("  🌐 Verifying network...");

      const network = await ethers.provider.getNetwork();

      expect(network.chainId).to.equal(11155111n); // Sepolia chain ID

      console.log("  ✅ Network name:", network.name);
      console.log("  ✅ Chain ID:", network.chainId.toString());
      console.log("  ✅ Contract address:", contractAddress);
      console.log("  🔗 Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
    });
  });

  after(function () {
    console.log("\n🎉 Sepolia integration tests completed!");
    console.log("📊 Summary:");
    console.log("  - Contract verified on Sepolia");
    console.log("  - Assessor registration tested");
    console.log("  - Assessor certification tested");
    console.log("  - Assessment submission tested");
    console.log("  - Gas usage analyzed");
    console.log("  - All operations confirmed on-chain");
  });
});
