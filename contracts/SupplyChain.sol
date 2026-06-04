// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {
    // 1. Define what an Asset looks like
    struct Asset {
        uint256 id;
        string name;
        uint256 valueUSD; // Crucial for our Financial Analysis
        bool isSpoiled;
    }

    // 2. Store assets in a mapping (like a dictionary)
    mapping(uint256 => Asset) public assets;

    // 3. Define an Event. 
    // This is the MOST important part for BI. Events are logged on the blockchain 
    // and our Next.js frontend will listen for them to build the Chart.js graphs.
    event TelemetryLogged(uint256 indexed assetId, int256 temperature, uint256 timestamp);
    event AssetSpoiled(uint256 indexed assetId, uint256 lossValueUSD);

    // 4. Function to create a new shipment
    function registerAsset(uint256 _id, string memory _name, uint256 _valueUSD) public {
        assets[_id] = Asset(_id, _name, _valueUSD, false);
    }

    // 5. Function for IoT sensors to log temperature
    function logTemperature(uint256 _id, int256 _temperature) public {
        // Emit the standard reading for our charts
        emit TelemetryLogged(_id, _temperature, block.timestamp);

        // Financial Logic: If temp goes above 8 degrees Celsius, it's ruined!
        if (_temperature > 8 && !assets[_id].isSpoiled) {
            assets[_id].isSpoiled = true;
            // Emit a specific event for financial loss tracking
            emit AssetSpoiled(_id, assets[_id].valueUSD);
        }
    }
}