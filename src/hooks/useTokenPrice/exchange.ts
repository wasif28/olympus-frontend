import { request, RequestDocument } from "graphql-request";
import { useQuery } from "react-query";
import { NetworkID } from "src/lib/Bond";
import { ethPriceQuery, pairsQuery, tokenPriceQuery } from "./query";

export const EXCHANGE = {
  [NetworkID.Mainnet]: "sushiswap/exchange",
  [NetworkID.Avalanche]: "sushiswap/avalanche-exchange",
  [NetworkID.Arbitrum]: "sushiswap/arbitrum-exchange",
};

export type SupportedExchangeNetworks = keyof typeof EXCHANGE;

export const exchange = async (networkId: SupportedExchangeNetworks, query: RequestDocument, variables: any) =>
  request(`https://api.thegraph.com/subgraphs/name/${EXCHANGE[networkId]}`, query, variables);

export const getTokenPrice = async (
  networkId: SupportedExchangeNetworks = NetworkID.Mainnet,
  tokenContractAddress: string,
) => {
  const ethPrice = await getEthPrice(networkId);

  const { token } = await exchange(networkId, tokenPriceQuery, { id: tokenContractAddress });
  return token?.derivedETH * ethPrice;
};

export const getEthPrice = async (networkId: SupportedExchangeNetworks = NetworkID.Mainnet) => {
  const data = await exchange(networkId, ethPriceQuery, { id: 1 });
  return data?.bundles?.[0]?.ethPrice;
};

export const getPairs = async (networkId: SupportedExchangeNetworks = NetworkID.Mainnet, variables: any) => {
  const { pairs } = await exchange(networkId, pairsQuery, variables);
  return pairs;
};
