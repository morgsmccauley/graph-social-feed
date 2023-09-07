import { near, BigInt } from "@graphprotocol/graph-ts"
import { ExampleEntity } from "../generated/schema"

export function handleReceipt(
  receiptWithOutcome: near.ReceiptWithOutcome
): void {
  console.log(receiptWithOutcome.receipt.id.toString())
}

export function handleBlock(
  block: near.Block
): void {
  console.log(block.header.height.toString())
}
