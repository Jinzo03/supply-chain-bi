import { network } from "hardhat";

async function main(){
    const { ethers} = await network.create();

    const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
    const supplyChain = await ethers.getContractAt("SupplyChain", CONTRACT_ADDRESS);

    console.log("Simulating sudden compressor failure for Asset #1 (Covid Vaccines)...");
    console.log("Logging temperature spike: 15°C...");
  
    // This breaches the 8°C threshold, triggering both TelemetryLogged and AssetSpoiled events
    const tx = await supplyChain.logTemperature(1, 15);
    await tx.wait();

console.log(" Incident logged to the blockchain! Look at your dashboard right now.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });