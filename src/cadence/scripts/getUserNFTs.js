export const getUserNFTsScript = 
`
import Flovatar from 0x9392a4a7c3f49a0b
import FlovatarInbox from 0x9392a4a7c3f49a0b

pub fun main(wallet: Address): [AnyStruct] {
    let collectionRef = getAccount(wallet).getCapability(Flovatar.CollectionPublicPath).borrow<&Flovatar.Collection{Flovatar.CollectionPublic}>()!
    let ids = collectionRef.getIDs()
    let flovs: [AnyStruct] = []
    for id in ids {
        let flov = collectionRef.borrowFlovatar(id: id)!
        let rarityScore = flov.getRarityScore()
        let that: {String: AnyStruct} = {
          "dailyDust": (3.0 + rarityScore) * FlovatarInbox.dustPerDayPerScore,
          "flovatar": flov
        }
        flovs.append(that)
    }
    return flovs
}
`