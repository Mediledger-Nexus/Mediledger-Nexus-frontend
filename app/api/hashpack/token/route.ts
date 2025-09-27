import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code, redirectUri, network } = await req.json();
    if (!code || !redirectUri) {
      return NextResponse.json({ error: "Missing code or redirectUri" }, { status: 400 });
    }

    const authBase = process.env.NEXT_PUBLIC_HASHPACK_AUTH_BASE || 'https://auth.hashpack.app';
    const clientId = process.env.HASHPACK_AUTH_CLIENT_ID || process.env.NEXT_PUBLIC_HASHPACK_AUTH_CLIENT_ID || process.env.NEXT_PUBLIC_HASHCONNECT_PROJECT_ID;
    const clientSecret = process.env.HASHPACK_AUTH_CLIENT_SECRET;

    if (!clientId) {
      return NextResponse.json({ error: "Missing HASHPACK client ID env" }, { status: 500 });
    }

    // Build token request (standard OAuth 2.0 Authorization Code)
    const body = new URLSearchParams();
    body.set('grant_type', 'authorization_code');
    body.set('code', code);
    body.set('redirect_uri', redirectUri);
    body.set('client_id', clientId);
    if (clientSecret) body.set('client_secret', clientSecret);
    if (network) body.set('network', String(network));

    const resp = await fetch(`${authBase}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      // Avoid caching sensitive requests
      cache: 'no-store',
    });

    const data = await resp.json().catch(() => ({} as any));
    if (!resp.ok) {
      return NextResponse.json({ error: data?.error || 'Token exchange failed', details: data }, { status: resp.status });
    }

    // Optionally enrich with accountId if present in id_token or response fields
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
