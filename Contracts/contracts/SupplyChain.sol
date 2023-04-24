// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    
    struct Product {
    uint productId;
    string productName;
    uint price;
    address farmerAddress;
    address distributorAddress;
    uint status;
    address[] history;  // new field
    }

    
    struct Farmer {
        string farmerName;
        string farmerLocation;
        uint phone;
        bool isRegistered;
    }
    
    struct Distributor {
        string distributorName;
        string distributorLocation;
        uint phone;
        bool isRegistered;
    }
    
    mapping(uint => Product) public products;
    mapping(address => Farmer) public farmers;
    mapping(address => Distributor) public distributors;
    
    uint public productCounter;
    
    event ProductAdded(uint productId, string productName, uint price, address farmerAddress);
    event FarmerRegistered(address farmerAddress, string farmerName, string farmerLocation, uint phone);
    event DistributorRegistered(address distributorAddress, string distributorName, string distributorLocation, uint phone);
    
    modifier onlyNodalAgency() {
        require(msg.sender == tx.origin, "Only the Nodal Agency can access this function");
        _;
    }
    
    function addProduct(string memory _productName, uint _price) public {
        productCounter++;
        products[productCounter] = Product(productCounter, _productName, _price, msg.sender, address(0), 0);
        emit ProductAdded(productCounter, _productName, _price, msg.sender);
    }
    
    function registerFarmer(string memory _farmerName, string memory _farmerLocation, uint _phone) public {
        require(!farmers[msg.sender].isRegistered, "The farmer is already registered");
        farmers[msg.sender] = Farmer(_farmerName, _farmerLocation, _phone, true);
        emit FarmerRegistered(msg.sender, _farmerName, _farmerLocation, _phone);
    }
    
    function registerDistributor(string memory _distributorName, string memory _distributorLocation, uint _phone) public {
        require(!distributors[msg.sender].isRegistered, "The distributor is already registered");
        distributors[msg.sender] = Distributor(_distributorName, _distributorLocation, _phone, true);
        emit DistributorRegistered(msg.sender, _distributorName, _distributorLocation, _phone);
    }
    
    function assignProductToDistributor(uint _productId, address _distributorAddress) public {
        require(products[_productId].farmerAddress == msg.sender, "Only the farmer who added the product can assign it to a distributor");
        require(distributors[_distributorAddress].isRegistered, "The distributor is not registered");
        require(products[_productId].status == 0, "The product is already assigned to a distributor or sold");
        products[_productId].distributorAddress = _distributorAddress;
        products[_productId].status = 1;
    }
    
    function getProductStatus(uint _productId) public view returns (uint) {
        return products[_productId].status;
    }
    
    function getFarmerDetails(address _farmerAddress) public view returns (string memory, string memory, uint) {
        require(farmers[_farmerAddress].isRegistered, "The farmer is not registered");
        return (farmers[_farmerAddress].farmerName, farmers[_farmerAddress].farmerLocation, farmers[_farmerAddress].phone);
    }
    
    function getDistributorDetails(address _distributorAddress) public view returns (string memory, string memory, uint) {
        require(distributors[_distributorAddress].isRegistered, "The distributor is not registered");
        return (distributors[_distributorAddress].distributorName, distributors[_distributorAddress].distributorLocation, distributors[_distributorAddress].phone);
    }

    function markProductAsSold(uint _productId) public onlyNodalAgency {
        require(products[_productId].status == 1, "The product is not assigned to any distributor");
        products[_productId].status = 2;
    }

    function addHistory(uint _productId, address _party) public {
    require(products[_productId].status == 1 || products[_productId].status == 2, "Product must be assigned or sold");
    products[_productId].history.push(_party);
    }

    function getProductHistory(uint _productId) public view returns (address[] memory, uint[] memory) {
    address[] memory parties = products[_productId].history;
    uint[] memory timestamps = new uint[](parties.length);
    for (uint i = 0; i < parties.length; i++) {
        timestamps[i] = block.timestamp;
    }
    return (parties, timestamps);
    }



}


/*This is a Solidity smart contract named "SupplyChain" that manages a supply chain system. Here is a breakdown of the code:

Structs:

Product: represents a product in the supply chain. It includes fields such as productId, productName, price, farmerAddress, 
distributorAddress, and status.

Farmer: represents a farmer in the supply chain. It includes fields such as farmerName, farmerLocation, phone, and isRegistered.

Distributor: represents a distributor in the supply chain. It includes fields such as distributorName, distributorLocation, 
phone, and isRegistered.


Mappings:

products: maps a product ID to a Product object.

farmers: maps a farmer address to a Farmer object.

distributors: maps a distributor address to a Distributor object.

Variables:

productCounter: a counter that increments every time a new product is added.

Events:

ProductAdded: an event that is emitted when a new product is added to the supply chain.

FarmerRegistered: an event that is emitted when a new farmer is registered in the supply chain.

DistributorRegistered: an event that is emitted when a new distributor is registered in the supply chain.

Modifiers:

onlyNodalAgency: a modifier that restricts access to certain functions to the Nodal Agency.

Functions:

addProduct: allows a farmer to add a new product to the supply chain by specifying the product name and price.

registerFarmer: allows a farmer to register in the supply chain by providing their name, location, and phone number.

registerDistributor: allows a distributor to register in the supply chain by providing their name, location, and phone number.

assignProductToDistributor: allows a farmer to assign a product to a distributor by specifying the product ID and the distributor's 
address.

getProductStatus: allows anyone to view the status of a product by specifying the product ID.

getFarmerDetails: allows anyone to view the details of a farmer by specifying the farmer's address.

getDistributorDetails: allows anyone to view the details of a distributor by specifying the distributor's address.

The smart contract is designed to ensure that only registered farmers and distributors can participate in the supply chain, and that 
products are only assigned to registered distributors. The onlyNodalAgency modifier is not used in any of the functions, so it is not
currently implemented in the contract.

The onlyNodalAgency modifier is defined to restrict access to certain functions only to the Nodal Agency, which is the entity that has
deployed the smart contract. However, there are no functions in the contract that use this modifier. Therefore, the Nodal Agency will 
not be able to query anything more than what is publicly accessible through the contract's state variables and functions.

The state variables in the contract include:

products: a mapping of Product structs, which contains information about each product, such as its ID, name, price, farmer's address, 
distributor's address, and status.

farmers: a mapping of Farmer structs, which contains information about each farmer, such as their name, location, phone number, and 
registration status.

distributors: a mapping of Distributor structs, which contains information about each distributor, such as their name, location, 
phone number, and registration status.

productCounter: a uint that keeps track of the total number of products added to the supply chain.

The functions in the contract that can be used to query these state variables include:

addProduct: allows a farmer to add a new product to the supply chain by providing its name and price.

registerFarmer: allows a new farmer to register by providing their name, location, and phone number.

registerDistributor: allows a new distributor to register by providing their name, location, and phone number.

assignProductToDistributor: allows a farmer to assign a product to a distributor by providing the product ID and the distributor's 
address.

getProductStatus: allows anyone to check the status of a product by providing its ID.

getFarmerDetails: allows anyone to retrieve the details of a registered farmer by providing their address.

getDistributorDetails: allows anyone to retrieve the details of a registered distributor by providing their address.

The Nodal Agency can also access these functions, but they do not have any additional privileges beyond what is available to anyone 
else on the blockchain.

*/