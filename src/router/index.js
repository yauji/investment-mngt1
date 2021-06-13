import { createRouter, createWebHistory } from 'vue-router'
import store from "@/store/index.js";
import Auth from "@aws-amplify/auth";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import SignIn from "../views/SignIn.vue";

import DepositIndex from "../views/deposit/Index.vue";
import DepositCreate from "../views/deposit/Create.vue";
import DepositShow from "../views/deposit/Show.vue";
import DepositEdit from "../views/deposit/Edit.vue";

/*
import AlbumIndex from "../views/album/Index.vue";
import AlbumCreate from "../views/album/Create.vue";
import AlbumEdit from "../views/album/Edit.vue";
import AlbumShow from "../views/album/Show.vue";
import PhotoCreate from "../views/photo/Create.vue"
*/
//import Home from '../views/Home.vue'

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
    path: "/deposits/:depositId/edit",
    name: "DepositEdit",
    component: DepositEdit,
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
