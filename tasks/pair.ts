import IUniswapV2Router02 from "../abi/router02_abi.json"
import IUniswapV2Factory from "../abi/factory_abi.json"
import IUniswapV2Pair from "../abi/pair_abi.json"
import ERC20Token from "../abi/erc20_abi.json"

import "@nomiclabs/hardhat-ethers"
import { task } from "hardhat/config"
import config from "../testcfg"

task(
  "pair",
  "Symmetrically add a specified amount of token0 and token1 to the " +
    "Uniswap V2 testnet liquidity pool (creates a pool if it doesn't exist)."
)
  .addParam("signer", "ID of the signer used to make the call.")
  .addParam("amount", "Amount of tokens to symmetrically add to the pool.")
  .setAction(async (args, { ethers }) => {
    const signerArray = await ethers.getSigners()

    let afterMinute = new Date().getTime() + 60

    const token0 = new ethers.Contract(
      config.TOKEN0_ADDRESS,
      ERC20Token.abi,
      signerArray[args.signer]
    )

    const token1 = new ethers.Contract(
      config.TOKEN1_ADDRESS,
      ERC20Token.abi,
      signerArray[args.signer]
    )

    const symbol0 = await token0.symbol()
    const symbol1 = await token1.symbol()

    const router02 = new ethers.Contract(
      config.ROUTER02_ADDRESS,
      IUniswapV2Router02.abi,
      signerArray[args.signer]
    )

    const factory = new ethers.Contract(
      config.FACTORY_ADDRESS,
      IUniswapV2Factory.abi,
      signerArray[args.signer]
    )

    await router02.addLiquidity(
      config.TOKEN0_ADDRESS,
      config.TOKEN1_ADDRESS,
      args.amount,
      args.amount,
      args.amount,
      args.amount,
      signerArray[args.signer].address,
      afterMinute
    )

    const pairAddress = await factory.getPair(
      config.TOKEN0_ADDRESS,
      config.TOKEN1_ADDRESS
    )

    const pair = new ethers.Contract(
      pairAddress,
      IUniswapV2Pair.abi,
      signerArray[args.signer]
    )

    const pairReserves = await (await pair.getReserves()).wait()

    console.log(
      "Successfully added " +
        args.amount +
        " of " +
        symbol0 +
        " and " +
        symbol1 +
        " tokens to " +
        symbol0 +
        "/" +
        symbol1 +
        " liquidity pool." +
        "\n" +
        symbol0 +
        " tokens in " +
        symbol0 +
        "/" +
        symbol1 +
        " liquidity pool: " +
        pairReserves[0] +
        ".\n" +
        symbol1 +
        " tokens in " +
        symbol0 +
        "/" +
        symbol1 +
        " liquidity pool: " +
        pairReserves[1] +
        ".\nPair address: " +
        pairAddress +
        "."
    )
  })
