"use client";
import { ethers } from "ethers";
import { FhenixClient } from "fhenixjs";
import { ReactNode, useEffect, useState } from "react";
import { contractStore } from "../../store/contractStore";
import { instanceStore } from "../../store/instanceStore";
import { abi } from "../../lib/EncryptedERC20_ABI.json";
import { abi as abiExchange } from "../../lib/EExchange.json";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function ContractProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount();
  const setToken1 = contractStore((state) => state.setToken1);
  const setToken2 = contractStore((state) => state.setToken2);
  const setEexchange = contractStore((state) => state.setEexchange);
  const setProvider = instanceStore((state) => state.setProvider);
  const setContractAddress = contractStore((state) => state.setContractAddress);

  const HandleContractStore = async () => {
    if (!address) {
      setMounted(true);
      return;
    }
    const token1address = process.env.NEXT_PUBLIC_token1;
    const token2address = process.env.NEXT_PUBLIC_token2;
    const exchangeaddress = process.env.NEXT_PUBLIC_exchange;
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);
    const signer = await provider.getSigner();

    setContractAddress(exchangeaddress!);
    const exchange = new ethers.Contract(exchangeaddress!, abiExchange, signer);
    setEexchange(exchange);
    const token1 = {
      contract: new ethers.Contract(token1address!, abi, signer),
      address: token1address,
    };
    const token2 = {
      contract: new ethers.Contract(token2address!, abi, signer),
      address: token2address!,
    };
    setToken1(token1);
    setToken2(token2);
    setMounted(true);
  };

  useEffect(() => {
    HandleContractStore();
  }, [address]);

  if (address) {
    return <>{mounted && children}</>;
  } else {
    return (
      <>
        <ConnectButton />
      </>
    );
  }
}
