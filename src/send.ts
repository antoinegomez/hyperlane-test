import "dotenv/config";
import { ethers } from "ethers";
import {
  HyperlaneCore,
  HyperlaneIgp,
  hyperlaneContractAddresses,
} from "@hyperlane-xyz/sdk";
import { addressToBytes32 } from "@hyperlane-xyz/utils";
import cli from "cli";
import { SendOptions } from "./helpers";
import { getMultiProvider } from "./config";

export async function sendMessage(options: SendOptions.t): Promise<any> {
  const multiProvider = getMultiProvider(
    { name: options.origin, rpcUrl: options.originRpcUrl },
    { name: options.destination, rpcUrl: options.destinationRpcUrl },
  );

  cli.info(
    `Prepare to send message from ${options.origin} to ${options.destination}`,
  );

  const signer = new ethers.Wallet(process.env.SECRET_KEY || "");
  multiProvider.setSharedSigner(signer);

  const envConfig = {
    [options.origin]: { ...hyperlaneContractAddresses[options.origin] },
    [options.destination]: {
      ...hyperlaneContractAddresses[options.destination],
    },
  };

  // custom mailbox
  if (options.mailbox) {
    envConfig[options.origin].mailbox = options.mailbox;
  }

  const core = HyperlaneCore.fromAddressesMap(envConfig, multiProvider);
  const igp = HyperlaneIgp.fromAddressesMap(envConfig, multiProvider);

  const mailbox = core.getContracts(options.origin).mailbox;
  const defaultIgp = igp.getContracts(
    options.origin,
  ).defaultIsmInterchainGasPaymaster;

  const destinationDomain = multiProvider.getDomainId(options.destination);
  const recipient =
    options.recipient ??
    hyperlaneContractAddresses[options.destination].testRecipient;

  cli.info(
    `Creating messageTx to recipient ${recipient} on domainId ${destinationDomain} to mailbox ${mailbox.address}`,
  );
  cli.debug(`message=0x${Buffer.from(options.message).toString("hex")}`);

  const messageTx = await mailbox.dispatch(
    destinationDomain,
    addressToBytes32(recipient),
    `0x${Buffer.from(options.message).toString("hex")}`,
  );
  cli.info("Handle transaction");
  const receipt = await multiProvider.handleTx(options.origin, messageTx);
  const sentMessages = core.getDispatchedMessages(receipt);
  const sentMessage = sentMessages[0];
  cli.info(
    `Sent message from ${options.origin} to ${recipient} on ${options.destination} with messageId ${sentMessage.id}`,
  );
  const gas = 100_000;
  cli.info("Quote for gas payment");
  const value = await defaultIgp.quoteGasPayment(destinationDomain, gas);
  cli.info("Pay for gas");
  const paymentTx = await defaultIgp.payForGas(
    sentMessage.id,
    destinationDomain,
    gas,
    await multiProvider.getSignerAddress(options.origin),
    { value },
  );
  await paymentTx.wait();

  cli.info("Waiting for message delivery...");
  await core.waitForMessageProcessed(receipt, 5000, 120 / 5);
  cli.ok("message delivered");
}
