import { createRouter, createWebHistory } from "vue-router";
import HomePage from "./pages/Home.vue";
import DashboardPage from "./pages/Dashboard.vue";
import RewardsPage from "./pages/Rewards.vue";
import StakePage from "./pages/Stake.vue";
import SwapPage from "./pages/Swap.vue";
import TreasuryPage from "./pages/Treasury.vue";

const routeInfos = [
    {
        path : "/",
        component : HomePage
    },
    {
        path : "/dashboard",
        component : DashboardPage
    },
    {
        path : "/stake",
        component : StakePage
    },
    {
        path : "/reward",
        component : RewardsPage
    },
    {
        path : "/swap",
        component : SwapPage
    },
    {
        path : "/treasury",
        component : TreasuryPage
    }
]

const router = createRouter({
    history : createWebHistory(),
    routes : routeInfos
})

export default router;
