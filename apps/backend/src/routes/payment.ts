import express from 'express';
import crypto from 'crypto';
import { prisma } from '@curious-bright/database';

const router = express.Router();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function paystackRequest(
  method: 'GET' | 'POST',
  path: string,
  body?: Record<string, unknown>,
) {
  const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res.json();
}

// ── POST /payment/initialize ──────────────────────────────────────────────────
// Initialise a Paystack transaction and return the checkout URL + reference.
router.post('/initialize', async (req, res) => {
  const { email, amount, metadata } = req.body;

  if (!email || !amount) {
    return res.status(400).json({ error: 'email and amount are required' });
  }

  try {
    const data = await paystackRequest('POST', '/transaction/initialize', {
      email,
      // Paystack expects amount in kobo (multiply naira by 100)
      amount: Math.round(Number(amount) * 100),
      metadata: metadata ?? {},
      callback_url: `${
        process.env.APP_URL ?? 'https://app.curiousbright.com.ng'
      }/payment/verify`,
    });

    if (!data.status) {
      return res.status(502).json({ error: data.message ?? 'Paystack error' });
    }

    return res.json({
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference: data.data.reference,
    });
  } catch (err) {
    console.error('[payment/initialize]', err);
    return res.status(500).json({ error: 'Failed to initialise transaction' });
  }
});

// ── GET /payment/verify/:reference ───────────────────────────────────────────
// Verify a Paystack transaction after the user returns from checkout.
router.get('/verify/:reference', async (req, res) => {
  const { reference } = req.params;

  try {
    const data = await paystackRequest(
      'GET',
      `/transaction/verify/${encodeURIComponent(reference)}`,
    );

    if (!data.status) {
      return res.status(502).json({ error: data.message ?? 'Paystack error' });
    }

    const txn = data.data;
    return res.json({
      status: txn.status,           // 'success' | 'failed' | 'abandoned'
      reference: txn.reference,
      amount: txn.amount / 100,     // convert kobo → naira
      currency: txn.currency,
      paidAt: txn.paid_at,
      customer: txn.customer,
      metadata: txn.metadata,
    });
  } catch (err) {
    console.error('[payment/verify]', err);
    return res.status(500).json({ error: 'Failed to verify transaction' });
  }
});

// ── POST /payment/webhook ─────────────────────────────────────────────────────
// Receive and process Paystack webhook events.
// Register this URL in your Paystack dashboard:
//   https://api.curiousbright.com.ng/payment/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  // Validate signature
  const signature = req.headers['x-paystack-signature'] as string;
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(req.body)
    .digest('hex');

  if (hash !== signature) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(req.body.toString());

  // Always respond 200 immediately so Paystack doesn't retry
  res.sendStatus(200);

  // Handle events asynchronously
  handleWebhookEvent(event).catch((err) =>
    console.error('[payment/webhook] handler error', err),
  );
});

async function handleWebhookEvent(event: { event: string; data: Record<string, unknown> }) {
  const { event: type, data } = event;
  console.log(`[payment/webhook] received: ${type}`);

  switch (type) {
    case 'charge.success': {
      // Payment was successful — update your database here as needed
      console.log('[payment/webhook] charge.success', data.reference);
      break;
    }
    case 'transfer.success': {
      console.log('[payment/webhook] transfer.success', data.reference);
      break;
    }
    case 'transfer.failed': {
      console.log('[payment/webhook] transfer.failed', data.reference);
      break;
    }
    default:
      console.log(`[payment/webhook] unhandled event: ${type}`);
  }
}

export default router;
