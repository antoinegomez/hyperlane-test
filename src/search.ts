import { ethers } from "ethers";
import { SearchOptions } from "./helpers";
import { chainMetadata, hyperlaneContractAddresses } from "@hyperlane-xyz/sdk";
import cli from "cli";
import { sleep } from "@hyperlane-xyz/utils";

function numberTopicValue(input: "*" | number | number[] | null | undefined) {
  if (input === null || input === "*" || typeof input === "undefined") {
    return null;
  }

  return Array.isArray(input)
    ? input.map((item) =>
        ethers.utils.hexZeroPad(ethers.utils.hexlify(item), 32),
      )
    : ethers.utils.hexZeroPad(ethers.utils.hexlify(input as number), 32);
}

function stringTopicValue(input: string | string[] | null | undefined) {
  if (input === null || input === "*" || typeof input === "undefined") {
    return null;
  }

  return Array.isArray(input)
    ? input.map((item) => ethers.utils.hexZeroPad(String(item), 32))
    : ethers.utils.hexZeroPad(String(input), 32);
}

export async function search({
  chain,
  rpcUrl,
  mailbox,
  matchlingList,
  blocks,
  step,
}: SearchOptions.t) {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl ?? chainMetadata[chain].rpcUrls[0].http);

  let mailboxAddress =
    mailbox ??
    hyperlaneContractAddresses[chain as keyof typeof hyperlaneContractAddresses]
      .mailbox;

  // only support one option for now
  // first time using eth_getLogs and did not have time to test
  // and grasp how to make it use with multi args
  // (or yeah could have made multi searches instead!)
  const option = matchlingList?.length ? matchlingList[0] : {};

  let topics = undefined;
  if (option.originDomain) {
    topics = [
      null,
      numberTopicValue(option.originDomain),
      stringTopicValue(option.senderAddress),
      stringTopicValue(option.recipientAddress),
    ];
  } else if (option.destinationDomain) {
    topics = [
      null,
      stringTopicValue(option.senderAddress),
      numberTopicValue(option.destinationDomain),
      stringTopicValue(option.recipientAddress),
    ];
  } else if (option.senderAddress) {
    topics = [
      null,
      stringTopicValue(option.senderAddress),
      numberTopicValue(option.destinationDomain),
      stringTopicValue(option.recipientAddress),
    ];
  }

  const currentBlock = await provider.getBlockNumber();

  console.log('search:\n', JSON.stringify({
    address: mailboxAddress,
    topics,
  }, null, 2), '\n');

  const blocksCount = blocks || 100_000;
  const stepCount = step || 50_000;
  let index = 0;
  const results: ethers.providers.Log[] = [];
  while (index < blocksCount) {
    const fromBlock = currentBlock - blocksCount + index;
    const toBlock = fromBlock + stepCount;
    cli.info(`get fromBlock=${fromBlock} toBlock=${toBlock}`);
    await provider
      .getLogs({
        address: mailboxAddress,
        topics,
        fromBlock,
        toBlock,
      })
      .then((rows) => {
        results.push(
          ...rows.map((row) => ({
            ...row,
            data: ethers.utils.hexStripZeros(row.data),
            address: ethers.utils.hexStripZeros(row.address),
            topics: row.topics.map((topic) =>
              ethers.utils.hexStripZeros(topic),
            ),
          })),
        );
        index += stepCount;
        return sleep(1000);
      });
  }
  results.forEach((item) => {
    const { data, topics, address, ...rest } = item;
    console.table([rest]);
    console.log("data:", data);
    console.log("\n\n");
  });
}
