//import Vue from 'vue'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';

import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

//Vue.use(BootstrapVue)
//createApp(App).use(BootstrapVue)

import {
    applyPolyfills,
    defineCustomElements,
} from '@aws-amplify/ui-components/loader';

Amplify.configure(aws_exports);
applyPolyfills().then(() => {
    defineCustomElements(window);
});

createApp(App).use(store).use(router).mount('#app')
//createApp(App).use(store).use(router).use(BootstrapVue).mount('#app')
//Vue(App).use(store).use(router).mount('#app')

//createApp(App).config.productionTip = false

/*
new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>'
  })
  */

