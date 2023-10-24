import { Command } from "commander";
import { ZodError } from "zod";
import cli from "cli";
import { SearchOptions, SendOptions } from "./helpers";
import { sendMessage } from "./send";
import { search } from "./search";
import { fromZodError } from "zod-validation-error";

const program = new Command();

program
  .command("send")
  .description("Send a message from one chain to another using hyperlane")
  .option("-o, --origin <char>", "origin chain")
  .option("-d, --destination <char>", "destination chain")
  .option("--mailbox <char>", "use custom mailbox address")
  .option("--originRpcUrl <char>", "origin rpc url")
  .option("--destinationRpcUrl <char>", "destionation rpc url")
  .option("-r, --recipient <char>", "use custom recipient address")
  .option("-m, --message <char>", "message to send")
  .action((options) => {
    sendMessage(SendOptions.of(options))
      .then(() => cli.ok("done"))
      .catch((err) => cli.error(err.message));
  });

program
  .command("search")
  .description("Search for messages on a chain mailbox")
  .option("-c, --chain <char>", "chain name")
  .option("--rpcUrl <char>", "rpcUrl")
  .option("-m, --mailbox <char>", "mailbox address")
  .option(
    "--blocks <number>",
    "number of blocks to paginate from current block",
    parseInt,
  )
  .option("--step <number>", "explore pagination step", parseInt)
  .argument("[input]", "MatchlingList JSON input", JSON.parse)
  .action((input, options) => {
    search(
      SearchOptions.of({
        chain: options.chain,
        rpcUrl: options.rpcUrl,
        mailbox: options.mailbox,
        blocks: options.blocks,
        step: options.step,
        matchlingList: input,
      }),
    )
      .then(() => cli.ok("done"))
      .catch((err) => cli.error(err.message));
  });

try {
  program.parse();
} catch (err: unknown) {
  if (err instanceof ZodError) {
    program.error(fromZodError(err).message);
  } else if (err instanceof Error) {
    program.error(err.message);
  } else {
    program.error("Unknown error");
  }
  process.exit(1);
}
