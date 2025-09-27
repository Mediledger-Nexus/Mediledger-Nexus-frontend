import { NextRequest, NextResponse } from "next/server";
import { Client, AccountId, PrivateKey, TopicCreateTransaction } from "@hashgraph/sdk";

function getClient() {
  const network = (process.env.HEDERA_NETWORK || process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet').toLowerCase();
  const operatorId = process.env.HEDERA_ACCOUNT_ID || process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID;
  const operatorKey = process.env.HEDERA_PRIVATE_KEY || process.env.NEXT_PUBLIC_HEDERA_PRIVATE_KEY;
  if (!operatorId || !operatorKey) return null;

  const client = network === 'mainnet'
    ? Client.forMainnet()
    : network === 'previewnet'
      ? Client.forPreviewnet()
      : Client.forTestnet();

  return client.setOperator(AccountId.fromString(operatorId), PrivateKey.fromString(operatorKey));
}

export async function POST(_req: NextRequest) {
  try {
    const client = getClient();
    if (!client) {
      return NextResponse.json({ error: 'Hedera operator not configured on server' }, { status: 500 });
    }

    const tx = await new TopicCreateTransaction().execute(client);
    const receipt = await tx.getReceipt(client);
    const topicId = receipt.topicId?.toString();
    if (!topicId) {
      return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, topicId }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
