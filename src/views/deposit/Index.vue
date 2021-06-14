<template>
  <div>
    <h1>Deposits</h1>

    <router-link to="/deposits/create">Deposit add</router-link>

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
        <tr v-for="(deposit, index) in deposits" :key="deposit.id">
          <td>{{ deposit.name }}</td>
          <td>{{ deposit.memo }}</td>
          <td>{{ deposit.status }}</td>
          <td>{{ moment(deposit.date) }}</td>
          <td>{{ deposit.principalCurrency }}</td>

          <td>{{ deposit.principalJPY }}</td>
          <td>{{ deposit.principalForeign }}</td>
          <td>{{ deposit.exchangeRate }}</td>
          <td>{{ deposit.interestRate }}</td>
          <td>{{ deposit.duration }}</td>

          <td>{{ deposit.endDate }}</td>
          <td>{{ deposit.valueCurrency }}</td>
          <td>{{ deposit.valueJPY }}</td>
          <td>{{ deposit.valueForeign }}</td>
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

    <router-link :to="{ name: 'DepositCreate' }">
      <button class="btn btn-primary">Add Deposit</button>
    </router-link>

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