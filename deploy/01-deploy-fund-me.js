// style 1
// function deployFunc(hre) {
//     const getNamedAccounts = hre.getNamedAccounts();
//     const deployments = hre.deployments;
// };

// module.exports.default = deployFunc;

// style 2
// module.exports = async (hre) => {
//     const { getNamedAccounts, deployments } = hre;
// }

// style 3

// Next two lines are equivalent to Line 20
// const helperConfig = require("../helper-hardhat-config"):
// const networkConfig = helperConfig.networkConfig;

const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUSDPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUSDPriceFeedAddress = ethUsdAggregator.address;
    }
    else {
        ethUSDPriceFeedAddress= networkConfig[chainId]["ethUSDPriceFeed"];
    };
    
    const args = [ethUSDPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //pricefeed address per chain
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        // verifying on etherscan
        await verify(fundMe.address, args);
    };

    log("--------------------------------------------------------------------");

}
// hardhat deploy --network network --tags fundme to specifically deploy fundme
module.exports.tags = ["all","fundme"];