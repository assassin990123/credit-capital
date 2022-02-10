import { useToast } from "vue-toastification";

const toast = useToast();

export const checkConnection = (store: any) => {
  if (!store.getters["accounts/isUserConnected"]) {
    toast.warning("Please connect your wallet!");
    return false;
  }

  return true;
};

export const checkBalance = (balance: number) => {
  if (balance <= 0) {
    toast.warning("invalid balance!");
  }

  return true;
};
