const SupplyChain = artifacts.require("SupplyChain");

contract("SupplyChain", accounts => {
  let supplyChain;

  before(async () => {
    supplyChain = await SupplyChain.deployed();
  });

  describe("addProduct", () => {
    it("should emit a ProductAdded event", async () => {
      const productName = "Test Product";
      const price = 100;
      const { logs } = await supplyChain.addProduct(productName, price, { from: accounts[0] });
      assert.equal(logs[0].event, "ProductAdded");
      assert.equal(logs[0].args.productId, 1);
      assert.equal(logs[0].args.productName, productName);
      assert.equal(logs[0].args.price, price);
      assert.equal(logs[0].args.farmerAddress, accounts[0]);
    });
  });

  describe("registerFarmer", () => {
    it("should emit a FarmerRegistered event", async () => {
      const farmerName = "Test Farmer";
      const farmerLocation = "Test Location";
      const phone = 1234567890;
      const { logs } = await supplyChain.registerFarmer(farmerName, farmerLocation, phone, { from: accounts[0] });
      assert.equal(logs[0].event, "FarmerRegistered");
      assert.equal(logs[0].args.farmerAddress, accounts[0]);
      assert.equal(logs[0].args.farmerName, farmerName);
      assert.equal(logs[0].args.farmerLocation, farmerLocation);
      assert.equal(logs[0].args.phone, phone);
    });
  });

  describe("registerDistributor", () => {
    it("should emit a DistributorRegistered event", async () => {
      const distributorName = "Test Distributor";
      const distributorLocation = "Test Location";
      const phone = 1234567890;
      const { logs } = await supplyChain.registerDistributor(distributorName, distributorLocation, phone, { from: accounts[0] });
      assert.equal(logs[0].event, "DistributorRegistered");
      assert.equal(logs[0].args.distributorAddress, accounts[0]);
      assert.equal(logs[0].args.distributorName, distributorName);
      assert.equal(logs[0].args.distributorLocation, distributorLocation);
      assert.equal(logs[0].args.phone, phone);
    });
  });

  describe("assignProductToDistributor", () => {
    before(async () => {
      await supplyChain.addProduct("Test Product", 100, { from: accounts[0] });
      await supplyChain.registerFarmer("Test Farmer", "Test Location", 1234567890, { from: accounts[0] });
      await supplyChain.registerDistributor("Test Distributor", "Test Location", 1234567890, { from: accounts[0] });
    });

    it("should assign a product to a distributor", async () => {
      const productId = 1;
      const distributorAddress = accounts[0];
      await supplyChain.assignProductToDistributor(productId, distributorAddress, { from: accounts[0] });
      const status = await supplyChain.getProductStatus(productId, { from: accounts[0] });
      assert.equal(status, 1);
    });

    it("should not allow a non-farmer to assign a product to a distributor", async () => {
      const productId = 1;
      const distributorAddress = accounts[0];
      try {
        await supplyChain.assignProductToDistributor(productId, distributorAddress, { from: accounts[1] });
        assert.fail("Expected revert not received");
        } catch (error) {
            assert.equal(error.reason, "Only the farmer can assign a product to a distributor");
            }
    });

    it("should emit a ProductAssignedToDistributor event", async () => {
      const productId = 1;
      const distributorAddress = accounts[0];
      const { logs } = await supplyChain.assignProductToDistributor(productId, distributorAddress, { from: accounts[0] });
      assert.equal(logs[0].event, "ProductAssignedToDistributor");
      assert.equal(logs[0].args.productId, productId);
      assert.equal(logs[0].args.distributorAddress, distributorAddress);
    }
    );
});




});
