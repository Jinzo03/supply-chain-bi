import { network } from "hardhat";

async function main() {
  console.log("Deploying SupplyChain contract...");

  // 1. Hardhat 3 requires us to create a network connection first to access ethers
  const { ethers } = await network.create();

  // 2. Fetch the compiled contract factory and deploy
  const supplyChain = await ethers.deployContract("SupplyChain");

  // 3. Wait for the deployment transaction to be mined
  await supplyChain.waitForDeployment();

  // 4. Print the deployed address
  console.log(`SupplyChain successfully deployed to: ${supplyChain.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});