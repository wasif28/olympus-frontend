import request from "graphql-request";
import { useMemo } from "react";
import { useQuery } from "react-query";
import { addresses } from "src/constants";
import { useAverageBlockTime, useBlock } from "src/hooks/useAverageBlockTime";
import { useSushiPairs, useTokenPrice } from "src/hooks/useTokenPrice";
import { miniChefPoolsQuery } from "./query";

const ARBITRUM_CHAINID = 42161; // TODO: please change all occurences using the NetworkId enum
const POLYGON_CHAINID = 137; //    but will let this way till resolve pull request

/*
    Minichef is how sushiswap calls masterchef in other networks (not eth)
*/

const sushiMinichefGraphClients = {
  [POLYGON_CHAINID]: `https://api.thegraph.com/subgraphs/name/sushiswap/matic-minichef`,
  [ARBITRUM_CHAINID]: `https://api.thegraph.com/subgraphs/name/matthewlilley/arbitrum-minichef`,
};

export const getMiniChefFarms = async (networkId: typeof POLYGON_CHAINID | typeof ARBITRUM_CHAINID) => {
  const { data } = await request(sushiMinichefGraphClients[networkId], miniChefPoolsQuery);
  return data.pools;
};

export function useMiniChefFarms(networkId: typeof POLYGON_CHAINID | typeof ARBITRUM_CHAINID) {
  const { data } = useQuery(["sushi-minichef-farms", networkId], () => getMiniChefFarms(networkId));
  return useMemo(() => data || [], [data]);
}

const MainnetSushiTokenAddress = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2";

export const useSushiFarms = (networkId: typeof POLYGON_CHAINID | typeof ARBITRUM_CHAINID) => {
  const farms = useMiniChefFarms(networkId);
  const averageBlockTime = useAverageBlockTime(networkId);

  const sushiPrice = useTokenPrice(MainnetSushiTokenAddress);
  const gohmPrice = useTokenPrice(addresses[1].GOHM_ADDRESS);

  const blocksPerDay = 86400 / averageBlockTime;
  const blocksPerHour = 3600 / averageBlockTime;

  const gohmFarmsIdsByNetwork = {
    [POLYGON_CHAINID]: ["47"],
    [ARBITRUM_CHAINID]: ["12"],
  };
  const gOHMFarms = farms.filter(farm => gohmFarmsIdsByNetwork[networkId].includes(farm.id));

  const block1d = useBlock(1, networkId);
  const swapPairs = useSushiPairs({ subset: gOHMFarms, networkId });
  const swapPairs1d = useSushiPairs({
    subset: gOHMFarms,
    block: block1d,
    networkId,
  });

  return gOHMFarms.map(pool => {
    const sushiPerSecond = ((pool.allocPoint / pool.miniChef.totalAllocPoint) * pool.miniChef.sushiPerSecond) / 1e18;
    const sushiPerBlock = sushiPerSecond * averageBlockTime;
    const sushiPerDay = sushiPerBlock * blocksPerDay;

    const rewardPerSecond = {
      [POLYGON_CHAINID]: 0.00000462962963,
      [ARBITRUM_CHAINID]: pool.rewarder.rewardPerSecond / 1e18,
    }[networkId];
    // pool.rewarder.rewardPerSecond && networkId === ARBITRUM_CHAINID
    //   ? pool.rewarder.rewardPerSecond / 1e18
    //   : ((pool.allocPoint / pool.miniChef.totalAllocPoint) * pool.rewarder.rewardPerSecond) / 1e18;

    const rewardPerBlock = rewardPerSecond * averageBlockTime;
    const rewardPerDay = networkId === POLYGON_CHAINID ? 0.4 : rewardPerBlock * blocksPerDay;

    const rewards = [
      {
        token: "SUSHI",
        icon: "https://raw.githubusercontent.com/sushiswap/logos/main/network/ethereum/0x6B3595068778DD592e39A122f4f5a5cF09C90fE2.jpg",
        rewardPerBlock: sushiPerBlock,
        rewardPerDay: sushiPerDay,
        rewardPrice: sushiPrice,
      },
      {
        token: "gOHM",
        icon: "https://raw.githubusercontent.com/sushiswap/logos/main/network/arbitrum/0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1.jpg",
        rewardPerBlock,
        rewardPerDay,
        rewardPrice: gohmPrice,
      },
    ];

    const balance = Number(pool.balance / 1e18);

    const swapPair = swapPairs?.find(pair => pair.id === pool.pair);
    const swapPair1d = swapPairs1d?.find(pair => pair.id === pool.pair);

    const tvl = (balance / Number(swapPair.totalSupply)) * Number(swapPair.reserveUSD);

    // const feeApyPerYear =
    //   swapPair && swapPair1d
    //     ? aprToApy((((pair?.volumeUSD - swapPair1d?.volumeUSD) * 0.0025 * 365) / pair?.reserveUSD) * 100, 3650) / 100
    //     : 0

    const roiPerBlock =
      rewards.reduce((previousValue, currentValue) => {
        return previousValue + currentValue.rewardPerBlock * currentValue.rewardPrice;
      }, 0) / tvl;

    const rewardAprPerHour = roiPerBlock * blocksPerHour;
    const rewardAprPerDay = rewardAprPerHour * 24;
    const rewardAprPerMonth = rewardAprPerDay * 30;
    const rewardAprPerYear = rewardAprPerMonth * 12;
  });
};
