import { useMintForestStore } from '@/projects/mint-forest/store/use-mint-forest-store';

const TypeTitles = {
  collect: 'Collected MF',
  task: 'Completed task',
  box: 'Opened a Mystery MF Box',
};

export const useAlert = () => {
  const { addAlert } = useMintForestStore();

  const error = (msg?: string, duration?: number) => {
    if (addAlert && msg) {
      addAlert(msg, 'error', duration);
    }
  };

  const warning = (msg?: string, duration?: number) => {
    if (addAlert && msg) {
      addAlert(msg, 'info', duration);
    }
  };

  const success = (msg?: string, duration?: number) => {
    if (addAlert && msg) {
      addAlert(msg, 'success', duration);
    }
  };

  const energyToast = (type: 'collect' | 'task' | 'box', amount: number | string, duration?: number) => {
    if (addAlert) {
      addAlert(`${TypeTitles[type]} ${amount}`, 'success', duration);
    }
  };

  return { error, warning, success, energyToast };
};
