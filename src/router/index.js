import { createRouter, createWebHistory } from 'vue-router'
import store from "@/store/index.js";
import Auth from "@aws-amplify/auth";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import SignIn from "../views/SignIn.vue";

import DepositIndex from "../views/deposit/Index.vue";
import DepositCreate from "../views/deposit/Create.vue";
import DepositShow from "../views/deposit/Show.vue";
import DepositEdit from "../views/deposit/Edit.vue";
import DepositFinish from "../views/deposit/Finish.vue";

import DepositCreateText from "../views/deposit/CreateText.vue";



import AccountIndex from "../views/account/Index.vue";
import AccountCreate from "../views/account/Create.vue";
import AccountShow from "../views/account/Show.vue";
import AccountEdit from "../views/account/Edit.vue";

import TrustTransactionIndex from "../views/trusttransaction/Index.vue";
import TrustTransactionCreate from "../views/trusttransaction/Create.vue";
import TrustTransactionShow from "../views/trusttransaction/Show.vue";
import TrustTransactionEdit from "../views/trusttransaction/Edit.vue";

import TrustBalanceIndex from "../views/trustbalance/Index.vue";
import TrustBalanceCreate from "../views/trustbalance/Create.vue";
import TrustBalanceShow from "../views/trustbalance/Show.vue";
import TrustBalanceEdit from "../views/trustbalance/Edit.vue";

import Summary from "../views/Summary.vue";
import Setting from "../views/Setting.vue";

import Inputdata from "../views/Inputdata.vue";

const routes = [
  {
    path: '/',
    redirect: { name: "DepositIndex"}
  },
  {
    path: "/signin",
    name: "SignIn",
    component: SignIn,
  },  
  {
    path: "/deposits",
    name: "DepositIndex",
    component: DepositIndex,
    meta: { requireAuth: true },
  },
  {
    path: "/deposits/create",
    name: "DepositCreate",
    component: DepositCreate,
    meta: { requireAuth: true },
  },
  {
    path: "/deposits/createText",
    name: "DepositCreateText",
    component: DepositCreateText,
    meta: { requireAuth: true },
  },
  {
    path: "/deposits/:depositId/edit",
    name: "DepositEdit",
    component: DepositEdit,
    props: true,
    meta: { requireAuth: true },
  },
  {
    path: "/deposits/:depositId/finish",
    name: "DepositFinish",
    component: DepositFinish,
    props: true,
    meta: { requireAuth: true },
  },
  {
    path: "/deposits/:depositId",
    name: "DepositShow",
    component: DepositShow,
    props: true,
    meta: { requireAuth: true },
  },
  
  {
    path: "/accounts",
    name: "AccountIndex",
    component: AccountIndex,
    meta: { requireAuth: true },
  },
  {
    path: "/accounts/create",
    name: "AccountCreate",
    component: AccountCreate,
    meta: { requireAuth: true },
  },
  {
    path: "/accounts/:accountId/edit",
    name: "AccountEdit",
    component: AccountEdit,
    props: true,
    meta: { requireAuth: true },
  },
  {
    path: "/accounts/:accountId",
    name: "AccountShow",
    component: AccountShow,
    props: true,
    meta: { requireAuth: true },
  },
  

  {
    path: "/trusttransactions",
    name: "TrustTransactionIndex",
    component: TrustTransactionIndex,
    meta: { requireAuth: true },
  },
  {
    path: "/trusttransactions/create",
    name: "TrustTransactionCreate",
    component: TrustTransactionCreate,
    meta: { requireAuth: true },
  },
  {
    path: "/trusttransactions/:trustTransactionId/edit",
    name: "TrustTransactionEdit",
    component: TrustTransactionEdit,
    props: true,
    meta: { requireAuth: true },
  },
  {
    path: "/trusttransactions/:trustTransactionId",
    name: "TrustTransactionShow",
    component: TrustTransactionShow,
    props: true,
    meta: { requireAuth: true },
  },
  
  {
    path: "/trustbalances",
    name: "TrustBalanceIndex",
    component: TrustBalanceIndex,
    meta: { requireAuth: true },
  },
  {
    path: "/trustbalances/create",
    name: "TrustBalanceCreate",
    component: TrustBalanceCreate,
    meta: { requireAuth: true },
  },
  {
    path: "/trustbalances/:TrustBalanceId/edit",
    name: "TrustBalanceEdit",
    component: TrustBalanceEdit,
    props: true,
    meta: { requireAuth: true },
  },
  {
    path: "/trustbalances/:TrustBalanceId",
    name: "TrustBalanceShow",
    component: TrustBalanceShow,
    props: true,
    meta: { requireAuth: true },
  },
  
  
  {
    path: "/summary",
    name: "Summary",
    component: Summary,
    props: true,
    meta: { requireAuth: true },
  },
  {
    path: "/setting",
    name: "Setting",
    component: Setting,
    props: true,
    meta: { requireAuth: true },
  },
  {
    path: "/inputdata",
    name: "Inputdata",
    component: Inputdata,
    props: true,
    meta: { requireAuth: true },
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})


function getAuthenticatedUser() {
  return Auth.currentAuthenticatedUser()
    .then((data) => {
      if (data && data.signInUserSession) {
        store.commit("setUser", data);
        return data;
      }
    })
    .catch((e) => {
      console.error(e);
      store.commit("setUser", null);
      return null;
    });
}

let user;

router.beforeResolve(async (to, from, next) => {
  //await getAuthenticatedUser();
  user = await getAuthenticatedUser();

  if (to.name === "SignIn" && user) {
    return next({ name: "AlbumIndex" });
  }

  if (to.matched.some((record) => record.meta.requireAuth) && !user) {
    return next({ name: "SignIn" });
  }

  return next();
});

onAuthUIStateChange((authState, authData) => {
  if (authState === AuthState.SignedIn && authData) {
    router.push({ name: "AlbumIndex" });
  }
  if (authState === AuthState.SignedOut) {
    router.push({ name: "SignIn" });
  }
});

export default router
