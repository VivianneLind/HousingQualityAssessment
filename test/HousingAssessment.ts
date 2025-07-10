import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import type { AnonymousHousingQualityAssessment } from "../types";
import { expect } from "chai";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

async function deployFixture() {
  const gatewayAddress = "0x0000000000000000000000000000000000000001"; // Mock gateway
  const factory = await ethers.getContractFactory("AnonymousHousingQualityAssessment");
  const contract = await factory.deploy(gatewayAddress);
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("AnonymousHousingQualityAssessment", function () {
  let signers: Signers;
  let contract: AnonymousHousingQualityAssessment;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      charlie: ethSigners[3],
    };
  });

  beforeEach(async function () {
    // Only run in Mock environment
    if (!fhevm.isMock) {
      console.warn("This test suite can only run in Mock environment");
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  describe("Deployment", function () {
    it("should deploy successfully with correct owner", async function () {
      expect(await contract.getAddress()).to.be.properAddress;
      expect(await contract.owner()).to.equal(signers.deployer.address);
    });

    it("should initialize nextAssessmentId to 1", async function () {
      expect(await contract.nextAssessmentId()).to.equal(1);
    });

    it("should revert with zero gateway address", async function () {
      const factory = await ethers.getContractFactory("AnonymousHousingQualityAssessment");
      await expect(
        factory.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid gateway address");
    });
  });

  describe("Assessor Registration", function () {
    it("should allow new assessor to register", async function () {
      await expect(
        contract.connect(signers.alice).registerAssessor()
      ).to.emit(contract, "AssessorRegistered")
        .withArgs(signers.alice.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      const profile = await contract.assessors(signers.alice.address);
      expect(profile.isRegistered).to.be.true;
      expect(profile.isCertified).to.be.false;
      expect(profile.totalAssessments).to.equal(0);
    });

    it("should reject duplicate registration", async function () {
      await contract.connect(signers.alice).registerAssessor();

      await expect(
        contract.connect(signers.alice).registerAssessor()
      ).to.be.revertedWith("Already registered");
    });

    it("should track registration time correctly", async function () {
      const tx = await contract.connect(signers.alice).registerAssessor();
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      const profile = await contract.assessors(signers.alice.address);
      expect(profile.registrationTime).to.equal(block!.timestamp);
    });
  });

  describe("Assessor Certification", function () {
    beforeEach(async function () {
      await contract.connect(signers.alice).registerAssessor();
    });

    it("should allow owner to certify registered assessor", async function () {
      await expect(
        contract.connect(signers.deployer).certifyAssessor(signers.alice.address)
      ).to.emit(contract, "AssessorCertified")
        .withArgs(signers.alice.address, signers.deployer.address);

      const profile = await contract.assessors(signers.alice.address);
      expect(profile.isCertified).to.be.true;
    });

    it("should reject certification by non-owner", async function () {
      await expect(
        contract.connect(signers.bob).certifyAssessor(signers.alice.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("should reject certification of unregistered assessor", async function () {
      await expect(
        contract.connect(signers.deployer).certifyAssessor(signers.bob.address)
      ).to.be.revertedWith("Assessor not registered");
    });

    it("should reject duplicate certification", async function () {
      await contract.connect(signers.deployer).certifyAssessor(signers.alice.address);

      await expect(
        contract.connect(signers.deployer).certifyAssessor(signers.alice.address)
      ).to.be.revertedWith("Already certified");
    });
  });

  describe("Assessment Submission", function () {
    beforeEach(async function () {
      // Register and certify Alice
      await contract.connect(signers.alice).registerAssessor();
      await contract.connect(signers.deployer).certifyAssessor(signers.alice.address);
    });

    it("should allow certified assessor to submit assessment", async function () {
      const structuralScore = 85;
      const safetyScore = 90;
      const utilityScore = 75;
      const locationScore = 80;
      const propertyId = "PROP-2024-001";

      await expect(
        contract.connect(signers.alice).submitQualityAssessment(
          structuralScore,
          safetyScore,
          utilityScore,
          locationScore,
          propertyId
        )
      ).to.emit(contract, "AssessmentSubmitted")
        .withArgs(1, signers.alice.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await contract.nextAssessmentId()).to.equal(2);

      const profile = await contract.assessors(signers.alice.address);
      expect(profile.totalAssessments).to.equal(1);
    });

    it("should reject submission from uncertified assessor", async function () {
      await contract.connect(signers.bob).registerAssessor();

      await expect(
        contract.connect(signers.bob).submitQualityAssessment(
          85, 90, 75, 80, "PROP-001"
        )
      ).to.be.revertedWith("Not a certified assessor");
    });

    it("should reject submission from unregistered user", async function () {
      await expect(
        contract.connect(signers.charlie).submitQualityAssessment(
          85, 90, 75, 80, "PROP-001"
        )
      ).to.be.revertedWith("Not a registered assessor");
    });

    it("should track multiple assessments for same property", async function () {
      const propertyId = "PROP-2024-001";

      await contract.connect(signers.alice).submitQualityAssessment(
        85, 90, 75, 80, propertyId
      );

      // Register and certify Bob
      await contract.connect(signers.bob).registerAssessor();
      await contract.connect(signers.deployer).certifyAssessor(signers.bob.address);

      await contract.connect(signers.bob).submitQualityAssessment(
        80, 85, 70, 75, propertyId
      );

      const count = await contract.getPropertyAssessmentCount(propertyId);
      expect(count).to.equal(2);

      const ids = await contract.getPropertyAssessmentIds(propertyId);
      expect(ids.length).to.equal(2);
      expect(ids[0]).to.equal(1);
      expect(ids[1]).to.equal(2);
    });
  });

  describe("Assessment Verification", function () {
    beforeEach(async function () {
      // Register and certify Alice
      await contract.connect(signers.alice).registerAssessor();
      await contract.connect(signers.deployer).certifyAssessor(signers.alice.address);

      // Submit an assessment
      await contract.connect(signers.alice).submitQualityAssessment(
        85, 90, 75, 80, "PROP-001"
      );
    });

    it("should allow owner to verify assessment", async function () {
      await expect(
        contract.connect(signers.deployer).verifyAssessment(1)
      ).to.emit(contract, "AssessmentVerified")
        .withArgs(1, signers.deployer.address);

      const assessment = await contract.assessments(1);
      expect(assessment.isVerified).to.be.true;

      const profile = await contract.assessors(signers.alice.address);
      expect(profile.verifiedAssessments).to.equal(1);
    });

    it("should reject verification by non-owner", async function () {
      await expect(
        contract.connect(signers.alice).verifyAssessment(1)
      ).to.be.revertedWith("Not authorized");
    });

    it("should reject verification of non-existent assessment", async function () {
      await expect(
        contract.connect(signers.deployer).verifyAssessment(999)
      ).to.be.revertedWith("Assessment not completed");
    });

    it("should reject duplicate verification", async function () {
      await contract.connect(signers.deployer).verifyAssessment(1);

      await expect(
        contract.connect(signers.deployer).verifyAssessment(1)
      ).to.be.revertedWith("Already verified");
    });
  });

  describe("Assessor Statistics", function () {
    it("should return correct stats for unregistered assessor", async function () {
      const stats = await contract.getAssessorStats(signers.alice.address);

      expect(stats.isRegistered).to.be.false;
      expect(stats.isCertified).to.be.false;
      expect(stats.totalAssessments).to.equal(0);
      expect(stats.verifiedAssessments).to.equal(0);
      expect(stats.registrationTime).to.equal(0);
    });

    it("should return correct stats for registered assessor", async function () {
      await contract.connect(signers.alice).registerAssessor();

      const stats = await contract.getAssessorStats(signers.alice.address);

      expect(stats.isRegistered).to.be.true;
      expect(stats.isCertified).to.be.false;
      expect(stats.totalAssessments).to.equal(0);
    });

    it("should track multiple assessments correctly", async function () {
      await contract.connect(signers.alice).registerAssessor();
      await contract.connect(signers.deployer).certifyAssessor(signers.alice.address);

      await contract.connect(signers.alice).submitQualityAssessment(
        85, 90, 75, 80, "PROP-001"
      );
      await contract.connect(signers.alice).submitQualityAssessment(
        80, 85, 70, 75, "PROP-002"
      );

      const stats = await contract.getAssessorStats(signers.alice.address);
      expect(stats.totalAssessments).to.equal(2);
      expect(stats.verifiedAssessments).to.equal(0);

      await contract.connect(signers.deployer).verifyAssessment(1);

      const statsAfter = await contract.getAssessorStats(signers.alice.address);
      expect(statsAfter.verifiedAssessments).to.equal(1);
    });
  });

  describe("Property Assessment Queries", function () {
    beforeEach(async function () {
      await contract.connect(signers.alice).registerAssessor();
      await contract.connect(signers.deployer).certifyAssessor(signers.alice.address);
    });

    it("should return zero count for property with no assessments", async function () {
      const count = await contract.getPropertyAssessmentCount("PROP-999");
      expect(count).to.equal(0);
    });

    it("should return correct count for assessed property", async function () {
      await contract.connect(signers.alice).submitQualityAssessment(
        85, 90, 75, 80, "PROP-001"
      );

      const count = await contract.getPropertyAssessmentCount("PROP-001");
      expect(count).to.equal(1);
    });

    it("should return empty array for property with no assessments", async function () {
      const ids = await contract.getPropertyAssessmentIds("PROP-999");
      expect(ids.length).to.equal(0);
    });

    it("should return correct assessment IDs", async function () {
      await contract.connect(signers.alice).submitQualityAssessment(
        85, 90, 75, 80, "PROP-001"
      );
      await contract.connect(signers.alice).submitQualityAssessment(
        80, 85, 70, 75, "PROP-001"
      );

      const ids = await contract.getPropertyAssessmentIds("PROP-001");
      expect(ids.length).to.equal(2);
      expect(ids[0]).to.equal(1);
      expect(ids[1]).to.equal(2);
    });
  });

  describe("System Statistics", function () {
    it("should return total assessments count", async function () {
      expect(await contract.getTotalAssessments()).to.equal(0);

      await contract.connect(signers.alice).registerAssessor();
      await contract.connect(signers.deployer).certifyAssessor(signers.alice.address);

      await contract.connect(signers.alice).submitQualityAssessment(
        85, 90, 75, 80, "PROP-001"
      );

      expect(await contract.getTotalAssessments()).to.equal(1);

      await contract.connect(signers.alice).submitQualityAssessment(
        80, 85, 70, 75, "PROP-002"
      );

      expect(await contract.getTotalAssessments()).to.equal(2);
    });
  });

  describe("Edge Cases", function () {
    beforeEach(async function () {
      await contract.connect(signers.alice).registerAssessor();
      await contract.connect(signers.deployer).certifyAssessor(signers.alice.address);
    });

    it("should handle zero scores", async function () {
      await expect(
        contract.connect(signers.alice).submitQualityAssessment(
          0, 0, 0, 0, "PROP-ZERO"
        )
      ).to.emit(contract, "AssessmentSubmitted");
    });

    it("should handle maximum scores", async function () {
      await expect(
        contract.connect(signers.alice).submitQualityAssessment(
          100, 100, 100, 100, "PROP-MAX"
        )
      ).to.emit(contract, "AssessmentSubmitted");
    });

    it("should handle empty property ID", async function () {
      await expect(
        contract.connect(signers.alice).submitQualityAssessment(
          85, 90, 75, 80, ""
        )
      ).to.emit(contract, "AssessmentSubmitted");
    });

    it("should handle long property ID", async function () {
      const longId = "PROP-" + "X".repeat(100);

      await expect(
        contract.connect(signers.alice).submitQualityAssessment(
          85, 90, 75, 80, longId
        )
      ).to.emit(contract, "AssessmentSubmitted");
    });

    it("should handle special characters in property ID", async function () {
      const specialId = "PROP-2024-TEST!@#$%^&*()";

      await expect(
        contract.connect(signers.alice).submitQualityAssessment(
          85, 90, 75, 80, specialId
        )
      ).to.emit(contract, "AssessmentSubmitted");
    });
  });

  describe("Gas Usage", function () {
    beforeEach(async function () {
      await contract.connect(signers.alice).registerAssessor();
      await contract.connect(signers.deployer).certifyAssessor(signers.alice.address);
    });

    it("should use reasonable gas for registration", async function () {
      const tx = await contract.connect(signers.bob).registerAssessor();
      const receipt = await tx.wait();

      expect(receipt!.gasUsed).to.be.lt(500000); // < 500k gas
    });

    it("should use reasonable gas for assessment submission", async function () {
      const tx = await contract.connect(signers.alice).submitQualityAssessment(
        85, 90, 75, 80, "PROP-001"
      );
      const receipt = await tx.wait();

      expect(receipt!.gasUsed).to.be.lt(1000000); // < 1M gas
    });
  });
});
