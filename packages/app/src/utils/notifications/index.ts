import { useToast } from "vue-toastification";
import Balance from "../../components/notifications/Balance.vue";
import Connection from "../../components/notifications/Connection.vue";
import ConnectionSuccess from "../../components/notifications/ConnectionSuccess.vue";
import ConnectionFaild from "../../components/notifications/ConnectionFaild.vue";

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? process.env.VUE_APP_NETWORK_ID
  : "1";

const toast = useToast();
let toastID: any;
export const checkConnection = (store: any) => {
  if (!store.getters["accounts/isUserConnected"]) {
    dismissNotification();
    toastID = toast.info(Connection);
    return false;
  }

  return true;
};
export const checkBalance = (balance: number) => {
  if (balance == 0) {
    dismissNotification();
    toastID = toast.info(Balance);
    return false;
  }

  return true;
};

export const checkAvailability = (amount: number, balance: number) => {
  if (amount > balance) {
    dismissNotification();
    toastID = toast.info(Balance);
    return false;
  }

  return true;
};

export const showConnectResult = (store: any) => {
  if (store.getters["accounts/isUserConnected"]) {
    dismissNotification();
    toastID = toast.success(ConnectionSuccess);
    return true;
  }

  toastID = toast.error(ConnectionFaild);
  return false;
};

function dismissNotification() {
  if (toastID || toastID === 0) {
    toast.dismiss(toastID);
  }
}
