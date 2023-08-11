const hre = require("hardhat");
const { ethers } = hre
const { formatEther, parseEther } = ethers.utils

async function main() {

    const version = 'v0'
    const [owner] = await ethers.getSigners();
    const lr_addr = `0x612C71e866Bd096DB0691F9c587DFF509CACEd24`
    const ust_addr = '0x198d63F6D1ADF77FdE5c9490b9dE366679be0561'
    const mim_addr = `0x8c0432Cf6F96A064535a0d247D101a423fAF99d3`
    const dai_addr = '0x3d42C1D617AF50a97D1eF2DA0A8250E8aB2d0589'

    console.log(`|Token Name| Address | `)
    console.log(`|----------|---------|`)

    const veArtProxy = await ethers.getContractFactory("VeArtProxy")
    const artProxy = await veArtProxy.deploy()
    await artProxy.deployed()

    const art_proxy_addr = artProxy.address

    const vecontract = await ethers.getContractFactory("contracts/ve.sol:ve");
    const ve = await vecontract.deploy( lr_addr , art_proxy_addr);
    await ve.deployed()

    console.log(`| art-proxy | [https://goerli.basescan.org/address/${art_proxy_addr}](${art_proxy_addr})|`)
    console.log(`| VE | [https://goerli.basescan.org/address/${ve.address}](${ve.address})| `)

    const BaseV1Factory = await ethers.getContractFactory("BaseV1Factory");
    const factory = await BaseV1Factory.deploy();
    await factory.deployed();
    console.log(`| BaseV1Factory | [https://goerli.basescan.org/address/${factory.address}](${factory.address})| `)

    const BaseV1Router01 = await ethers.getContractFactory("BaseV1Router01");
    const router01 = await BaseV1Router01.deploy(factory.address, owner.address);
    await router01.deployed();
    console.log(`| BaseV1Router01 | [https://goerli.basescan.org/address/${router01.address}](${router01.address})| `)

    const BaseV1Router02 = await ethers.getContractFactory("BaseV1Router02");
    const router02 = await BaseV1Router02.deploy(factory.address, owner.address);
    await router02.deployed();
    console.log(`| BaseV1Router02 | [https://goerli.basescan.org/address/${router02.address}](${router02.address})| `)  

    const BaseV1GaugeFactory = await ethers.getContractFactory("BaseV1GaugeFactory");
    const gauges_factory = await BaseV1GaugeFactory.deploy();
    await gauges_factory.deployed();
    console.log(`| BaseV1GaugeFactory | [https://goerli.basescan.org/address/${gauges_factory.address}](${gauges_factory.address})| `)  

    const BaseV1BribeFactory = await ethers.getContractFactory("BaseV1BribeFactory");
    const bribe_factory = await BaseV1BribeFactory.deploy();
    await bribe_factory.deployed();
    console.log(`| BaseV1BribeFactory | [https://goerli.basescan.org/address/${bribe_factory.address}](${bribe_factory.address})| `)  

    // voter
    const BaseV1Voter = await ethers.getContractFactory("BaseV1Voter");
    const gauge_factory = await BaseV1Voter.deploy(ve.address, factory.address, gauges_factory.address, bribe_factory.address);
    await gauge_factory.deployed();
    console.log(`| BaseV1Voter | [https://goerli.basescan.org/address/${gauge_factory.address}](${gauge_factory.address})| `)  

    await ve.setVoter(gauge_factory.address);

    const VeDist = await ethers.getContractFactory("contracts/ve_dist.sol:ve_dist");
    const ve_dist = await VeDist.deploy(ve.address);
    await ve_dist.deployed();
    console.log(`| VeDist | [https://goerli.basescan.org/address/${ve_dist.address}](${ve_dist.address})| `)  

    // minter
    const BaseV1Minter = await ethers.getContractFactory("BaseV1Minter");
    const minter = await BaseV1Minter.deploy(gauge_factory.address, ve.address, ve_dist.address);
    await minter.deployed();
    console.log(`| BaseV1Minter | [https://goerli.basescan.org/address/${minter.address}](${minter.address})| `)  
    await ve_dist.setDepositor(minter.address);
    // await gauge_factory.initialize([ust.address, mim.address, dai.address, ve_underlying.address],minter.address);
    await gauge_factory.initialize([ ust_addr , mim_addr, dai_addr , lr_addr ],minter.address);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
