export const depositCollateralTrx = `
// import FlovatarDustToken from 0x9392a4a7c3f49a0b
// import FungibleToken from 0x9a0766d93b6608b7
import DustLender from 0x1829e3193c654852
import Flovatar from 0x9392a4a7c3f49a0b
import NonFungibleToken from 0x631e88ae7f1d7c20

transaction(flovatarId: UInt64, days: UInt64) {

  prepare(acct: AuthAccount) {
    let nft <- acct.borrow<&Flovatar.Collection{NonFungibleToken.Provider}>(from: Flovatar.CollectionStoragePath)!.withdraw(withdrawID: flovatarId)
    DustLender.depositCollateralForLoan(flovatar: <- nft, daysOfLoan: days, wallet: acct.address)
  }

  execute {}
}
`