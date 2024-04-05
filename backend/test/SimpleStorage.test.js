// Import the ethers library from Hardhat
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleStorage", function () {
  let simpleStorage;
  let owner;

  beforeEach(async function () {
    // Deploy the contract before each test
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await SimpleStorage.deploy();

    [owner] = await ethers.getSigners();
  });

  describe("store", function () {
    it("Should update storedNumber and emit NumberChanged event", async function () {
      const oldValue = await simpleStorage.retrieve();
      const newValue = 42;

      // Expect the transaction to emit an event with the old and new values
      await expect(simpleStorage.store(newValue))
        .to.emit(simpleStorage, "NumberChanged")
        .withArgs(oldValue, newValue);

      // Verify the stored number has been updated
      expect(await simpleStorage.retrieve()).to.equal(newValue);
    });
  });

  describe("retrieve", function () {
    it("Should return the default value", async function () {
      // By default, storedNumber should be 0
      expect(await simpleStorage.retrieve()).to.equal(0);
    });

    it("Should return the new value after it's updated", async function () {
      const newValue = 100;
      await simpleStorage.store(newValue);
      expect(await simpleStorage.retrieve()).to.equal(newValue);
    });
  });
});