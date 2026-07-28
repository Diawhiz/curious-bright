import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { prisma } from './prisma';

const expo = new Expo();

export async function sendPushNotification(userId: string, title: string, body: string, data?: any) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushToken: true }
    });

    if (!user) return;

    // Save notification to DB for the in-app screen
    await prisma.notification.create({
      data: {
        userId,
        title,
        body,
      }
    });

    if (!user.pushToken) return; // User has not registered a push token

    if (!Expo.isExpoPushToken(user.pushToken)) {
      console.error(`Push token ${user.pushToken} is not a valid Expo push token`);
      return;
    }

    const messages: ExpoPushMessage[] = [{
      to: user.pushToken,
      sound: 'default',
      title,
      body,
      data,
    }];

    const chunks = expo.chunkPushNotifications(messages);
    
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('Error sending push chunk:', error);
      }
    }
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
}
