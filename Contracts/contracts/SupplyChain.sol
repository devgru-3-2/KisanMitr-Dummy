// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    struct Farmer {
        string name;
        string location;
        string crop;
        uint256 quantity;
        uint256 price;
        bool isValue;
    }
    
    struct Distributor {
        string name;
        string location;
        string crop;
        uint256 quantity;
        uint256 price;
        bool isValue;
    }
    
    struct NodalAgency {
        string name;
        string location;
        string crop;
        uint256 quantity;
        uint256 price;
        bool isValue;
    }
    
    struct Product {
        string name;
        uint256 price;
        address farmer;
        address distributor;
        address nodalAgency;
        uint256 quantity;
        string status;
        uint256 date;
        address purchaseRequestDistributor;
        string purchaseRequestZipcode;
        bool isValue;
    }

    mapping (address => Farmer) public farmers;
    mapping (address => Distributor) public distributors;
    mapping (address => NodalAgency) public nodalAgencies;
    mapping (uint256 => Product) public products;
    uint256 public productIndex;
    
    function addFarmer(string memory _name, string memory _location, string memory _crop, uint256 _quantity, uint256 _price) public {
        require(!farmers[msg.sender].isValue, "Farmer already exists.");
        farmers[msg.sender] = Farmer({
            name: _name,
            location: _location,
            crop: _crop,
            quantity: _quantity,
            price: _price,
            isValue: true
        });
    }
    
    function getFarmer() public view returns (string memory, string memory, string memory, uint256, uint256) {
        require(farmers[msg.sender].isValue, "Farmer does not exist.");
        Farmer memory farmer = farmers[msg.sender];
        return (farmer.name, farmer.location, farmer.crop, farmer.quantity, farmer.price);
    }
    
    function addDistributor(string memory _name, string memory _location, string memory _crop, uint256 _quantity, uint256 _price) public {
        require(!distributors[msg.sender].isValue, "Distributor already exists.");
        distributors[msg.sender] = Distributor({
            name: _name,
            location: _location,
            crop: _crop,
            quantity: _quantity,
            price: _price,
            isValue: true
        });
    }
    
    function getDistributor() public view returns (string memory, string memory, string memory, uint256, uint256) {
        require(distributors[msg.sender].isValue, "Distributor does not exist.");
        Distributor memory distributor = distributors[msg.sender];
        return (distributor.name, distributor.location, distributor.crop, distributor.quantity, distributor.price);
    }
    
    function addNodalAgency(string memory _name, string memory _location, string memory _crop, uint256 _quantity, uint256 _price) public {
        require(!nodalAgencies[msg.sender].isValue, "Nodal Agency already exists.");
        nodalAgencies[msg.sender] = NodalAgency({
            name: _name,
            location: _location,
            crop: _crop,
            quantity: _quantity,
            price: _price,
            isValue: true
        });
    }
    
    function getNodalAgency() public view returns (string memory, string memory, string memory, uint256, uint256) {
        require(nodalAgencies[msg.sender].isValue, "Nodal Agency does not exist.");
        NodalAgency memory nodalAgency = nodalAgencies[msg.sender];
        return (nodalAgency.name, nodalAgency.location, nodalAgency.crop, nodalAgency.quantity, nodalAgency.price);
    }

    function addProduct(string memory _name, uint256 _price, uint256 _quantity, string memory _status, address _distributor, string memory _purchaseRequestZipcode) public {
    require(farmers[msg.sender].isValue, "Farmer does not exist.");
    require(distributors[_distributor].isValue, "Distributor does not exist.");
    farmers[msg.sender].quantity -= _quantity;
    productIndex++;
    products[productIndex] = Product({
        name: _name,
        price: _price,
        farmer: msg.sender,
        distributor: _distributor,
        nodalAgency: address(0),
        quantity: _quantity,
        status: _status,
        date: block.timestamp,
        purchaseRequestDistributor: address(0),
        purchaseRequestZipcode: _purchaseRequestZipcode,
        isValue: true
    });
}

function getProduct(uint256 _productIndex) public view returns (string memory, uint256, address, address, address, uint256, string memory, uint256, address, string memory) {
    require(products[_productIndex].isValue, "Product does not exist.");
    Product memory product = products[_productIndex];
    return (product.name, product.price, product.farmer, product.distributor, product.nodalAgency, product.quantity, product.status, product.date, product.purchaseRequestDistributor, product.purchaseRequestZipcode);
}

function updateProductStatus(uint256 _productIndex, string memory _status) public {
    require(products[_productIndex].isValue, "Product does not exist.");
    require(msg.sender == products[_productIndex].farmer || msg.sender == products[_productIndex].distributor || msg.sender == products[_productIndex].nodalAgency, "You are not authorized to update the status of this product.");
    products[_productIndex].status = _status;
}

function updateProductQuantity(uint256 _productIndex, uint256 _quantity) public {
    require(products[_productIndex].isValue, "Product does not exist.");
    require(msg.sender == products[_productIndex].farmer, "You are not authorized to update the quantity of this product.");
    products[_productIndex].quantity = _quantity;
}

function purchaseRequest(uint256 _productIndex) public {
    require(products[_productIndex].isValue, "Product does not exist.");
    require(distributors[msg.sender].isValue, "Distributor does not exist.");
    require(products[_productIndex].purchaseRequestDistributor == address(0), "Purchase request already made.");
    products[_productIndex].purchaseRequestDistributor = msg.sender;
}

function approvePurchaseRequest(uint256 _productIndex, address _distributor) public {
    require(products[_productIndex].isValue, "Product does not exist.");
    require(msg.sender == products[_productIndex].farmer || msg.sender == products[_productIndex].nodalAgency, "You are not authorized to approve the purchase request for this product.");
    require(distributors[_distributor].isValue, "Distributor does not exist.");
    require(products[_productIndex].purchaseRequestDistributor == _distributor, "Invalid purchase request.");
    products[_productIndex].nodalAgency = msg.sender;
}

}
