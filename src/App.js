import "./App.scss";
import "./app-custom.scss";
import { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import { getUserNFTsScript } from "./cadence/scripts/getUserNFTs.js";
import { getBankBalanceScript } from "./cadence/scripts/getBankBalance.js";
import { getServiceFeeScript } from "./cadence/scripts/getServiceFee.js";
import { getUserDustBalanceScript } from "./cadence/scripts/getUserDustBalance.js";
import { getMaxDaysOfLendingScript } from "./cadence/scripts/getMaxDaysOfLending.js";
import { getUserCollateralScript } from "./cadence/scripts/getUserCollateral.js";
import { depositCollateralTrx } from "./cadence/transactions/depositCollateral.js";
import { retrieveCollateralTrx } from "./cadence/transactions/retrieveCollateral.js";

fcl.config({
  // "accessNode.api": "https://rest-mainnet.onflow.org", //mainnet
  // "discovery.wallet": "https://fcl-discovery.onflow.org/authn", //mainnet
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "0xProfile": "0x1829e3193c654852", // DustLender TestNet
});

function App() {
  const [daysForEachFlovInWallet, setDaysForEachFlovInWallet] = useState({});
  const [userFlovatarInventory, setUserFlovatarInventory] = useState([]);
  const [userCollateralInventory, setUserCollateralInventory] = useState([]);
  const [user, setUser] = useState({});
  const [userDustBalance, setUserDustBalance] = useState();
  const [maxDays, setMaxDays] = useState(); // fetch from DustLender contract
  const [bankBalance, setBankBalance] = useState(); // fetch from DustLender contract
  const [serviceFee, setServiceFee] = useState(); // fetch from DustLender contract

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
    getBankBalance()
    getMaxDays()
    getServiceFee()
  }, []);

  useEffect(() => {
    if (Object.keys(user).length && user.addr) {
      getUserNFTs();
      getUserCollaterals();
      getUserDustBalance()
    } else {
      setUserCollateralInventory([])
      setUserDustBalance()
      setUserFlovatarInventory([])
    }
  }, [user]);

  const getServiceFee = async () => {
    try {
      const result = await fcl.query({
        cadence: getServiceFeeScript,
      });
      console.log(result);
      setServiceFee(result);
    } catch (e) {
      console.error(e);
    }
  }
 
  const getUserDustBalance = async () => {
    try {
      const result = await fcl.query({
        cadence: getUserDustBalanceScript,
        args: (arg, t) => [arg(user.addr, t.Address)],
      });
      console.log(result);
      setUserDustBalance(result);
    } catch (e) {
      console.error(e);
    }
  }

  const getBankBalance = async () => {
    try {
      const result = await fcl.query({
        cadence: getBankBalanceScript,
      });
      console.log(result);
      setBankBalance(result);
    } catch (e) {
      console.error(e);
    }
  }

  const getMaxDays = async () => {
    try {
      const result = await fcl.query({
        cadence: getMaxDaysOfLendingScript,
      });
      console.log(result);
      setMaxDays(result);
    } catch (e) {
      console.error(e);
    }
  }

  const calculateServiceFee = () => `${serviceFee * 100}%`;

  const handleInputDaysChange = (event, id) => {
    setDaysForEachFlovInWallet({
      ...daysForEachFlovInWallet,
      [id]: event.target.value,
    });
  };

  const getUserNFTs = async () => {
    try {
      const result = await fcl.query({
        cadence: getUserNFTsScript,
        args: (arg, t) => [arg(user.addr, t.Address)],
      });
      // console.log(result);
      setUserFlovatarInventory(result);
    } catch (e) {
      console.error(e);
    }
  };

  const getUserCollaterals = async () => {
    try {
      const result = await fcl.query({
        cadence: getUserCollateralScript,
        args: (arg, t) => [arg(user.addr, t.Address)],
      });
      console.log(result);
      setUserCollateralInventory(result);
    } catch (e) {
      console.error(e);
    }
  };

  const depositCollateral = async (id) => {
    const days = daysForEachFlovInWallet[id];
    console.log(id);
    console.log(days);
    if (daysForEachFlovInWallet[id] <= 0) return;
    try {
      const result = await fcl.mutate({
        cadence: depositCollateralTrx,
        args: (arg, t) => [arg(id, t.UInt64), arg(days, t.UInt64)],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });
      console.log(result);
      await getUserNFTs();
      await getUserCollaterals();
    } catch (e) {
      console.error(e);
    }
  };

  const retrieveCollateral = async (id) => {
    console.log(id);
    try {
      const result = await fcl.mutate({
        cadence: retrieveCollateralTrx,
        args: (arg, t) => [arg(id, t.UInt64), arg(user.addr, t.Address)],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999,
      });
      console.log(result);
      await getUserNFTs();
      await getUserCollaterals();
    } catch (e) {
      console.error(e);
    }
  }

  const renderFlovatarList = (flovatarList = [], collateralColumn = false) => {
    return flovatarList.map((flov, index) => (
      <div key={index} className="col-6 col-md-6 my-2 px-2">
        <div className="card pb-1 card-custom mx-auto">
          <img
            src={`https://images.flovatar.com/flovatar/png/${flov.flovatar.id}.png`}
            className="card-img-top"
            alt="..."
          />
          <div className="card-body p-1">
            <div className="text-center my-1">
              Daily $DUST:
              <span className="dust-amount ms-2">
                {flov.dailyDust.slice(0, flov.dailyDust.length - 5)}
              </span>
            </div>
            {/* <h5 className="card-title">Card title</h5> */}
            {/* <p className="card-text"></p> */}
            {!collateralColumn ? (
              <div className="collateral-options my-1">
                <label htmlFor="days">Days</label>
                <input
                  type="number"
                  name="days"
                  className="input-days"
                  onChange={(event) =>
                    handleInputDaysChange(event, flov.flovatar.id)
                  }
                />
                <div className="amount">
                  <span className="dust-to-receive">Receive $DUST</span>
                  <br />
                  <span className="dust-to-receive-amount">
                    {daysForEachFlovInWallet[flov.flovatar.id]
                      ? (
                          daysForEachFlovInWallet[flov.flovatar.id] *
                          flov.dailyDust *
                          (1 - serviceFee)
                        ).toFixed(3)
                      : 0}
                  </span>
                </div>
              </div>
            ) : (
              <div className="collateral-options my-1 d-flex">
                <div>
                  <span className="title-small">$DUST owed</span>
                  <br />
                  <span>
                    {Number(flov.collateralInfo.dustAmountToClaim).toFixed(3)}
                  </span>
                </div>
                <div>
                  <span className="title-small">Claimable $DUST</span>
                  <br />
                  <span>
                    {flov.claimableInfo
                      ? Number(flov.claimableInfo?.amount).toFixed(3)
                      : 0}
                  </span>
                </div>
              </div>
            )}
            {!collateralColumn ? (
              <button
                className="btn btn-outline-dark w-100"
                onClick={() => depositCollateral(flov.flovatar.id)}
                disabled={
                  !daysForEachFlovInWallet[flov.flovatar.id] ||
                  daysForEachFlovInWallet[flov.flovatar.id] <= 0
                }
              >
                LEND
              </button>
            ) : (
              <button
                className="btn btn-outline-dark w-100"
                onClick={() => retrieveCollateral(flov.flovatar.id)}
                disabled={
                  !flov.claimableInfo ||
                  Number(flov.collateralInfo.dustAmountToClaim) -
                    Number(flov.claimableInfo?.amount) >= 0
                }
              >
                RETRIEVE
              </button>
            )}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="container px-3">
      <div className="row">
        <nav className="navbar navbar-expand-lg bg-body-tertiary custom-navbar">
          <div className="container-fluid">
            <a className="navbar-brand" href="/">
              Dust Lender
            </a>
            {!user.loggedIn && (
              <button
                className="btn btn-success me-2"
                type="button"
                onClick={() => fcl.authenticate()}
              >
                Connect Wallet
              </button>
            )}
            {user.loggedIn && (
              <button
                className="btn btn-outline-dark me-2"
                type="button"
                onClick={() => fcl.unauthenticate()}
              >
                Disconnect Wallet
              </button>
            )}
          </div>
        </nav>
        {/* make it chips */}
        <div className="badge-bar my-2 gap-2">
          <span className="badge text-bg-success">Wallet Balance: {!!userDustBalance ? Number(userDustBalance).toFixed(3): '-'} $DUST</span>
          <span className="badge text-bg-primary">Service Balance: {Number(bankBalance).toFixed(3)} $DUST</span>
          <span className="badge text-bg-primary">Service fee: {calculateServiceFee()}</span>
          <span className="badge text-bg-primary">Max Days of Lending: {maxDays}</span>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 px-1 my-2">
          <div className="column-container inventory">
            <h3 className="text-center">Your Wallet</h3>
            <div className="container-inventory-inside row mx-0">
              {/* <button onClick={() => getUserNFTs()}>yoooo</button> */}

              {!userFlovatarInventory.length ? (
                <p className="py-3 text-center">
                  There are no Flovatar NFTs in your wallet!
                </p>
              ) : (
                renderFlovatarList(userFlovatarInventory)
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-6 px-1 my-2">
          <div className="column-container collateralized">
            <div className="container-collateralized-inside">
              <h3 className="text-center">Your Collaterilized</h3>
              <div className="container-inventory-inside row mx-0">
                {/* <button onClick={() => getUserNFTs()}>yoooo</button> */}

                {!userCollateralInventory.length ? (
                  <p className="py-3 text-center">
                    There are no Flovatar NFTs in your wallet!
                  </p>
                ) : (
                  renderFlovatarList(userCollateralInventory, true)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
