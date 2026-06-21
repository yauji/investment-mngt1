<template>
  <div id="app">
    <!--
    <amplify-greetings></amplify-greetings>
    -->
    <Header />
    <main id="main">
      <router-view/>
    </main>
    <footer class="app-footer">
      <span>Version {{ version }}</span>
      <span>Date {{ currentDate }}</span>
    </footer>
  </div>
<!--
  <div v-if="isSignedIn">
    <amplify-greetings></amplify-greetings>
   <router-link custom v-slot="{ navigate }" :to="{ name: 'DepositIndex' }">
     <button @click="navigate">TOP</button>
   </router-link>    
  </div>



  <router-view/>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </div>
  <router-view/>
  -->
</template>
<!--
<template>
</template>
-->



<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  margin: 0px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#main {
  margin: 10px;
  flex: 1;
}

.app-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid #dee2e6;
  color: #6c757d;
  font-size: 0.8rem;
}


#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>

<script>
/*
import Header from '@/components/Header'
export default {
  name: 'App',
  components:{
    Header
  }
}
*/
import Header from '@/components/Header'
import appPackage from '../package.json'
export default {
  name: 'App',
  components:{
    Header
  },
  data() {
    return {
      version: appPackage.version,
      currentDate: new Intl.DateTimeFormat('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date()),
    };
  },
  computed: {
    isSignedIn(){
      return this.$store.state.user !== null;
    },
  },
};
</script>
