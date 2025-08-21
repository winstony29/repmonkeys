import { ethers } from "hardhat";

async function main() {
  const WellToken = await ethers.getContractFactory("WellToken");
  const wellToken = await WellToken.deploy();
  await wellToken.waitForDeployment();

  const address = await wellToken.getAddress();
  console.log("WellToken deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});