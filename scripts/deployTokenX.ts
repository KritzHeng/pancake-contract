import { PancakePair } from "./../typechain/PancakePair.d";
import { PancakePair__factory } from "./../typechain/factories/PancakePair__factory";
import { PancakeRouter__factory } from "./../typechain/factories/PancakeRouter__factory";
import { PancakeRouter } from "./../typechain/PancakeRouter.d";
import { PancakeFactory__factory } from "./../typechain/factories/PancakeFactory__factory";
import hre from "hardhat";
import { ethers } from "ethers";

import { Token__factory } from "./../typechain/factories/Token__factory";
import { deployPancakeFactory } from "./deploy/deploy-pancake-factory";
import { deployPancakeRouter } from "./deploy/deploy-pancake-router";
import { deployToken } from "./deploy/deploy-token";
import { PancakeFactory, Token } from "../typechain";

const { formatEther, parseEther } = ethers.utils;

async function main() {
  const [owner] = await hre.ethers.getSigners();


  const XC = await deployToken("X Coin", "XC");

  const contractXc = Token__factory.connect(XC, owner) as Token;


  await contractXc.mint(owner.address, parseEther("2000"));

//   await contractXc.approve(router, parseEther("2000"));



}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
