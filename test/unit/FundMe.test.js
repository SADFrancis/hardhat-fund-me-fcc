const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    :describe("FundMe", async function () {
        let fundMe;
        let deployer;
        let mockV3Aggregator;
        const sendValue = ethers.utils.parseEther("1");
        beforeEach(async function () {
        //deploy fundMe contract 
            
            // const accounts = await ethers.getSigners() //from the private keys in hardhat config
            // const account = account[0]
            
            //const { deployer } = await getNamedAccounts();
            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture(["all"]); //runs scripts in deploy folder with the tag you set 
            fundMe = await ethers.getContract("FundMe", deployer);
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
        });

        describe("constructor", async function () {
            it("00 sets the aggregator addresses correctly", async function () {
                const response = await fundMe.getPriceFeed();
                assert(response, mockV3Aggregator.address);
            });
        });

        describe("fund", async function () {
            it("01 should fail if you don't send enough ETH", async function () {
                await expect(fundMe.fund()).to.be.revertedWith("Don't be cheap");
            });
            it("02 updated the amount funded data structure", async function () {
                await fundMe.fund({ value: sendValue });
                const response = await fundMe.getAddressToAmountFunded(deployer);
                assert.equal(response.toString(), sendValue.toString());
            });
            it("03 Add funder to array of funders", async function () {
                await fundMe.fund({ value: sendValue });
                const funder = await fundMe.getFunder(0);
                assert.equal(funder, deployer);
            });
        });

        describe("Withdraw", async function () {

            beforeEach(async function () {
                await fundMe.fund({ value: sendValue });
            });
            it("04 withdraw ETH from a single founder", async function () {
                //Arrange
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

                //Act
                const transactionResponse = await fundMe.withdraw();
                const transactionReceipt = await transactionResponse.wait(1);
                const { gasUsed, effectiveGasPrice } = transactionReceipt;
                const gasCost = gasUsed.mul(effectiveGasPrice);

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer);
                
                //Assert
                assert.equal(endingFundMeBalance, 0);
                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString());
            });

            it("05 allows us to withdraw with multiple founders", async function () {
                // Arrange
                const accounts = await ethers.getSigners();
                for (let i = 1; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                    await fundMeConnectedContract.fund({ value: sendValue });
                }
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

                // Act
                const transactionResponse = await fundMe.withdraw();
                const transactionReceipt = await transactionResponse.wait(1);
                const { gasUsed, effectiveGasPrice } = transactionReceipt;
                const gasCost = gasUsed.mul(effectiveGasPrice);

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer);


                //Assert
                assert.equal(endingFundMeBalance, 0);
                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString());

                // Make sure funders data structure is reset properly
                await expect(fundMe.getFunder(0)).to.be.reverted;
                for (i = 1; i < 6; i++) {
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address),0);
                };
            });
            
            it("06 Only allows the owner to withdraw", async function () {
                const accounts = await ethers.getSigners();
                const attacker = accounts[1];
                const attackerConnectedContract = await fundMe.connect(attacker);
                await expect(attackerConnectedContract.withdraw()).to.be.revertedWithCustomError(fundMe, 'FundMe__NotOwner');
            });
            it("07 withdraw ETH from a single founder BUT CHEAPER", async function () {
                //Arrange
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

                //Act
                const transactionResponse = await fundMe.cheaperWithdraw();
                const transactionReceipt = await transactionResponse.wait(1);
                const { gasUsed, effectiveGasPrice } = transactionReceipt;
                const gasCost = gasUsed.mul(effectiveGasPrice);

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer);
                
                //Assert
                assert.equal(endingFundMeBalance, 0);
                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString());
            });

            it("08 allows us to withdraw with multiple founders BUT CHEAPER", async function () {
                // Arrange
                const accounts = await ethers.getSigners();
                for (let i = 1; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                    await fundMeConnectedContract.fund({ value: sendValue });
                }
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

                // Act
                const transactionResponse = await fundMe.cheaperWithdraw();
                const transactionReceipt = await transactionResponse.wait(1);
                const { gasUsed, effectiveGasPrice } = transactionReceipt;
                const gasCost = gasUsed.mul(effectiveGasPrice);

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer);


                //Assert
                assert.equal(endingFundMeBalance, 0);
                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString());

                // Make sure funders data structure is reset properly
                await expect(fundMe.getFunder(0)).to.be.reverted;
                for (i = 1; i < 6; i++) {
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address),0);
                };
            });        
        });


        
    });