<template>
  <b-navbar toggleable="md" type="dark" variant="info">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand href="#">Pomodoro timer v0.1</b-navbar-brand>

    <!--
              {{user.email}}
              -->

    <b-collapse is-nav id="nav_collapse">
      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto" v-if="loginStatus">
        <b-nav-item href="/">Top</b-nav-item>
        <b-nav-item href="/#/chart" >Chart</b-nav-item>


        <b-nav-item-dropdown right>
          <!-- Using button-content slot -->
          <!--
          <template slot="button-content">
            <em>
              <span>{{user.displayName}}</span>
            </em>
          </template>
          -->
          <b-dropdown-item @click="logout()">Signout</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
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