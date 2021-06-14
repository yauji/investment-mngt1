//import Vue from 'vue'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';

//import vueMoment from 'vue-moment';

import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

//import "/public/bootstrap-datepicker-1.9.0/css/bootstrap-datepicker.min.css";
//import "/public/js/jquery-3.2.1.min.js";
//import "/public/bootstrap-datepicker-1.9.0/js/bootstrap-datepicker.min.js";
//import "/public/bootstrap-datepicker-1.9.0/js/bootstrap-datepicker.ja.min.js";
//import "/public/js/gijgo.min.js";
//import "/public/css/gijgo.min.css";

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

//Vue.use(require('vue-moment'));

//createApp(App).use(store).use(router).use(require('vue-moment')).mount('#app')
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

