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

  // Deploy WETH
  const WETH = await deployToken("Wrapped Ether", "WETH");

  // Deploy Token
  const USDC = await deployToken("USD Coin", "USDC");
  const BUSD = await deployToken("Binance USD", "BUSD");

// Deploy "deploy-factory.ts first"
  // Deploy Factory
  const factory = await deployPancakeFactory();

  // Deploy Router
  const router = await deployPancakeRouter(factory, WETH);

  // Run
  const DEADLINE = parseEther("10000000000000000");
  const VALUE = parseEther("1000");
  const VALUE_SWAP = parseEther("50");
  const VALUE_SWAP_MIN = parseEther("45");

  const contractUSDC = Token__factory.connect(USDC, owner) as Token;
  const contractBUSD = Token__factory.connect(BUSD, owner) as Token;
  
  const tx1 = await contractUSDC.mint(owner.address, parseEther("2000"));
  const tx2 = await contractBUSD.mint(owner.address, VALUE);
  tx1.wait();
  tx2.wait();
  // await contractUSDC.approve(router, ethers.constants.MaxUint256);
  // await contractBUSD.approve(router, ethers.constants.MaxUint256);

  await contractUSDC.approve(router, parseEther("2000"));
  await contractBUSD.approve(router, VALUE);

  console.log("Balance USDC", formatEther(await contractUSDC.balanceOf(owner.address)));
  console.log("Balance BUSD", formatEther(await contractBUSD.balanceOf(owner.address)));

  console.log("ADD LP");
  const contractRouter = PancakeRouter__factory.connect(router, owner) as PancakeRouter;
  const txAddLiquidity = await contractRouter.addLiquidity(
    USDC,
    BUSD,
    VALUE,
    VALUE,
    VALUE,
    VALUE,
    owner.address,
    DEADLINE
  );
  const receiptAddLiquidity = await txAddLiquidity.wait();
  // console.log("LP USDC BUSD", receiptAddLiquidity);

  const contractFactory = PancakeFactory__factory.connect(factory, owner) as PancakeFactory;
  const pairUSDC_BUSD = await contractFactory.getPair(USDC, BUSD);
  const contractPairUSDC_BUSD = PancakePair__factory.connect(pairUSDC_BUSD, owner) as PancakePair;

  console.log("Get Pair", pairUSDC_BUSD);
  const lpAmount = await contractPairUSDC_BUSD.balanceOf(owner.address);
  await contractPairUSDC_BUSD.approve(router, ethers.constants.MaxUint256);
  console.log("Balance of LP-USDC-BUSD", formatEther(lpAmount));

  console.log("Balance USDC", formatEther(await contractUSDC.balanceOf(owner.address)));

  console.log("SWAP LP");
  await contractRouter.swapTokensForExactTokens(VALUE_SWAP_MIN, VALUE_SWAP, [USDC, BUSD], owner.address, DEADLINE);
  console.log("Balance USDC", formatEther(await contractUSDC.balanceOf(owner.address)));
  console.log("Balance BUSD", formatEther(await contractBUSD.balanceOf(owner.address)));

  console.log("REMOVE LP");
  await contractRouter.removeLiquidity(
    USDC,
    BUSD,
    lpAmount,
    parseEther("90"),
    parseEther("100"),
    owner.address,
    DEADLINE
  );
  console.log("Balance of LP-USDC-BUSD", formatEther(lpAmount));
  console.log("Balance USDC", formatEther(await contractUSDC.balanceOf(owner.address)));
  console.log("Balance BUSD", formatEther(await contractBUSD.balanceOf(owner.address)));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
