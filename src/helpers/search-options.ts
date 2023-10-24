import z from 'zod'

const matchlingList = z.object({
  originDomain: z.literal('*').or(z.number()).or(z.array(z.number())).optional().nullable(),
  senderAddress: z.literal('*').or(z.string()).or(z.array(z.string())).optional().nullable(),
  destinationDomain: z.literal('*').or(z.number()).or(z.array(z.number())).optional().nullable(),
  recipientAddress: z.literal('*').or(z.string()).or(z.array(z.string())).optional().nullable(),
});

const assert = z.object({
  chain: z.string(),
  mailbox: z.string().optional().nullable(),
  rpcUrl: z.string().optional().nullable(),
  matchlingList: z.array(matchlingList).optional(),
  step: z.number().optional().nullable(),
  blocks: z.number().optional().nullable(),
});

export type t = z.infer<typeof assert>

export function of(input: unknown) {
  return assert.parse(input) 
}

