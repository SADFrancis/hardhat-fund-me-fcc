const { network } = require("hardhat");
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        log(`Local Development chain detected, deploying to chain :: ${network.name}\ndeploying Mocks...`);        
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER], // constructor for MockV3 contract
        });
        log("Mocks deployed.");
        log("--------------------------------------------------------------------");
    }
    else {
        log(`Mocks are unnecessary due to deploying to non local chain :: ${network.name}`)
    }
};

module.exports.tags = ["all", "mocks"];