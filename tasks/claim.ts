import "@nomiclabs/hardhat-waffle"
import { task } from "hardhat/config"
import { stakingContractAddress } from "../stake-config"

task("claim", "claim reward").setAction(async hre => {
  const Staking = await hre.ethers.getContractAt(
    "Staking",
    stakingContractAddress
  )
  const tx = await Staking.claim()
  await tx.wait()
  console.log("Reward claimed")
})
