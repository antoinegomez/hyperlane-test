# Hyperlane cli


## Installation

`npm install`

`./cli --help`

## Create .env files

Store your wallet secret key in the .env file in this format:

```
SECRET_KEY=xxxxxx
```

## send messages

Use the send command to send a message from origin chain to destination chain.


```
Usage: cli send [options]

Send a message from one chain to another using hyperlane

Options:
  -o, --origin <char>         origin chain
  -d, --destination <char>    destination chain
  --mailbox <char>            use custom mailbox address
  --originRpcUrl <char>       origin rpc url
  --destinationRpcUrl <char>  destionation rpc url
  -r, --recipient <char>      use custom recipient address
  -m, --message <char>        message to send
  -h, --help                  display help for command
```

*Sample command:*

`./cli send -o sepolia --originRpcUrl https://ethereum-sepolia.publicnode.com -d bsctestnet -m Emergence`

## search messages

Search messages sent 


Note that the MatchtingList JSON input is for now only supporting search with one element.

```
Usage: cli search [options] [input]

Search for messages on a chain mailbox

Arguments:
  input                 MatchlingList JSON input

Options:
  -c, --chain <char>    chain name
  --rpcUrl <char>       rpcUrl
  -m, --mailbox <char>  mailbox address
  --blocks <number>     number of blocks to paginate from current block
  --step <number>       explore pagination step
  -h, --help            display help for command
```


*Sample command:*

`./cli search -c sepolia --rpcUrl https://ethereum-sepolia.publicnode.com '[{"destinationDomain":97,"senderAddress":"0x139c5080A98aBB134afe140d1121F820380eDFCc"}]'`
