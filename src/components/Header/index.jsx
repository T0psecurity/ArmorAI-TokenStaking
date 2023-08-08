import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import "./style.css";
//zip
import menuIcon from "../../assets/img/icons/menu.svg";
import walletIcon from "../../assets/img/icons/wallet.svg";
import downTabIcon from "../../assets/img/icons/downTab.svg";
import Modal from "../Modal";
import ConnectModal from "../ConnectModal";
import useAuth from "../../hooks/useAuth";
//
import { shortenAddress } from "../../utils/utils";
import Icon from "../Icon";
import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import { chainId as mainnetChainId } from "../../utils/web3React";
import { updateNetwork } from "../../utils/web3React";

const Header = ({ setisWalletOptionsOpen, offsetY }) => {
  const {
    library,
    chainId,
    account: wallet,
    ...web3React
  } = useActiveWeb3React();
  const isWrongNetwork = chainId != mainnetChainId;
  const [isOpenWallet, setisOpenWallet] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  function web3ButtonHandler () {
    console.log("error:123")
    if (!!wallet) {
      if (isWrongNetwork) {
        updateNetwork();
      } else {
        setisWalletOptionsOpen((prev) => !prev);
        setIsOpen(() => false);
      }
    } else {
      setIsOpen(() => false);
      setisWalletOptionsOpen(false);
      setisOpenWallet(true);
    }
  };

  useEffect(() => {
    web3ButtonHandler();
  },[]);

  const web3MobileButtonHandler = () => {
    if (!!wallet) {
      if (isWrongNetwork) {
        updateNetwork();
      } else {
        setisWalletOptionsOpen((prev) => !prev);
        setIsOpen(() => false);
      }
    } else {
      setIsOpen(() => false);
      setisWalletOptionsOpen(false);
      login("walletconnect");
    }
  };

  const { login, logout } = useAuth();

  const [scrollValue, setScrollValue] = useState(0);

  useEffect(() => {
    const onScroll = (e) => {
      setScrollValue(e.target.documentElement.scrollTop);
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollValue]);

  return (
    <div
      className={
        scrollValue > 1
          ? "header-container-outer aic fixed-header"
          : "header-container-outer aic"
      }
    >
      <Modal visible={isOpenWallet} onClose={() => setisOpenWallet(false)}>
        <ConnectModal login={login} onClose={() => setisOpenWallet(false)} />
      </Modal>
      <nav className="header-container">
        <div
          onClick={() => web3ButtonHandler()}
          className="header--button aic"
          style={{ float: 'right' }}
        >
          {!!wallet ? (
            <>
              {isWrongNetwork ? (
                "Wrong Network"
              ) : (
                <div className="walletmenu-container aic">
                  <Icon
                    imgsrc={walletIcon}
                    classnamestyle="walletmenu--icon-wallet aic "
                  />
                  {shortenAddress(wallet)}
                  <Icon
                    imgsrc={downTabIcon}
                    classnamestyle="walletmenu--icon-tab aic "
                  />
                </div>
              )}
            </>
          ) : (
            "Connect Wallet"
          )}
        </div>
      </nav>
    </div>
  );
};

const LightTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 18,
    width: 150,
    padding: 13,
    borderRadius: 10,
    boxShadow: "0px 4px 24px rgb(0 0 0 / 50%)",
  },
}));

export default Header;
