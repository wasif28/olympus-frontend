import { useQuery } from "react-query";
import { NetworkID } from "src/lib/Bond";
import { getPairs, getTokenPrice, SupportedExchangeNetworks } from "./exchange";

export const useTokenPrice = (
  tokenContractAddress: string,
  networkId: SupportedExchangeNetworks = NetworkID.Mainnet,
) => {
  return useQuery(["token_price", tokenContractAddress], () => getTokenPrice(networkId, tokenContractAddress));
};

interface useSushiPairsProps {
  block?: number;
  networkId: SupportedExchangeNetworks;
  user?: string;
  subset?: string[];
}

export function useSushiPairs({ block, networkId, user, subset }: useSushiPairsProps) {
  const variables = {
    block: block ? { number: block } : undefined,
    where: {
      user: user?.toLowerCase(),
      id_in: subset?.map(id => id.toLowerCase()),
    },
  };

  const { data } = useQuery(["sushi_pair", networkId, block, subset], () => getPairs(networkId, variables));
  return data;
}
