import { create } from "zustand";
import { EncryptedERC20_ABI } from "../types/EncryptedERC20_ABI";
import { EExchange } from "../types/EExchange";

interface ContractState {
  eexchange: EExchange | null;
  setEexchange: (eexchange: any) => void;
  token1: { contract: EncryptedERC20_ABI | null; address: string | null };
  setToken1: (token1: any) => void;
  token2: { contract: EncryptedERC20_ABI | null; address: string | null };
  setToken2: (token2: any) => void;
  contractAddress: string | null;
  setContractAddress: (contractAddress: string) => void;
}

export const contractStore = create<ContractState>((set) => ({
  eexchange: null,
  setEexchange: (eexchange: EExchange | null) => set({ eexchange }),
  token1: { contract: null, address: null },
  setToken1: (token1: any) => set({ token1 }),
  token2: { contract: null, address: null },
  setToken2: (token2: any) => set({ token2 }),
  contractAddress: null,
  setContractAddress: (contractAddress: string) => set({ contractAddress }),
}));
