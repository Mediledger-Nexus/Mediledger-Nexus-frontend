import { NextRequest, NextResponse } from "next/server";
import {
  Client,
  PrivateKey,
  AccountId,
  TopicId,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { type, event } = body || {};
    if (!type || !event) {
      return NextResponse.json({ error: 'Missing type or event' }, { status: 400 });
    }

    const topicStr = process.env.HCS_TOPIC_ID || process.env.NEXT_PUBLIC_HCS_TOPIC_ID;
    if (!topicStr) {
      return NextResponse.json({ error: 'Missing HCS_TOPIC_ID env' }, { status: 500 });
    }

    const client = getClient();
    if (!client) {
      // Fail clearly so caller knows logging isn't configured
      return NextResponse.json({ error: 'Hedera operator not configured on server' }, { status: 500 });
    }

    const payload = {
      _kind: 'mediledger_hcs_event',
      event_type: type,
      event,
      ts: new Date().toISOString(),
    };

    const tx = await new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(topicStr))
      .setMessage(JSON.stringify(payload))
      .execute(client);

    const receipt = await tx.getReceipt(client);
    const sequence = receipt.topicSequenceNumber?.toString() || '';
    return NextResponse.json({ ok: true, sequence }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
