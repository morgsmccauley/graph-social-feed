import { near, log, json, BigInt } from "@graphprotocol/graph-ts"
import { Comment, Post } from '../generated/schema'

export function handleReceipt(
  receipt: near.ReceiptWithOutcome
): void {
  log.info("receipt: {}", [receipt.receipt.receiverId]);

  for (let i = 0; i < receipt.receipt.actions.length; i++) {
    const action = receipt.receipt.actions[i];

    log.info("action: {}", [action.kind.toString()]);

    if (action.kind !== near.ActionKind.FUNCTION_CALL) {
      return;
    }

    const functionCallAction = action.toFunctionCall();

    if (functionCallAction.methodName != "set") {
      return;
    }

    const args = functionCallAction.args;
    // log.info("args: {}", [args.toString()]);

    const argsJson = json.fromBytes(args).toObject();

    const data = argsJson.mustGet("data").toObject();

    for (let j = 0; j < data.entries.length; j++) {
      const entry = data.entries[j];

      const accountId = entry.key;
      const accountData = data.mustGet(accountId)

      const post = accountData.toObject().get("post");
      if (post) {
        const mainFeedPost = post.toObject().get("main");
        if (mainFeedPost) {
          log.info("Saving post for account: {}", [accountId])

          const newPost = new Post(accountId + receipt.block.header.height.toString() + "post");
          newPost.accountId = accountId;
          newPost.blockHeight = BigInt.fromU64(receipt.block.header.height);
          newPost.receiptId = receipt.receipt.id.toHex();
          newPost.blockTimestamp = BigInt.fromU64(receipt.block.header.timestampNanosec);
          newPost.content = mainFeedPost.toString();
          newPost.save();
        }

        const comment = post.toObject().get("comment");
        if (comment) {
          log.info("Found comment for account: {}, {}", [accountId, comment.toString()])

          const newComment = new Comment(accountId + receipt.block.header.height.toString() + "comment");
          newComment.accountId = accountId;
          newComment.blockHeight = BigInt.fromU64(receipt.block.header.height);
          newComment.receiptId = receipt.receipt.id.toHex();
          newComment.blockTimestamp = BigInt.fromU64(receipt.block.header.timestampNanosec);
          newComment.content = comment.toString();
          newComment.save();
        }
      }

      const index = accountData.toObject().get("index");
      if (index) {
        const like = index.toObject().get("like");
        if (like) {
          log.info("Found like for account: {}", [accountId])
        }
      }
    }
  }
}
