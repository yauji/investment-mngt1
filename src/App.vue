<template>
  <div id="app">
    <amplify-greetings></amplify-greetings>
    <Header />
    <router-view/>
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
  margin: 5px;  
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
export default {
    name: 'App',
  components:{
    Header
  },
  computed: {
    isSignedIn(){
      return this.$store.state.user !== null;
    },
  },
};
</script>
