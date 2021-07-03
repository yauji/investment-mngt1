<template>
  <div>
    <h1>Deposits</h1>

    <router-link custom v-slot="{ navigate }" :to="{ name: 'DepositCreate' }">
      <button class="btn btn-primary" @click="navigate">Add Deposit</button>
    </router-link>

    <table class="table table-striped">
      <thead>
        <tr>
          <th @click="sortBy('name')">name</th>
          <th @click="sortBy('status')">status</th>
          <th @click="sortBy('date')">date</th>

          <th @click="sortBy('principalAccountId')">principal account</th>
          <th @click="sortBy('principal')">principal</th>

          <th>exchange Rate</th>
          <th>interest Rate</th>
          <th>duration</th>

          <th>end Date</th>
          <th>value account</th>

          <th>value</th>
          <th>profit and loss</th>
          <th>memo</th>

          <th></th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(deposit, index) in deposits" :key="deposit.id">
          <td>{{ deposit.name }}</td>
          <td>{{ deposit.status }}</td>
          <td>{{ moment(deposit.date) }}</td>
          <td>
            {{ deposit.principalAccount.currency }}
            {{ deposit.principalAccount.name }}
          </td>

          <td>{{ numberFormat(deposit.principal) }}</td>

          <td>{{ deposit.exchangeRate }}</td>
          <td>{{ deposit.interestRate }}</td>
          <td>{{ deposit.duration }}</td>

          <td>{{ moment(deposit.endDate) }}</td>
          <td>
            <a v-if="deposit.valueAccount != null">
              {{ deposit.valueAccount.currency }}
              {{ deposit.valueAccount.name }}</a
            >
          </td>
          <td>{{ numberFormat(deposit.value) }}</td>
          <td>{{ numberFormat(deposit.value - deposit.principal) }}</td>
          <td>{{ deposit.memo }}</td>

          <td>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{ name: 'DepositShow', params: { depositId: deposit.id } }"
            >
              <button class="btn btn-primary" @click="navigate">Show</button>
            </router-link>
          </td>
          <td>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{ name: 'DepositEdit', params: { depositId: deposit.id } }"
            >
              <button class="btn btn-primary" @click="navigate">Edit</button>
            </router-link>
          </td>
          <td>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{ name: 'DepositFinish', params: { depositId: deposit.id } }"
            >
              <button class="btn btn-primary" @click="navigate">Finish</button>
            </router-link>
          </td>
          <td>
            <button
              class="btn btn-primary"
              @click="deleteDeposit(index, deposit.id)"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!--
    <router-link :to="{ name: 'DepositCreate' }">
      <button class="btn btn-primary">Add Deposit</button>
    </router-link>
-->
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { listDeposits } from "../../graphql/queries";
import { deleteDeposit } from "../../graphql/mutations";

import moment from "moment";

export default {
  name: "DepositIndex",

  async created() {
    this.getDeposits();
  },
  data() {
    return {
      deposits: [],
      sort_key: "date",
      sort_asc: true,
    };
  },

  methods: {
    sortBy(key) {
      this.sort_key === key
        ? (this.sort_asc = !this.sort_asc)
        : (this.sort_asc = true);
      this.sort_key = key;

      let set = 1;
      this.sort_asc ? (set = 1) : (set = -1);

      this.deposits.sort((a, b) => {
        if (a[this.sort_key] < b[this.sort_key]) return -1 * set;
        if (a[this.sort_key] > b[this.sort_key]) return 1 * set;
        return 0;
      });
    },
    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
      //      return moment(date).format('YYYY/MM/DD HH:mm:SS')
    },
    numberFormat: function (value) {
      if (value == null) {
        return "---";
      } else {
        return value.toLocaleString();
      }
    },
    async getDeposits() {
      await API.graphql({
        query: listDeposits,
      })
        .then((result) => {
          console.log(result);
          this.deposits = result.data.listDeposits.items;
          this.sortBy("date");
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async deleteDeposit(index, depositId) {
      if (!confirm("Delete Deposit?")) return;

      await API.graphql({
        query: deleteDeposit,
        variables: { input: { id: depositId } },
      })
        .then((result) => {
          console.log(result);
          this.deposits.splice(index, 1);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>