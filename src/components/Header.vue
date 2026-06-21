<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">InvMng  x<BIconBank/></a>
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
            <router-link  class="nav-link active" to="/accounts">Accounts</router-link>
          </li>

          <li class="nav-item">
            <!--
          <a class="nav-link active" aria-current="page" href="#">Home</a>
          -->
            <router-link class="nav-link active" to="/deposits">Deposits</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link active" to="/trustbalances">Trust balances</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link active" to="/trusttransactions"
              >Trust transactions</router-link
            >
          </li>
          <li class="nav-item">
            <router-link class="nav-link active" to="/summary">Summary</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link active" to="/summary2">Summary2</router-link>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="inputdataDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              input data
            </a>
            <ul class="dropdown-menu" aria-labelledby="inputdataDropdown">
              <li>
                <router-link class="dropdown-item" to="/inputdata2">inputdata2 - restore from db</router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/inputdatacsv">inputdatacsv</router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/inputdataMMF">inputdatammf</router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/inputdataCsvRakuten">inputdataCsvRakuten</router-link>
              </li>
            </ul>
          </li>
          <li class="nav-item">
            <router-link class="nav-link active" to="/setting" title="Settings" aria-label="Settings"><BIconGear/></router-link>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="debugDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Debug
            </a>
            <ul class="dropdown-menu" aria-labelledby="debugDropdown">
              <li>
                <router-link class="dropdown-item" to="/debug">Debug Tools</router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/debug/dividend-duplicates">Dividend duplicates</router-link>
              </li>
            </ul>
          </li>
        </ul>

        
        
        
        
      </div>
    </div>
  </nav>

</template>

<script>
import { BIconBank,BIconGear } from "bootstrap-icons-vue";

export default {
  name: "Header",
  components: {
    BIconBank,
    BIconGear,
  },
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
