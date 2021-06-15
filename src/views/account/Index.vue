<template>
  <div>
    <h1>Accounts</h1>

    <router-link to="/accounts/create">Account add</router-link>

    <table class="table table-striped">
      <thead>
        <tr>
          <th>name</th>
          <th>memo</th>
          <th>status</th>
          <th>date</th>

          <th>principalCurrency</th>
          <th>principalJPY</th>
          <th>principalForeign</th>
          <th>exchangeRate</th>
          <th>interestRate</th>
          <th>duration</th>

          <th>endDate</th>
          <th>valueCurrency</th>
          <th>valueJPY</th>
          <th>valueForeign</th>
          <th></th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(account, index) in accounts" :key="account.id">
          <td>{{ account.name }}</td>
          <td>{{ account.memo }}</td>
          <td>{{ account.status }}</td>
          <td>{{ moment(account.date) }}</td>
          <td>{{ account.principalCurrency }}</td>

          <td>{{ account.principalJPY }}</td>
          <td>{{ account.principalForeign }}</td>
          <td>{{ account.exchangeRate }}</td>
          <td>{{ account.interestRate }}</td>
          <td>{{ account.duration }}</td>

          <td>{{ account.endDate }}</td>
          <td>{{ account.valueCurrency }}</td>
          <td>{{ account.valueJPY }}</td>
          <td>{{ account.valueForeign }}</td>
          <td>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{ name: 'AccountShow', params: { accountId: account.id } }"
            >
              <button class="btn btn-primary" @click="navigate">Show</button>
            </router-link>
          </td>
          <td>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{ name: 'AccountEdit', params: { accountId: account.id } }"
            >
              <button class="btn btn-primary" @click="navigate">Edit</button>
            </router-link>
          </td>
          <td>
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

    <router-link :to="{ name: 'AccountCreate' }">
      <button class="btn btn-primary">Add Account</button>
    </router-link>

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