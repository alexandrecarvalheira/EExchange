"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TabsTrigger, TabsList, TabsContent, Tabs } from "@/components/ui/tabs";
import { generatePermits, revokePermits } from "@/lib/permits";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { contractStore } from "@/store/contractStore";
import { instanceStore } from "@/store/instanceStore";
import { useAccount } from "wagmi";
import { PermissionStruct } from "@/types/EncryptedERC20_ABI";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
export function AddLiquidity() {
  const contractAddress = contractStore((state) => state.contractAddress);
  const eexchange = contractStore((state) => state.eexchange);
  const token1 = contractStore((state) => state.token1);
  const token2 = contractStore((state) => state.token2);
  const fhenix = instanceStore((state) => state.fhenix);
  const setFhenix = instanceStore((state) => state.setFhenix);
  const provider = instanceStore((state) => state.provider);

  //Wagmi
  const { address } = useAccount();

  //State
  const [balance, setBalance] = useState<string>("Encrypted");
  const [hasPermit, setHasPermit] = useState<boolean>(false);
  const [change, setChange] = useState<boolean>(false);
  const [allowed, setAllowed] = useState<boolean>(false);
  const [tokenOne, setTokenOne] = useState<{
    name?: string;
    symbol?: string;
    totalSupply?: number;
  }>({});
  const [tokenTwo, setTokenTwo] = useState<{
    name?: string;
    symbol?: string;
    totalSupply?: number;
  }>({});

  useEffect(() => {
    const getTokenData = async () => {
      const name1 = await token1.contract!.name();
      const symbol1 = await token1.contract!.symbol();
      const totalSupply1 = await token1.contract!.totalSupply();
      setTokenOne({
        name: name1,
        symbol: symbol1,
        totalSupply: Number(totalSupply1!),
      });
      const name = await token2.contract!.name();
      const symbol = await token2.contract!.symbol();
      const totalSupply = await token2.contract!.totalSupply();
      setTokenTwo({ name, symbol, totalSupply: Number(totalSupply!) });
    };
    getTokenData();
  }, [token1, token2]);

  const FormSchema = z.object({
    amountToken2: z.number().transform(async (amount) => {
      console.log(amount);
      return await fhenix?.encrypt_uint16(amount);
    }),
    amountToken1: z.number().transform(async (amount) => {
      console.log(amount);
      return await fhenix?.encrypt_uint16(amount);
    }),
  });
  type FormInput = z.infer<typeof FormSchema>;

  const { register, handleSubmit, reset } = useForm<FormInput>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmitaddLiquidity: SubmitHandler<FormInput> = async (data) => {
    console.log(data);
    const { amountToken1, amountToken2 } = data;
    const tx = await eexchange!.addLiquidity(
      amountToken1 as any,
      amountToken2 as any
    );
    tx.wait();
  };

  const onSubmitAllow: SubmitHandler<FormInput> = async (data) => {
    console.log(data);
    const { amountToken1, amountToken2 } = data;
    const tx1 = await token1.contract!["approve(address,(bytes))"](
      contractAddress!,
      amountToken1 as any
    );
    tx1.wait();
    const tx2 = await token2.contract!["approve(address,(bytes))"](
      contractAddress!,
      amountToken2 as any
    );
    tx2.wait();
    setAllowed(true);
  };

  return (
    <TabsContent value="liquidity">
      <div className="flex flex-col items-center justify-center bg-white shadow-md rounded-lg dark:bg-gray-800">
        <div className="flex justify-center">
          <ConnectButton />{" "}
          {!hasPermit ? (
            <Button
              className="ml-auto"
              variant="outline"
              onClick={async () => {
                const address = change ? token2.address : token1.address;
                setFhenix(await generatePermits(address!, provider!));
                setHasPermit(true);
              }}
            >
              Generate Permits
            </Button>
          ) : (
            <Button
              className="ml-auto"
              variant="outline"
              onClick={async () => {
                const address = change ? token2.address : token1.address;

                setFhenix(await revokePermits(address!, fhenix!, provider!));
                setHasPermit(false);
                setBalance("Encrypted");
              }}
            >
              Remove Permits
            </Button>
          )}
        </div>
        <div className="text-center my-4 flex gap-4 align-middle justify-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Token Name: {tokenOne.name}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Symbol: {tokenOne.symbol}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Total Supply: {tokenOne.totalSupply}
            </p>
            <span className="border-b w-1/5 lg:w-1/4" />
            <button
              className="text-xs text-center text-gray-500 uppercase dark:text-gray-400 hover:underline"
              onClick={async () => {
                const tx = await token1.contract!.mint(100);
                tx.wait();
                setTokenOne({ totalSupply: tokenOne.totalSupply! + 100 });
              }}
            >
              Mint Tokens
            </button>
            <span className="border-b w-1/5 lg:w-1/4" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Token Name: {tokenTwo.name}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Symbol: {tokenTwo.symbol}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Total Supply: {tokenTwo.totalSupply}
            </p>
            <span className="border-b w-1/5 lg:w-1/4" />
            <button
              className="text-xs text-center text-gray-500 uppercase dark:text-gray-400 hover:underline"
              onClick={async () => {
                const tx = await token2.contract!.mint(100);
                tx.wait();
                setTokenTwo({ totalSupply: tokenTwo.totalSupply! + 100 });
              }}
            >
              Mint Tokens
            </button>
            <span className="border-b w-1/5 lg:w-1/4" />
          </div>
        </div>
        <h2 className="text-3xl font-semibold text-center text-gray-800 dark:text-white">
          Encrypted Exchange
        </h2>
        <div className="w-full max-w-md px-4 py-8 bg-white shadow-md rounded-lg dark:bg-gray-800">
          <form className="mt-4" onSubmit={handleSubmit(onSubmitaddLiquidity)}>
            <div className="flex flex-col mb-2">
              <Label htmlFor="token1">{tokenOne.name}</Label>
            </div>
            <div className="flex flex-col mb-2">
              <Label htmlFor="amount1">Amount 1</Label>
              <Input
                id="amount"
                placeholder="0.0"
                type="number"
                {...register("amountToken1", {
                  valueAsNumber: true,
                  required: true,
                })}
              />
            </div>
            <div className="flex flex-col mb-2">
              <Label htmlFor="token2">{tokenTwo.name}</Label>
            </div>
            <div className="flex flex-col mb-2">
              <Label htmlFor="amount2">Amount 2</Label>
              <Input
                id="amount"
                placeholder="0.0"
                type="number"
                {...register("amountToken2", {
                  valueAsNumber: true,
                  required: true,
                })}
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              {allowed ? (
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={!hasPermit}
                >
                  Add Liquidity
                </Button>
              ) : (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={!hasPermit}
                    onClick={handleSubmit(onSubmitAllow)}
                  >
                    Allow Tokens
                  </Button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </TabsContent>
  );
}
