import { ReplaySubject, Subject } from 'rxjs';

export const NotifyEvent = {
  LOGIN_REFRESH: 'login_refresh',
  USER_INFO_REFRESH: 'user_info_refresh',
  ENERGY_REFRESH: 'energy_refresh',
  CLAIM_COMPLETE: 'claim_complete',
  SHOW_GREENID: 'show_greenid',
};

class NotifyService {
  private _notify: Subject<any> = new Subject();

  constructor() {}

  notify(eventName: string, payload?: any) {
    return this._notify.next({ name: eventName, payload });
  }

  subscribe(callbackList: { name: string; callback: (payload?: any) => void }[]) {
    const sub = this._notify.subscribe((e: { name: string; payload: any }) => {
      const activeCallback = callbackList.find((item) => item.name === e.name);
      activeCallback && activeCallback.callback(e.payload);
    });
    return sub;
  }
}

export const notifyService = new NotifyService();
