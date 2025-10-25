import { NextRequest, NextResponse } from "next/server";
import {
  grantConsent,
  revokeConsent,
  verifyConsentForAccess,
  createConsentRequest,
} from "@/lib/consentManager";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, requestId, consentId, patientDid, doctorDid, permissions, expiryDays, signature } = body || {};

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    switch (action) {
      case 'grant':
        if (!requestId || !patientDid || !signature) {
          return NextResponse.json({ error: 'Missing required fields for grant' }, { status: 400 });
        }
        const consent = await grantConsent(requestId, patientDid, expiryDays);
        return NextResponse.json({ ok: true, consent }, { status: 200 });

      case 'revoke':
        if (!consentId || !patientDid || !signature) {
          return NextResponse.json({ error: 'Missing required fields for revoke' }, { status: 400 });
        }
        await revokeConsent(consentId, patientDid);
        return NextResponse.json({ ok: true }, { status: 200 });

      case 'verify':
        if (!consentId || !doctorDid) {
          return NextResponse.json({ error: 'Missing required fields for verify' }, { status: 400 });
        }
        const isValid = await verifyConsentForAccess(consentId, doctorDid);
        return NextResponse.json({ ok: true, valid: isValid }, { status: 200 });

      case 'request':
        if (!doctorDid || !patientDid || !permissions) {
          return NextResponse.json({ error: 'Missing required fields for request' }, { status: 400 });
        }
        const request = await createConsentRequest(doctorDid, patientDid, permissions, expiryDays);
        return NextResponse.json({ ok: true, request }, { status: 200 });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
