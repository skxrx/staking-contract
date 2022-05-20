import { ethers } from "hardhat"
import {
  stakingTokenContractAddress,
  rewardTokenContractAddress
} from "../stake-config"

async function main() {
  const StakingContract = await ethers.getContractFactory("Staking")
  const staking = await StakingContract.deploy(
    stakingTokenContractAddress,
    rewardTokenContractAddress
  )

  await staking.deployed()

  console.log("Staking contract deployed to:", staking.address)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
