import { expect } from "chai";
import { ethers } from "hardhat";

describe("BloodBank", function () {
  let bloodBankContract: any;
  let owner: any;
  let bloodBankAddress: any;
  let hospitalAddress: any;
  let unauthorizedAddress: any;

  beforeEach(async function () {
    [owner, bloodBankAddress, hospitalAddress, unauthorizedAddress] = await ethers.getSigners();
    const BloodBank = await ethers.getContractFactory("BloodBank");
    bloodBankContract = await BloodBank.deploy();
    await bloodBankContract.connect(owner).addBloodBank(bloodBankAddress.address);
    await bloodBankContract.connect(owner).addHospital(hospitalAddress.address);
  });

  describe("Role Management", function () {
    it("Should set the deployer as the admin", async function () {
      expect(await bloodBankContract.admin()).to.equal(owner.address);
    });

    it("Should allow the admin to add a new blood bank", async function () {
      expect(await bloodBankContract.isBloodBank(bloodBankAddress.address)).to.be.true;
    });

    it("Should NOT allow a non-admin to add a new blood bank", async function () {
      await expect(
        bloodBankContract.connect(unauthorizedAddress).addBloodBank(hospitalAddress.address)
      ).to.be.revertedWith("Only the admin can perform this action");
    });
  });

  describe("Blood Bank Functionality", function () {
    it("Should allow an authorized blood bank to record a new blood unit", async function () {
      await bloodBankContract.connect(bloodBankAddress).recordNewBloodUnit("Aman Kumar", 0);
      const newUnit = await bloodBankContract.bloodUnits(0);
      expect(newUnit.donorName).to.equal("Aman Kumar");
    });

    it("Should NOT allow an unauthorized address to record a new blood unit", async function () {
      await expect(
        bloodBankContract.connect(unauthorizedAddress).recordNewBloodUnit("Random Donor", 1)
      ).to.be.revertedWith("Only an authorized blood bank can perform this action");
    });
  });

  // --- NEW TESTS FOR HOSPITAL WORKFLOW ---
  describe("Full Workflow: Request and Transfer", function () {
    it("Should allow a hospital to request a unit and a blood bank to approve it", async function () {
      // 1. Blood bank adds a new unit
      await bloodBankContract.connect(bloodBankAddress).recordNewBloodUnit("Test Donor", 2); // B_Positive
      const unitId = 0;

      // 2. Hospital requests the unit
      await bloodBankContract.connect(hospitalAddress).requestUnit(unitId);
      let unit = await bloodBankContract.bloodUnits(unitId);
      expect(unit.requestedBy).to.equal(hospitalAddress.address);

      // 3. Blood bank approves the transfer
      await bloodBankContract.connect(bloodBankAddress).approveTransfer(unitId, hospitalAddress.address);
      unit = await bloodBankContract.bloodUnits(unitId);
      
      // Verify the final state
      expect(unit.currentOwner).to.equal(hospitalAddress.address);
      expect(unit.status).to.equal(2); // 2 corresponds to UnitStatus.In_Transit
      expect(unit.requestedBy).to.equal("0x0000000000000000000000000000000000000000"); // Request should be cleared
    });

    it("Should NOT allow a blood bank to approve a transfer to a hospital that didn't request it", async function() {
        await bloodBankContract.connect(bloodBankAddress).recordNewBloodUnit("Test Donor", 3);
        const unitId = 0;
        
        // Note: The hospital never makes a request in this test.
        
        await expect(
            bloodBankContract.connect(bloodBankAddress).approveTransfer(unitId, hospitalAddress.address)
        ).to.be.revertedWith("This hospital did not request the unit");
    });
  });
});