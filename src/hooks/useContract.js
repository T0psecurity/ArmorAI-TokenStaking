import { useCallback } from "react";
import { ethers } from "ethers";

export default () => {
    const getContract = useCallback(
        async (address, abi) => {
            const { ethereum } = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                console.log(signer, address, abi.abi);

                return new ethers.Contract(address, abi.abi, signer);
            } else {
                const provider = new ethers.providers.JsonRpcProvider(
                    "https://ethereum-sepolia.blockpi.network/v1/rpc/public",
                    11155111
                );
                
                return new ethers.Contract(address, abi.abi, provider);
            }
        },
        [11155111]
    );

    return { getContract };
};
