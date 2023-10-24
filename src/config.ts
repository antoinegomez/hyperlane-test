import { MultiProvider } from "@hyperlane-xyz/sdk";
import { ChainMetadata, RouterConfig, chainMetadata } from '@hyperlane-xyz/sdk';

export type HelloWorldConfig = RouterConfig;

let mp: MultiProvider | null = null;

export type ChainConfig = {
  name: string;
  rpcUrl?: string | null;
};

export function getMultiProvider(origin: ChainConfig, destination: ChainConfig): MultiProvider {
    if (mp === null) {
      const config = {
        [origin.name]: {
          ...chainMetadata[origin.name],
          rpcUrls: origin.rpcUrl ? [{ http: origin.rpcUrl }] : chainMetadata[origin.name].rpcUrls,
        } as ChainMetadata,
        [destination.name]: {
          ...chainMetadata[destination.name],
          rpcUrls: destination.rpcUrl ? [{ http: destination.rpcUrl }] : chainMetadata[destination.name].rpcUrls,
        } as ChainMetadata,
      }
      mp = new MultiProvider(config)
    }

    return mp
}
