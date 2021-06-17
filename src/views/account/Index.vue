<template>
  <div>
    <h1>Accounts</h1>



    <table class="table table-striped">
      <thead>
        <tr>
          <th>currency</th>
          <th>balance</th>
          <th>exchangeRate</th>
          <th>memo</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(account, index) in accounts" :key="account.id">
          <td>{{ account.currency }}</td>
          <td>{{ account.balance }}</td>
          <td>{{ account.exchangeRate }}</td>
          <td>{{ account.memo }}</td>
          <td>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{ name: 'AccountShow', params: { accountId: account.id } }"
            >
              <button class="btn btn-primary" @click="navigate">Show</button>
            </router-link>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{ name: 'AccountEdit', params: { accountId: account.id } }"
            >
              <button class="btn btn-primary" @click="navigate">Edit</button>
            </router-link>
            <button
              class="btn btn-primary"
              @click="deleteAccount(index, account.id)"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    
    <router-link custom v-slot="{ navigate }" :to="{ name: 'AccountCreate' }">
      <button class="btn btn-primary" @click="navigate">Add Account</button>
    </router-link>
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { listAccounts } from "../../graphql/queries";
import { deleteAccount } from "../../graphql/mutations";

//import { listAccounts } from "../../graphql/queries";
//import { deleteAccount } from "../../graphql/mutations";

import moment from "moment";

export default {
  name: "AccountIndex",
  async created() {
    //this.getAccounts();
    this.getAccounts();
  },
  data() {
    return {
      //albums: [],
      accounts: [],
    };
  },
  methods: {
    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
      //      return moment(date).format('YYYY/MM/DD HH:mm:SS')
    },
    async getAccounts() {
      await API.graphql({
        query: listAccounts,
      })
        .then((result) => {
          console.log(result);
          this.accounts = result.data.listAccounts.items;
          //this.Accounts = result.data.listAccounts.items;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async deleteAccount(index, accountId) {
      if (!confirm("Delete Account?")) return;

      await API.graphql({
        //query: deleteAccount,
        query: deleteAccount,
        variables: { input: { id: accountId } },
      })
        .then((result) => {
          console.log(result);
          this.accountss.splice(index, 1);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>