import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

// Used by the institutional billing service to create orgs
router.post('/', async (req, res) => {
  // In a real app, protect this with an internal API key or service-to-service auth
  const { name, domain } = req.body;
  try {
    const org = await prisma.organization.create({
      data: {
        name,
        domain,
        planTier: 'FREE'
      }
    });
    res.json(org);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update an organization's subscription status (called by billing webhooks)
router.patch('/:id/subscription', async (req, res) => {
  const { id } = req.params;
  const { status, provider, providerRef, currentPeriodEnd } = req.body;
  
  try {
    const subscription = await prisma.subscription.upsert({
      where: { organizationId: id },
      create: {
        organizationId: id,
        status,
        provider,
        providerRef,
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd) : undefined,
      },
      update: {
        status,
        provider,
        providerRef,
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd) : undefined,
      }
    });

    res.json(subscription);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add users to an organization (the bulk invite calls this for each user)
router.post('/:id/users', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { organizationId: id }
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
