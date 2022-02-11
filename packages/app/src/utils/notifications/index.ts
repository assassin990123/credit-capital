import { store } from "@/store";
import { useToast } from "vue-toastification";
import Balance from "./Balance.vue";
import Connection from "./Connection.vue";
import ConnectionSuccess from "./ConnectionSuccess.vue";
import ConnectionFaild from "./ConnectionFaild.vue";
const ChainID = process.env.VUE_APP_NETWORK_ID
  ? process.env.VUE_APP_NETWORK_ID
  : "1";

const toast = useToast();

export const checkConnection = (store: any) => {
    if (!store.getters["accounts/isUserConnected"]) {
        toast.info(Connection);
        return false;
    }

    return true;
}
export const checkBalance = (balance: number) => {
    if (balance <= 0) {
        toast.info(Balance);
        return false;
    }

    return true;
}

export const showConnectResult = (store: any) => {
    if (store.getters["accounts/isUserConnected"]) {
        toast.success(ConnectionSuccess);
        return true;
    }

    toast.error(ConnectionFaild);
    return false;
}