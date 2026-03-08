/**
 * Request browser notification permission and show notifications.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

export const showBrowserNotification = (title: string, body?: string, icon?: string) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body: body || '',
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
    });
  } catch {
    // Silent fail on mobile/unsupported
  }
};
