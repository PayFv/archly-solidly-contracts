const hre = require("hardhat");
const { ethers } = hre
const { formatEther, parseEther } = ethers.utils

async function main() {

    const version = 'v0'
    const testers = [
        '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',   //
        '0x8cf6F24dddb965e6636d46129f28050c3357c43b',
        '0x19c447506993343dfc3c2Ce890b3FC4673169ECD'
    ]
    const [owner] = await ethers.getSigners();
    const minter_value = ethers.BigNumber.from('100000000000000000000000000')

    const balance = await ethers.provider.getBalance(owner.address)

    const gasPrice = await ethers.provider.getFeeData()
    console.log(`Balance -> `, formatEther(balance) , `Gas Price -> ` , gasPrice )

    const Token = await ethers.getContractFactory("Token");
    const tokens = [{
        name: 'UST',
        decimals: 6
    }, {
        name: 'MIM',
        decimals: 18
    }, {
        name: 'DAI',
        decimals: 18
    }, {
        name: 'VE',
        decimals: 18
    }, {
        name: 'LR',
        decimals: 18
    }]

    console.log(`|Token Name| Address | Minter | Init Balance |`)
    console.log(`|----------|---------|--------|--------------|`)
    for (const entity of tokens) {
        const { name, decimals } = entity 
        const token = await Token.deploy(`${name}-${version}`, `${name}${version}`, decimals, owner.address)
        await token.deployed()
        const token_addr = token.address
        await token.mint(owner.address, minter_value) 
        console.log(`| ${name}-${version} | [https://goerli.basescan.org/address/${token_addr}](${token_addr})| ${owner.address} | ${minter_value} |`)
    }

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
