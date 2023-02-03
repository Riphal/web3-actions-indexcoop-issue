import { getFlashMintZeroExQuote, ZeroExApi } from "@indexcoop/flash-mint-sdk";
import { ActionFn, Context, Event, BlockEvent } from "@tenderly/actions";

import { ethers, Wallet } from "ethers";

const SLIPPAGE_DEFAULT = 0.0001;

export const blockHelloWorldFn: ActionFn = async (
  context: Context,
  event: Event
) => {
  let blockEvent = event as BlockEvent;
  console.log("Block number is: ", blockEvent.blockNumber);

  // Get secrets
  const alchemyApi = await context.secrets.get("ALCHEMY_MAINET_API");
  const arbKeeperPrivateKey = await context.secrets.get(
    "ARB_KEEPER_PRIVATE_KEY"
  );

  const provider = new ethers.providers.JsonRpcProvider(alchemyApi, 1);
  const arbitrageSigningWallet = new Wallet(arbKeeperPrivateKey, provider);
  console.log(
    "arbitrage signing wallet address: ",
    arbitrageSigningWallet.address
  );

  // Test FlashMint
  const inputToken = {
    symbol: "WETH",
    decimals: 18,
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  };
  const outputToken = {
    symbol: "dsETH",
    decimals: 18,
    address: "0x341c05c0E9b33C0E38d64de76516b2Ce970bB3BE",
  };

  const index0xApiBaseUrl = await context.secrets.get("INDEX_0X_API");
  const indexApiKey = await context.secrets.get("INDEX_0X_API_KEY");

  console.log(index0xApiBaseUrl.length);
  console.log(indexApiKey.length);

  const zeroExApi = new ZeroExApi(
    index0xApiBaseUrl,
    "",
    { "X-INDEXCOOP-API-KEY": indexApiKey },
    "/mainnet/swap/v1/quote"
  );

  const dsETHAmount = ethers.utils.parseEther("0.1");
  const quote = await getFlashMintZeroExQuote(
    inputToken,
    outputToken,
    dsETHAmount,
    true,
    SLIPPAGE_DEFAULT,
    zeroExApi,
    provider,
    1
  );

  if (!quote) {
    console.log("no quote");
    return;
  }

  const swaps = quote.componentQuotes;
  const wethAmount = quote.inputOutputTokenAmount;

  // if (!swaps || !wethAmount) {
  //   console.log(`dsETHAmount = ${dsETHAmount.toString()} cannot get swaps`);
  // }
  // x;

  console.log(swaps);
  console.log(wethAmount.toString());
};
