import { hyperlaneContractAddresses } from '@hyperlane-xyz/sdk';
import z from 'zod'

type keys = keyof typeof hyperlaneContractAddresses 
const keys = (Object.keys(hyperlaneContractAddresses) as unknown) as [keys, ...keys[]];

const assert = z.object({
    origin: z.enum(keys),
    originRpcUrl: z.string().optional().nullable(),
    destination: z.enum(keys),
    destinationRpcUrl: z.string().optional().nullable(),
    mailbox: z.string().optional().nullable(),
    recipient: z.string().optional().nullable(),
    message: z.string()
  });

export type t = z.infer<typeof assert>

export function of(input: unknown) {
  return assert.parse(input) 
}

