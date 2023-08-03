import React, { useState, useContext } from "react";
import Modal from "../Modal";
import "./style.css";
import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import useAuth from "../../hooks/useAuth";

const WalletMenu = ({ isWalletOptionsOpen, setisWalletOptionsOpen }) => {
  //state for openning profile menu
  const [isOpenWallet, setisOpenWallet] = useState(false);
  const [isOpenTransactions, setisOpenTransactions] = useState(false);
  const { account: wallet } = useActiveWeb3React()
  const { logout: disconnectWallet } = useAuth()

  return (
    <>
      {!!wallet && (
        <div
          onClick={() => setisWalletOptionsOpen(false)}
          className={
            isWalletOptionsOpen
              ? "walletmenu-outer--open aic"
              : "walletmenu-outer--close aic"
          }
        >
          <div
            className={
              isWalletOptionsOpen ? "walletmenu--open" : "walletmenu--close"
            }
          >
            {/* <div
              className="walletmenu--option"
              onClick={() => {
                setisOpenWallet(true);
                setisWalletOptionsOpen(false);
              }}
            >
              Wallet
            </div>
            <div
              className="walletmenu--option"
              onClick={() => {
                setisOpenTransactions(true);
                setisWalletOptionsOpen(false);
              }}
            >
              Recent Transactions
            </div> */}
            {/* <div className="walletmenu--divider" /> */}
              <div className="walletmenu--option" onClick={disconnectWallet}>
                Disconnect
              </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletMenu;
