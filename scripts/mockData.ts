import { network } from "hardhat";

async function main() {
  console.log("Connecting to network and fetching contract...");
  const { ethers } = await network.create();

  
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

  // 2. Attach to the deployed contract
  const supplyChain = await ethers.getContractAt("SupplyChain", CONTRACT_ADDRESS);

  console.log("\n--- STEP 1: Registering High-Value Assets ---");
  
  // Asset ID, Name, Value in USD
  console.log("Registering Asset 1: Covid Vaccines ($150,000)...");
  await (await supplyChain.registerAsset(1, "Covid Vaccines", 150000)).wait();

  console.log("Registering Asset 2: Fresh Salmon ($25,000)...");
  await (await supplyChain.registerAsset(2, "Fresh Salmon", 25000)).wait();

  console.log("Registering Asset 3: Luxury Wine ($80,000)...");
  await (await supplyChain.registerAsset(3, "Luxury Wine", 80000)).wait();


  console.log("\n--- STEP 2: Simulating IoT Sensor Telemetry ---");

  // Asset 1: Stays perfectly cold (Safe)
  console.log("Asset 1 (Vaccines): Logging normal temperatures (4°C, 3°C)...");
  await (await supplyChain.logTemperature(1, 4)).wait();
  await (await supplyChain.logTemperature(1, 3)).wait();

  // Asset 2: Temperature spike! (Spoiled -> $25,000 financial loss)
  console.log("Asset 2 (Salmon): Temperature spike detected (5°C -> 12°C!)");
  await (await supplyChain.logTemperature(2, 5)).wait();
  await (await supplyChain.logTemperature(2, 12)).wait(); // Triggers Spoiled event

  // Asset 3: Major breakdown! (Spoiled -> $80,000 financial loss)
  console.log("Asset 3 (Wine): Temperature spike detected (6°C -> 19°C!)");
  await (await supplyChain.logTemperature(3, 6)).wait();
  await (await supplyChain.logTemperature(3, 19)).wait(); // Triggers Spoiled event

  console.log("\nMock supply chain data successfully written to the blockchain!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});