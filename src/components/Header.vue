<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">InvMng</a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <!--
          <a class="nav-link active" aria-current="page" href="#">Home</a>
          -->
            <router-link class="nav-link active" to="/deposits">Deposits</router-link>
          </li>
          <li class="nav-item">
            <router-link  class="nav-link active" to="/accounts">Accounts</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link active" to="/trusttransactions"
              >Trust transactions</router-link
            >
          </li>
          <li class="nav-item">
            <router-link class="nav-link active" to="/trustbalances">Trust balances</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link active" to="/summary">Summary</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>

</template>

<script>
export default {
  name: "Header",
  computed: {
    loginStatus() {
      return this.$store.state.loginStatus;
    },
    user() {
      //alert(this.$store.state.user);
      return this.$store.state.user;
    },
  },
  methods: {
    logout() {
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
    },
  },
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>