import { useState } from "react";

import Body from "../../Blocks/Body";
import Hero from "../../Blocks/Hero";

import "react-toastify/dist/ReactToastify.css";
import WalletMenu from "../../components/Wallet";

const Home = () => {
  const [isWalletOptionsOpen, setisWalletOptionsOpen] = useState(false);

  return (
    <Body>
      <WalletMenu
        isWalletOptionsOpen={isWalletOptionsOpen}
        setisWalletOptionsOpen={setisWalletOptionsOpen}
      />
      <Hero
        setisWalletOptionsOpen={setisWalletOptionsOpen}
      />
    </Body>
  );
};

export default Home;
