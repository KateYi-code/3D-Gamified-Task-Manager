export const MAX_BACKGROUND_TIME = 60 // Maximum allowed background time (seconds)
export const WARNING_INTERVAL = 15 // Warning interval (seconds)

export class NotificationManager {
  private static instance: NotificationManager;
  private hasPermission: boolean = false;
  private lastWarningTime: number = 0;
  private isIOS: boolean = false;

  private constructor() {
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async requestPermission(): Promise<boolean> {
    try {
      if (this.isIOS) {
        if (window.matchMedia('(display-mode: standalone)').matches) {
          this.hasPermission = true;
          return true;
        } else {
          // toast.info("Please add this app to your home screen for notifications to work on iOS");
          return false;
        }
      }

      if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return false;
      }

      const permission = await Notification.requestPermission();
      this.hasPermission = permission === "granted";
      return this.hasPermission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  sendNotification(title: string, options?: NotificationOptions) {
    if (!this.hasPermission) return;
    
    if (this.isIOS) {
      if ('serviceWorker' in navigator && 'Notification' in window) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            icon: "/pwa/favicon.png",
            ...options,
          });
        });
      }
    } else {
      new Notification(title, {
        icon: "/pwa/favicon.png",
        ...options,
      });
    }
  }

  sendWarningNotification(timeInBackground: number): boolean {
    const currentTime = Date.now();
    if (currentTime - this.lastWarningTime < WARNING_INTERVAL * 1000) {
      return false;
    }

    this.sendNotification("Warning", {
      body: `You've been away for ${timeInBackground} seconds, please return soon!`,
    });
    
    this.lastWarningTime = currentTime;
    return true;
  }

  hasNotificationPermission(): boolean {
    return this.hasPermission;
  }

  resetWarningTimer() {
    this.lastWarningTime = 0;
  }
} 