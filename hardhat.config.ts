import * as dotenv from "dotenv"

import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-etherscan"
import "@typechain/hardhat"
import "hardhat-gas-reporter"
import "solidity-coverage"
import "./tasks/index"

import { HardhatUserConfig } from "hardhat/config"
dotenv.config()

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_KEY as string,
        enabled: true
      }
    },
    rinkeby: {
      url: `${process.env.ALCHEMY_KEY}`,
      accounts: [process.env.PRIVATE_KEY as string]
    }
  },
  etherscan: {
    apiKey: process.env.ETHS_API_KEY
  },
  typechain: {
    outDir: "build/types",
    target: "ethers-v5"
  }
}

export default config
