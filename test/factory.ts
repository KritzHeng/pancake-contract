import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Factory", function () {

    let owner: SignerWithAddress;
    let wallet1: SignerWithAddress;
    let pancakeFactory: any;
    beforeEach(async function() {
        [owner, wallet1] = await ethers.getSigners();
        console.log("owner Address:", owner.address);

        
        const PancakeFactory = await ethers.getContractFactory("PancakeFactory");
        pancakeFactory = await PancakeFactory.deploy(owner.address);
        await pancakeFactory.deployed();

        console.log("pancakeFactory Address:", pancakeFactory.address);
        console.log("feeToSetter address:", await pancakeFactory.feeToSetter());

    })
  it("Should return the new greeting once it's changed", async function () {

    expect(await pancakeFactory.feeToSetter()).to.equal(owner.address);

    // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
