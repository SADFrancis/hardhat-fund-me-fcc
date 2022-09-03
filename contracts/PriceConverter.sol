//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(AggregatorV3Interface priceFeed) internal view returns(uint){
        // Goerli ETH/USD address
        // 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        //AggregatorV3Interface priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData(); // returns 8 decimals
        return uint(price * 1e10); // convert to Wei

    }

    function getDecimals(AggregatorV3Interface priceFeed) internal view returns (uint8){
        //AggregatorV3Interface priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
        return priceFeed.decimals(); //gives us 8 decimals
    }

    function getConversionRate(uint256 _ethAmount,AggregatorV3Interface priceFeed) internal view returns(uint256){
        // Only accepts whole numbers
        // https://eth-converter.com/
        // will have to calculate to wei from here
 
        uint256 ethPrice = getPrice(priceFeed); //ETH in USD * 10^18
        uint256 ethAmountinUSD = (ethPrice*_ethAmount) /1e18; // convert back from Wei to readable USD
        return ethAmountinUSD;
    }    
}