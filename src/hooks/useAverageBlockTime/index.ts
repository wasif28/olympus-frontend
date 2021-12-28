import { useMemo } from "react";
import { QueryOptions, useQuery } from "react-query";
import { NetworkID } from "src/lib/Bond";
import { getAverageBlockTime, getBlock } from "./blocks";

export function useAverageBlockTime(networkId: number, options?: QueryOptions) {
  const { data } = useQuery(["averageBlockTime", networkId], () => getAverageBlockTime(networkId), options);
  return data as number;
}

export function useBlock(daysAgo: number, networkId: number = NetworkID.Mainnet, options?: QueryOptions) {
  const timestamp = useMemo(() => Math.floor(Date.now() / 1000) - daysAgo * 86400, [daysAgo]);

  const { data } = useQuery(["block", timestamp], () => getBlock(networkId, timestamp), options);

  return data as number;
}
