import { expect } from "chai"
import { ethers } from "hardhat"
const hre = require("hardhat")
import "@nomiclabs/hardhat-ethers"
import IUniswapV2Pair from "../abi/pair_abi.json"
import IUniswapV2Router02 from "../abi/router02_abi.json"
import ERC20Token from "../abi/erc20_abi.json"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { Contract } from "ethers"
import config from "../testcfg"

describe("Staking", () => {
  let staking: Contract
  let owner: SignerWithAddress
  let stakeAmount: number

  before(async () => {
    const Staking = await ethers.getContractFactory("Staking")
    staking = await Staking.deploy(
      config.TOKEN0_ADDRESS,
      config.LIQUIDITY_TOKEN_ADDRESS
    )
    await staking.deployed()
    ;[owner] = await ethers.getSigners()
  })

  it("stakeTokenAddress: should be able to get the stake token address.", async () => {
    expect(await staking.stakingToken()).to.equal(
      config.LIQUIDITY_TOKEN_ADDRESS
    )
  })

  it("rewardTokenAddress: should be able to get the reward token address.", async () => {
    expect(await staking.rewardToken()).to.equal(config.TOKEN0_ADDRESS)
  })

  it("rewardRate: should be able to get the reward percentage.", async () => {
    expect(await staking.rewardRate()).to.equal(config.REWARD_PERCENTAGE)
  })

  it("rewardTime: should be able to get the reward interval.", async () => {
    expect(await staking.rewardTime()).to.equal(config.REWARD_INTERVAL)
  })

  it("lockUpTime: should be able to get the lock interval.", async () => {
    expect(await staking.lockUpTime()).to.equal(config.LOCK_INTERVAL)
  })

  it("changeRewardTime: should be able to change the reward interval.", async () => {
    let newRewardTime = 12
    await staking.connect(owner).changeRewardTime(newRewardTime)
    expect(await staking.rewardTime()).to.equal(newRewardTime)
    await staking.connect(owner).changeRewardTime(config.REWARD_INTERVAL)
  })

  it("changelockUpTime: should be able to change the lock interval.", async () => {
    let newlockUpTime = 13
    await staking.connect(owner).changeLockUpTime(newlockUpTime)
    expect(await staking.lockUpTime()).to.equal(newlockUpTime)
    await staking.connect(owner).changeLockUpTime(config.LOCK_INTERVAL)
  })

  it("stake: should successfully stake liquidity tokens.", async () => {
    // Mint some TOKEN0 and TOKEN1 tokens for test signer.
    let afterMinute = new Date().getTime() + 60
    let mintAmount = 10000
    stakeAmount = 100

    console.log("owner: ", owner)
    console.log(config.TOKEN0_ADDRESS, config.TOKEN1_ADDRESS)
    const token0 = new ethers.Contract(
      config.TOKEN0_ADDRESS,
      ERC20Token.abi,
      owner
    )

    const token1 = new ethers.Contract(
      config.TOKEN1_ADDRESS,
      ERC20Token.abi,
      owner
    )

    console.log(1)
    await token0.connect(owner).mint(owner.address, mintAmount)
    await token1.connect(owner).mint(owner.address, mintAmount)

    // Submit 10000 of TOKEN0 and TOKEN1 to the liquidity pool to get liquidity tokens for test signer.
    const router02 = new ethers.Contract(
      config.ROUTER02_ADDRESS,
      IUniswapV2Router02.abi,
      owner
    )

    await token0.connect(owner).approve(config.ROUTER02_ADDRESS, mintAmount)
    await token1.connect(owner).approve(config.ROUTER02_ADDRESS, mintAmount)

    await router02
      .connect(owner)
      .addLiquidity(
        config.TOKEN0_ADDRESS,
        config.TOKEN1_ADDRESS,
        mintAmount,
        mintAmount,
        mintAmount,
        mintAmount,
        owner.address,
        afterMinute
      )

    const liquidityToken = new ethers.Contract(
      config.LIQUIDITY_TOKEN_ADDRESS,
      IUniswapV2Pair.abi,
      owner
    )

    console.log(liquidityToken)

    await liquidityToken.connect(owner).approve(staking.address, stakeAmount)
    console.log(2)

    // Finally, stake 100 of received liquidity tokens as test signer.
    console.log(3)
    const txStake = staking.connect(owner).stake(stakeAmount)
    console.log(4)
    console.log(txStake)
    const rStake = await (await txStake).wait()
    console.log(rStake)
    console.log(5)
    console.log(3)
  })

  it("claim: should revert given lockUpTime didn't pass.", async () => {
    await expect(staking.connect(owner).claim()).to.be.revertedWith(
      "ERROR: must wait for lock interval to pass."
    )
  })

  it("unstake: should revert because user didn't claim the reward yet.", async () => {
    await expect(staking.connect(owner).unstake()).to.be.revertedWith(
      "ERROR: must claim reward before unstaking."
    )
  })

  it("claim: should be able to claim the reward.", async () => {
    // Move lockUpTime seconds to the future (to make sure that lockUpTime passed).
    await hre.ethers.provider.send("evm_increaseTime", [config.LOCK_INTERVAL])

    // Call the function.
    const txClaim = staking.connect(owner).claim()
    const rClaim = await (await txClaim).wait()

    // Manually calculate the expected reward.
    const balance = (await staking.stakeOf(owner.address))[0]
    const stakeStartTimestamp = (await staking.stakeOf(owner.address))[1]
    const stakeEndTimestamp = (await staking.stakeOf(owner.address))[2]

    const rewardPerInterval = Math.round(
      (balance * config.REWARD_PERCENTAGE) / 100
    )
    const numOfIntervals = Math.round(
      (stakeEndTimestamp - stakeStartTimestamp) / config.REWARD_INTERVAL
    )
    const reward = rewardPerInterval * numOfIntervals

    expect(rClaim.events[1].args[0]).to.equal(owner.address)
    expect(rClaim.events[1].args[1]).to.equal(reward)
  })

  it("stake: should revert because user should unstake after claiming the reward to stake again.", async () => {
    await expect(staking.connect(owner).stake(20)).to.be.revertedWith(
      "ERROR: must unstake after claiming the reward to stake again."
    )
  })

  it("claim: should revert because user already claimed the reward.", async () => {
    await expect(staking.connect(owner).claim()).to.be.revertedWith(
      "ERROR: already claimed the reward."
    )
  })

  it("unstake: should be able to unstake the staked tokens.", async () => {
    const txUnstake = staking.connect(owner).unstake()
    const rUnstake = await (await txUnstake).wait()

    expect(rUnstake.events[1].args[0]).to.equal(owner.address)
    expect(rUnstake.events[1].args[1]).to.equal(stakeAmount)
  })
})
