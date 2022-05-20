import { expect } from "chai"
import { ethers } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address"
import { Contract } from "ethers"

let Staking: Contract
let owner: SignerWithAddress
let addr1: SignerWithAddress
let addr2: SignerWithAddress
let addr3: SignerWithAddress
