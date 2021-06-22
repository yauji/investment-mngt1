<template>
  <div>
    <h1>Deposits</h1>

<!--
    <router-link to="/deposits/create">Deposit add</router-link>
-->
    <table class="table table-striped">
      <thead>
        <tr>
          <th>name</th>
          <th>type</th>
          <th>memo</th>
          <th>status</th>
          <th>date</th>

          <th>principal Currency</th>
          <th>principal </th>
          
          <th>exchange Rate</th>
          <th>interest Rate</th>
          <th>duration</th>

          <th>end Date</th>
          <th>value </th>
          
          <th>value Foreign</th>
          <th></th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(deposit, index) in deposits" :key="deposit.id">
          <td>{{ deposit.name }}</td>
          <td>{{ deposit.depositType }}</td>
          <td>{{ deposit.memo }}</td>
          <td>{{ deposit.status }}</td>
          <td>{{ moment(deposit.date) }}</td>
          <td>
            {{ deposit.principalAccount.currency }}
            {{ deposit.principalAccount.name }}
          </td>

          <td>{{ deposit.principal.toLocaleString() }}</td>
          
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
          <td>{{ deposit.value.toLocaleString() }}</td>
          
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
    <router-link custom v-slot="{ navigate }" :to="{ name: 'DepositCreate' }">
      <button class="btn btn-primary" @click="navigate">Add Deposit</button>
    </router-link>
  </div>
</template>

<script>
import { API } from "aws-amplify";
import { listDeposits } from "../../graphql/queries";
import { deleteDeposit } from "../../graphql/mutations";

//import { listDeposits } from "../../graphql/queries";
//import { deleteDeposit } from "../../graphql/mutations";

import moment from "moment";

export default {
  name: "DepositIndex",
  async created() {
    //this.getDeposits();
    this.getDeposits();
    //console.log(this.depositId);
  },
  data() {
    return {
      //albums: [],
      deposits: [],
    };
  },
  methods: {
    moment: function (date) {
      return moment(date).format("YYYY/MM/DD");
      //      return moment(date).format('YYYY/MM/DD HH:mm:SS')
    },
    async getDeposits() {
      await API.graphql({
        query: listDeposits,
      })
        .then((result) => {
          console.log(result);
          this.deposits = result.data.listDeposits.items;
          //this.Deposits = result.data.listDeposits.items;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async deleteDeposit(index, depositId) {
      if (!confirm("Delete Deposit?")) return;

      await API.graphql({
        //query: deleteDeposit,
        query: deleteDeposit,
        variables: { input: { id: depositId } },
      })
        .then((result) => {
          console.log(result);
          this.depositss.splice(index, 1);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>