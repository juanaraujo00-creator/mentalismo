/**
 * Web Notifications and Smartwatch forwarding helper with cross-platform support (iOS / Android / Desktop)
 */

export function isIOSSafari(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return isIOS;
}

export function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

export async function requestNotificationPermission(): Promise<{
  granted: boolean;
  reason?: "ios_needs_pwa" | "denied" | "unsupported" | "granted";
}> {
  if (typeof window === "undefined") {
    return { granted: false, reason: "unsupported" };
  }

  // Check if it's iOS and not yet in standalone PWA mode
  if (isIOSSafari() && !isStandalonePWA()) {
    if (!("Notification" in window)) {
      return { granted: false, reason: "ios_needs_pwa" };
    }
  }

  if (!("Notification" in window)) {
    return { granted: false, reason: "unsupported" };
  }

  if (Notification.permission === "granted") {
    return { granted: true, reason: "granted" };
  }

  if (Notification.permission === "denied") {
    return { granted: false, reason: "denied" };
  }

  try {
    // Handle both Promise and Callback implementations of requestPermission
    let permission: NotificationPermission;
    const requestPromise = Notification.requestPermission();
    
    if (requestPromise && typeof requestPromise.then === "function") {
      permission = await requestPromise;
    } else {
      permission = await new Promise((resolve) => {
        Notification.requestPermission((p) => resolve(p));
      });
    }

    if (permission === "granted") {
      return { granted: true, reason: "granted" };
    } else {
      return { granted: false, reason: "denied" };
    }
  } catch (err) {
    console.warn("Notification request error:", err);
    return { granted: false, reason: "unsupported" };
  }
}

export function sendPeekNotification(
  query: string,
  options?: {
    camouflaged?: boolean;
    customTitle?: string;
  }
) {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const isCamouflaged = options?.camouflaged ?? false;
  
  // Clean, direct presentation so on smartwatches the word appears immediately in large bold text
  const title = options?.customTitle || (isCamouflaged ? "Lembrete" : query);
  const body = isCamouflaged ? query : query;

  // Try Service Worker registration first (standard for Android & iOS PWA)
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready
      .then((reg) => {
        return reg.showNotification(title, {
          body: body,
          icon: "https://www.google.com/favicon.ico",
          badge: "https://www.google.com/favicon.ico",
          tag: "magic-peek-" + Date.now(),
          vibrate: [200, 100, 200, 100, 300] as any,
          data: { url: "/#peek" },
        } as any);
      })
      .catch((e) => {
        console.warn("ServiceWorker showNotification failed, trying standard Notification:", e);
        fallbackNotification(title, body);
      });
  } else {
    fallbackNotification(title, body);
  }
}

function fallbackNotification(title: string, body: string) {
  try {
    const notification = new Notification(title, {
      body: body,
      icon: "https://www.google.com/favicon.ico",
      tag: "magic-peek-" + Date.now(),
    });

    setTimeout(() => {
      try {
        notification.close();
      } catch {}
    }, 15000);
  } catch (e) {
    console.warn("Fallback Notification error:", e);
  }
}
