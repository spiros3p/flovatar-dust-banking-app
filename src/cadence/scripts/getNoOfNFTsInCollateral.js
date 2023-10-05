export const getNoOfNFTsInCollateralScript = 
`
import Flovatar from 0x9392a4a7c3f49a0b
import FlovatarInbox from 0x9392a4a7c3f49a0b

pub fun main(): Int {
    let collectionRef = getAccount(0x1829e3193c654852).getCapability(Flovatar.CollectionPublicPath).borrow<&Flovatar.Collection{Flovatar.CollectionPublic}>()!
    let ids = collectionRef.getIDs()
    return ids.length
}
`