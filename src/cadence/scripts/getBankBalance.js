export const getBankBalanceScript = `
import DustLender from 0x1829e3193c654852

pub fun main(): UFix64 {
  return DustLender.getCollateralVaultDustBalance()
}

`