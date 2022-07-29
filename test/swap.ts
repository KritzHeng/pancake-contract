import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { PancakeFactory__factory } from "../typechain/factories/PancakeFactory__factory";
import { PancakeRouter__factory } from "../typechain/factories/PancakeRouter__factory";
import { Token__factory } from "../typechain";
import { PancakeRouter } from "../typechain";
import { PancakeFactory } from "../typechain";
import { PancakePair__factory } from "../typechain/factories/PancakePair__factory";
import { PancakePair } from "../typechain";
import { BigNumber } from "ethers";

describe("Swap", function () {
  let owner: SignerWithAddress;
  let wallet1: SignerWithAddress;
  let PancakeFactory: PancakeFactory__factory;
  let pancakeFactory: any;
  let tokenWETH: any;
  let PancakeRouter: PancakeRouter__factory;
  let pancakeRouter: any;
  let tokenUSDC: any;
  let tokenBUSD: any;
  let tokenXC: any;
  beforeEach(async function () {
    [owner, wallet1] = await ethers.getSigners();
    console.log("owner Address:", owner.address);

    PancakeFactory = (await ethers.getContractFactory("PancakeFactory")) as PancakeFactory__factory;
    pancakeFactory = await PancakeFactory.deploy(owner.address);
    await pancakeFactory.deployed();
    console.log("PancakeFactory");
    console.log("pancakeFactory Address:", pancakeFactory.address);
    console.log("feeToSetter address:", await pancakeFactory.feeToSetter());
    console.log("pancakeFactory INIT_CODE_PAIR_HASH:", await pancakeFactory.INIT_CODE_PAIR_HASH());

    console.log("---------------------------------");

    const TokenWETH = (await ethers.getContractFactory("Token")) as Token__factory;
    tokenWETH = await TokenWETH.deploy("Wrapped Ether", "WETH");

    PancakeRouter = (await ethers.getContractFactory("PancakeRouter")) as PancakeRouter__factory;
    pancakeRouter = await PancakeRouter.deploy(pancakeFactory.address, tokenWETH.address);
    await pancakeRouter.deployed();
    
    const TokenBUSD = (await ethers.getContractFactory("Token")) as Token__factory;
    tokenBUSD = await TokenBUSD.deploy("Binance USD", "BUSD");
    await tokenBUSD.connect(owner).mint(owner.address, ethers.utils.parseEther("1000"));
    await tokenBUSD.connect(owner).approve(pancakeRouter.address, ethers.utils.parseEther("1000"));
    console.log("pancakeRouter factory:", await pancakeRouter.factory());
    console.log("pancakeRouter WETH:", await pancakeRouter.WETH());

    describe("AddLiquidity first", function () {
      it("Should ADD WITH tokenA and TokenB PAIR1", async function () {

        const TokenUSDC = (await ethers.getContractFactory("Token")) as Token__factory;
        tokenUSDC = await TokenUSDC.deploy("USD Coin", "USDC");


        await tokenUSDC.connect(owner).mint(owner.address, ethers.utils.parseEther("1000"));
        await tokenUSDC.connect(owner).approve(pancakeRouter.address, ethers.utils.parseEther("1000"));


        const contractRouter = PancakeRouter__factory.connect(pancakeRouter.address, owner) as PancakeRouter;
        const contractFactory = PancakeFactory__factory.connect(pancakeFactory.address, owner) as PancakeFactory;
        await contractRouter.addLiquidity(
          tokenUSDC.address,
          tokenBUSD.address,
          ethers.utils.parseEther("200"),
          ethers.utils.parseEther("200"),
          0,
          0,
          owner.address,
          100000000000
        );

        const getPairAdd = await contractFactory.getPair(tokenUSDC.address, tokenBUSD.address);
        // console.log("getPairAdd1", await contractFactory.getPair(tokenUSDC.address, tokenBUSD.address));
        // console.log("getPairAdd2", getPairAdd);

        // console.log("getAllPairAdd",await contractFactory.allPairs(0));
        expect(await contractFactory.allPairs(0)).to.equal(
          await contractFactory.getPair(tokenUSDC.address, tokenBUSD.address)
        );

        const contractPair = PancakePair__factory.connect(getPairAdd, owner) as PancakePair;
        const opReserves = await contractPair.getReserves();
        console.log(await contractPair.token0(),await contractPair.token1());
        console.log(ethers.utils.formatEther(opReserves._reserve0));
        console.log(ethers.utils.formatEther(opReserves._reserve1));
        console.log(ethers.utils.formatEther(await contractPair.balanceOf(owner.address)));
      });
      it("Should ADD MORE PAIR1", async function () {


        const contractRouter = PancakeRouter__factory.connect(pancakeRouter.address, owner) as PancakeRouter;
        const contractFactory = PancakeFactory__factory.connect(pancakeFactory.address, owner) as PancakeFactory;
        try {
          await contractRouter.addLiquidity(
            tokenUSDC.address,
            tokenBUSD.address,
            ethers.utils.parseEther("200"),
            ethers.utils.parseEther("200"),
            0,
            0,
            owner.address,
            100000000000
          );

          const getPairAdd = await contractFactory.getPair(tokenUSDC.address, tokenBUSD.address);

          expect(await contractFactory.allPairs(0)).to.equal(
            await contractFactory.getPair(tokenUSDC.address, tokenBUSD.address)
          );
          const contractPair = PancakePair__factory.connect(getPairAdd, owner) as PancakePair;
          const opReserves = await contractPair.getReserves();
          console.log(ethers.utils.formatEther(opReserves._reserve0));
          console.log(ethers.utils.formatEther(opReserves._reserve1));
          console.log(ethers.utils.formatEther(await contractPair.balanceOf(owner.address)));
        } catch (UNPREDICTABLE_GAS_LIMIT) {
          console.log("error UNPREDICTABLE_GAS_LIMIT");
        }
      });
      it("Should Swap Token MORE PAIR1", async function () {


        const contractRouter = PancakeRouter__factory.connect(pancakeRouter.address, owner) as PancakeRouter;
        const contractFactory = PancakeFactory__factory.connect(pancakeFactory.address, owner) as PancakeFactory;
        // try {
          await contractRouter.swapExactTokensForTokens(
            ethers.utils.parseEther("200"),
            ethers.utils.parseEther("0"),
            // [0] คือtoken ที่ต้องการswap
            [tokenUSDC.address, tokenBUSD.address],
            owner.address,
            100000000000000,
          );

          const getPairAdd = await contractFactory.getPair(tokenUSDC.address, tokenBUSD.address);

          expect(await contractFactory.allPairs(0)).to.equal(
            await contractFactory.getPair(tokenUSDC.address, tokenBUSD.address)
          );
          const contractPair = PancakePair__factory.connect(getPairAdd, owner) as PancakePair;
          const opReserves = await contractPair.getReserves();
          console.log(ethers.utils.formatEther(opReserves._reserve0));
          console.log(ethers.utils.formatEther(opReserves._reserve1));
          console.log(ethers.utils.formatEther(await contractPair.balanceOf(owner.address)));
        // } catch (UNPREDICTABLE_GAS_LIMIT) {
        //   console.log("error UNPREDICTABLE_GAS_LIMIT");
        // }
      });
    });


  });

  it("Should ", async function () {
    console.log("");
    // const Greeter = await ethers.getContractFactory("Greeter");
    // const greeter = await Greeter.deploy("Hello, world!");
    // await greeter.deployed();
    // expect(await greeter.greet()).to.equal("Hello, world!");
    // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");
    // // wait until the transaction is mined
    // await setGreetingTx.wait();
    // expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
