import { useState } from "react";

import Body from "../../Blocks/Body";
import Hero from "../../Blocks/Hero";

import "react-toastify/dist/ReactToastify.css";
import WalletMenu from "../../components/Wallet";

const Home = () => {
  const [isWalletOptionsOpen, setisWalletOptionsOpen] = useState(false);
  const [connectedStatus, setConnectedStatus] = useState(false);
  console.log("isWalletOptionsOpen:", isWalletOptionsOpen);
  return (
    <Body>
      <WalletMenu
        isWalletOptionsOpen={isWalletOptionsOpen}
        setisWalletOptionsOpen={setisWalletOptionsOpen}
        setConnectedStatus={setConnectedStatus}
      />
      <Hero
        setisWalletOptionsOpen={setisWalletOptionsOpen}
        isWalletOptionsOpen={isWalletOptionsOpen}
        connectedStatus={connectedStatus}
      />
    </Body>
  );
};

export default Home;
