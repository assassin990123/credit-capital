import { useToast } from "vue-toastification";
import ToastComponent from "../../components/notifications/ToastComponent.vue";

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? process.env.VUE_APP_NETWORK_ID
  : "1";

const toast = useToast();
let toastID: any;
export const checkConnection = (store: any) => {
  if (!store.getters["accounts/isUserConnected"]) {
    dismissNotification();
    handleToasts("info", "Notification", "Please connect your wallet!");
    return false;
  }

  return true;
};

export const checkBalance = (balance: number) => {
  if (balance == 0) {
    dismissNotification();
    handleToasts("info", "Notification", "Amount must be greater than zero.");
    return false;
  }

  return true;
};

export const checkAvailability = (amount: number, balance: number) => {
  if (amount > balance) {
    dismissNotification();
    handleToasts("info", "Notification", "Amount exceeds your available balance.")
    return false;
  }

  return true;
};

export const showConnectResult = (store: any) => {
  if (store.getters["accounts/isUserConnected"]) {
    dismissNotification();
    handleToasts("success", "Notification", "Connected Successfully!")
    return true;
  }

  handleToasts("error", "Notification", "Connection Failed!")
  return false;
};

export const checkWalletConnect = () => {
  dismissNotification();
  handleToasts("info", "Notification", "Please unlock your wallet!")
  return false;
};

export const balanceExceeded = () => {
  dismissNotification();
  handleToasts("info", "Notification", "Please unlock your wallet!")
  return false;
};

function dismissNotification() {
  if (toastID || toastID === 0) {
    toast.dismiss(toastID);
  }
}


export const handleToasts = (type: string, title: string, text: string) => {
  // check type flag
  switch (type) {
    case "info":
      toastID = toast.info({
        component: ToastComponent,
        props:  {
            title: title,
            text: text
        }});
    break;
    case "warn":
      toastID = toast.warning({
        component: ToastComponent,
        props:  {
            title: title,
            text: text
        }});
    break;
    case "success":
      toastID = toast.success({
        component: ToastComponent,
        props:  {
            title: title,
            text: text
        }});
    break;
    case "error":
      toastID = toast.error({
        component: ToastComponent,
        props:  {
            title: title,
            text: text
        }});
    break;
  }
};