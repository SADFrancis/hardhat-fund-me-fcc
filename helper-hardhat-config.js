//https://docs.chain.link/docs/ethereum-addresses/

const networkConfig = {
    5: {
        name: "goerli",
        ethUSDPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
    80001: {
        name: "polygon-mumbai-testnet",
        ethUSDPriceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
    },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 2000*10**8;

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER
};