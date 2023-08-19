import React from "react";
import Header from "../../components/Header";
import Sale from "./Sale";
import "./style.css";
import logoToken from "../../assets/img/background-logo.png";
import Icon from "../../components/Icon";
const HeroSection = ({
  offsetY,
  connectedStatus,
  setisWalletOptionsOpen,
}) => {
  return (
    <div className="hero-container-header" id="presale">
      <Header
        setisWalletOptionsOpen={setisWalletOptionsOpen}
        offsetY={offsetY}
      />
      <div className="hero-container-mark">
        <Icon
          imgsrc={logoToken}
          classnamestyle="hero-sale-section-brand-logo hover-effect"
        />
      </div>
      <h2 className="hero-container-mark-title">ARMOR STAKING</h2>
      <div className="hero-container">
        <Sale
          isWalletOpen={setisWalletOptionsOpen}
          connectedStatus={connectedStatus}
        />
      </div>
    </div>
  );
};

export default HeroSection;
