import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { PrismaClient } from '@curious-bright/database';

const expo = new Expo();
const prisma = new PrismaClient();

export async function sendPushNotification(userId: string, title: string, body: string, data?: any) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushToken: true }
    });

    if (!user) return;

    await prisma.notification.create({
      data: {
        userId,
        title,
        body,
      }
    });

    if (!user.pushToken) return;

    if (!Expo.isExpoPushToken(user.pushToken)) return;

    const messages: ExpoPushMessage[] = [{
      to: user.pushToken,
      sound: 'default',
      title,
      body,
      data,
    }];

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
}
