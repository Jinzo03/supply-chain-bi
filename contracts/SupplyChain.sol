// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SupplyChain {
    enum CustodyStage { Supplier, Carrier, Warehouse, Retailer }

    struct Asset {
        uint256 id;
        string name;
        uint256 valueUSD;
        bool isSpoiled;
        CustodyStage currentCustody;
    }

    mapping(uint256 => Asset) public assets;
    
    // --- NEW: Security Layer State Variables ---
    mapping(address => bool) public authorizedOperators;
    address public admin;

    event AssetRegistered(uint256 indexed assetId, string name, uint256 valueUSD);
    event CustodyTransferred(uint256 indexed assetId, CustodyStage newCustody);
    event TelemetryLogged(uint256 indexed assetId, int256 temperature, uint256 timestamp);
    event AssetSpoiled(uint256 indexed assetId, uint256 financialLossUSD, CustodyStage liableParty);

    // --- NEW: Security Modifiers ---
    modifier onlyAuthorized() {
        require(authorizedOperators[msg.sender], "Access Denied: Not an authorized operator");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Access Denied: Admin only");
        _;
    }

    // --- NEW: Constructor ---
    constructor() {
        admin = msg.sender; // The wallet that deploys the contract becomes the admin
        authorizedOperators[msg.sender] = true; // Admin is automatically authorized
    }

    // --- NEW: Access Management Functions ---
    function authorizeOperator(address _operator) public onlyAdmin {
        authorizedOperators[_operator] = true;
    }

    function revokeOperator(address _operator) public onlyAdmin {
        authorizedOperators[_operator] = false;
    }

    // --- UPDATED: Core Functions (Now Protected) ---
    function registerAsset(uint256 _id, string memory _name, uint256 _valueUSD) public onlyAuthorized {
        assets[_id] = Asset(_id, _name, _valueUSD, false, CustodyStage.Supplier);
        emit AssetRegistered(_id, _name, _valueUSD);
    }

    function transferCustody(uint256 _id, CustodyStage _newCustody) public onlyAuthorized {
        Asset storage asset = assets[_id];
        require(!asset.isSpoiled, "Cannot transfer a spoiled asset");
        asset.currentCustody = _newCustody;
        emit CustodyTransferred(_id, _newCustody);
    }

    function logTemperature(uint256 _id, int256 _temperature) public onlyAuthorized {
        Asset storage asset = assets[_id];
        require(!asset.isSpoiled, "Asset already marked as spoiled");

        emit TelemetryLogged(_id, _temperature, block.timestamp);

        if (_temperature > 8) {
            asset.isSpoiled = true;
            emit AssetSpoiled(_id, asset.valueUSD, asset.currentCustody);
        }
    }
}