import { KiranaNotification } from '@/types';

let store: KiranaNotification[] = [];

export function addNotifications(notifs: KiranaNotification[]) {
    store = [...notifs, ...store].slice(0, 200);
}

export function listNotifications(): KiranaNotification[] {
    return store;
}
