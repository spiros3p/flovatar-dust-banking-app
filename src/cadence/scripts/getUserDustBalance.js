export const getUserDustBalanceScript = `
import FlovatarDustToken from 0x9392a4a7c3f49a0b
import FungibleToken from 0x9a0766d93b6608b7

pub fun main(wallet: Address):UFix64 {
  let ref = getAccount(wallet).getCapability(FlovatarDustToken.VaultBalancePath)!.borrow<&FlovatarDustToken.Vault{FungibleToken.Balance}>()!
  return ref.balance
}

`