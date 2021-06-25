<template>
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <a class="navbar-brand" href="#">Inv Mng</a>
  <!--
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
-->
<!--
  <div class="collapse navbar-collapse" id="navbarSupportedContent">
    -->
    <ul class="navbar-nav mr-auto">
      <li class="nav-item active">
        <router-link to="/deposits">Deposits</router-link>
      </li>
      | 
      <li class="nav-item active">
        <router-link to="/accounts">Accounts</router-link>
      </li>
      | 
      <li class="nav-item active">
        <router-link to="/trusttransactions">Trust transactions</router-link>
      </li>
      | 
      <li class="nav-item active">
        <router-link to="/trustbalances">Trust balances</router-link>
      </li>
      | 
      <li class="nav-item active">
        <router-link to="/summary">Summary</router-link>
      </li>

    </ul>
<!--

  </div>
  -->
</nav>

</template>

<script>

export default {
  name: 'Header',
  computed: {
    loginStatus () {
      return this.$store.state.loginStatus
    },
    user () {
    //alert(this.$store.state.user);
      return this.$store.state.user
    }
  },
  methods: {
    logout () {
      /*
        firebase.auth().signOut()
        .then(() => {
        this.$router.push('/')
        window.location.reload() // 保持してた不要な情報を一度クリア(vuexはきえない)
        })
        .catch(function (error) {
        const errorCode = error.code
          const errorMessage = error.message
        alert(errorMessage)
        })
        */
    }
}
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>