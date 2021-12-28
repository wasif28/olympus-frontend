import { getUnixTime, startOfHour, subHours } from "date-fns";
import { request } from "graphql-request";
import { NetworkID } from "src/lib/Bond";
import { blockQuery, blocksQuery } from "./query";

export const BLOCKS = {
  [NetworkID.Mainnet]: "blocklytics/ethereum-blocks",
  // [NetworkID.Polygon]: "matthewlilley/polygon-blocks",
  [137]: "matthewlilley/polygon-blocks",
  [NetworkID.Avalanche]: "matthewlilley/avalanche-blocks",
  [NetworkID.Arbitrum]: "sushiswap/arbitrum-blocks",
};

type SupportedNetworks = NetworkID.Mainnet | NetworkID.Avalanche | NetworkID.Arbitrum | 137;

export const fetcher = async (networkId: SupportedNetworks, query: any, variables: any = undefined) => {
  return request(`https://api.thegraph.com/subgraphs/name/${BLOCKS[networkId]}`, query, variables);
};

type Block = { timestamp: number; averageBlockTime: number };

export const getBlocks = async (networkId: SupportedNetworks, start: number, end: number): Promise<Block[]> => {
  const { blocks } = await fetcher(networkId, blocksQuery, { start, end });
  return blocks;
};

export const getBlock = async (networkId: SupportedNetworks = NetworkID.Mainnet, timestamp: number) => {
  const { blocks } = await fetcher(
    networkId,
    blockQuery,
    timestamp
      ? {
          where: {
            timestamp_gt: timestamp - 600,
            timestamp_lt: timestamp,
          },
        }
      : {},
  );

  return Number(blocks?.[0]?.number);
};

export const getAverageBlockTime = async (networkId: SupportedNetworks = NetworkID.Mainnet) => {
  const now = startOfHour(Date.now());
  const start = getUnixTime(subHours(now, 6));
  const end = getUnixTime(now);

  const blocks = await getBlocks(networkId, start, end);

  const averageBlockTime =
    blocks?.reduce(
      (previousValue, currentValue): Block => ({
        timestamp: currentValue.timestamp,
        averageBlockTime: previousValue.averageBlockTime + (previousValue.timestamp - currentValue.timestamp),
      }),
      { timestamp: 0 } as Block,
    ).averageBlockTime / blocks.length;

  return averageBlockTime;
};
