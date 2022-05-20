import "@nomiclabs/hardhat-waffle"
import { task } from "hardhat/config"
import { stakingContractAddress } from "../stake-config"

task("stake", "transfer approved tokens to stake")
  .addOptionalParam("amount", "amount of token to stake. Approve amont before")
  .setAction(async (taskArgs, hre) => {
    const Staking = await hre.ethers.getContractAt(
      "Staking",
      stakingContractAddress
    )
    const tx = await Staking.stake(taskArgs.amount)
    await tx.wait()
    console.log(`${taskArgs.amount} staked`)
  })
