import { prisma } from '../lib/prisma';
import { typesenseClient } from '../lib/typesense';

export async function syncToTypesense() {
  console.log('[Search Sync] Starting sync to Typesense...');
  
  try {
    // Sync Users
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    });
    if (users.length > 0) {
      await typesenseClient.collections('users').documents().import(users, { action: 'upsert' });
    }

    // Sync Submissions
    const submissions = await prisma.submission.findMany({
      where: { status: 'APPROVED' },
      select: { id: true, title: true, description: true, status: true }
    });
    if (submissions.length > 0) {
      await typesenseClient.collections('submissions').documents().import(submissions, { action: 'upsert' });
    }

    // Sync Rooms
    const rooms = await prisma.room.findMany({
      where: { isPublic: true },
      select: { id: true, name: true, topic: true }
    });
    if (rooms.length > 0) {
      await typesenseClient.collections('rooms').documents().import(rooms, { action: 'upsert' });
    }

    console.log('[Search Sync] Sync completed successfully.');
  } catch (error) {
    console.error('[Search Sync] Error syncing to Typesense:', error);
  }
}

// Run the sync every 5 minutes (for demonstration; in production you'd use CDC or finer-grained events)
setInterval(syncToTypesense, 5 * 60 * 1000);
