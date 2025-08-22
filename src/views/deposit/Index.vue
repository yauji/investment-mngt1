<template>
  <div>
    <h2>Deposits</h2>

    <div class="container text-center">
      <div class="row row-cols-auto">
        <div class="col">
          <router-link
            custom
            v-slot="{ navigate }"
            :to="{ name: 'DepositCreate' }"
          >
            <button class="btn btn-primary" @click="navigate">
              Add Deposit
            </button>
          </router-link>
        </div>
        <div class="col">
          <router-link
            custom
            v-slot="{ navigate }"
            :to="{ name: 'DepositCreateText' }"
          >
            <button class="btn btn-secondary" @click="navigate">
              Add Deposit with text
            </button>
          </router-link>
        </div>
      </div>

      <div class="row row-cols-auto">
        <div class="col p-1">
          <input
            type="checkbox"
            id="fStatusActive"
            value="fStatusActive"
            v-model="checkedFStatuses"
            checked
          />
          <label for="fStatusActive">active</label>
        </div>
        <div class="col p-1">
          <input
            type="checkbox"
            id="fStatusFinished"
            value="fStatusFinished"
            v-model="checkedFStatuses"
          />

          <label for="fStatusFinished">Finished</label>
        </div>
        <div class="col p-1">
          <button class="btn btn-info btn-sm" @click="filter()">Filter</button>
        </div>
      </div>

      <!--
      <span>Checked names: {{ checkedFStatuses }}</span>
      -->
    </div>

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

          <th @click="sortBy('endDate')">end date</th>
          <th>value account</th>

          <th>value</th>
          <th>profit and loss</th>
          <th>expected profit</th>
          <th>memo</th>
          <!--
          <th></th>
          -->
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
            {{ deposit.principalAccount?.currency || '-' }}
            {{ deposit.principalAccount?.name || '-' }}
          </td>

          <td>{{ numberFormat(deposit.principal) }}</td>

          <td>{{ deposit.exchangeRate }}</td>
          <td>{{ deposit.interestRate }}</td>
          <td>{{ deposit.duration }}</td>

          <td>{{ moment(deposit.endDate) }}</td>
          <td>
            <span v-if="deposit.valueAccount">
              {{ deposit.valueAccount?.currency || '-' }}
              {{ deposit.valueAccount?.name || '-' }}
            </span>
            <span v-else>-</span>
          </td>
          <td>{{ numberFormat(deposit.value) }}</td>
          <td>{{ numberFormat(deposit.pl) }}</td>
          <td>{{ numberFormat(deposit.expected) }}</td>
          <td>{{ deposit.memo }}</td>
          <!--
          <td>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{ name: 'DepositShow', params: { depositId: deposit.id } }"
            >
              <button class="btn btn-primary" @click="navigate">Show</button>
            </router-link>
          </td>
          -->
          <td>
            <router-link
              custom
              v-slot="{ navigate }"
              :to="{ name: 'DepositEdit', params: { depositId: deposit.id } }"
            >
              <button class="btn btn-primary" @click="navigate">
                <BIconPencil />
              </button>
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
              <BIconTrash />
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
// import { listDeposits } from "../../graphql/queries";
import { deleteDeposit } from "../../graphql/mutations";

//import bi from "bootstrap-icons";
import { BIconPencil, BIconTrash } from "bootstrap-icons-vue";

import moment from "moment";

import * as Enum from "@/Enum";

const LIST_DEPOSITS_WITH_RELATIONS = /* GraphQL */ `
  query ListDepositsWithRelations {
    listDeposits {
      items {
        id
        name
        memo
        status
        date
        principalAccountId
        principalAccount {
          id
          name
          currency
          exchangeRate
        }
        principal
        exchangeRate
        interestRate
        duration
        endDate
        valueAccountId
        valueAccount {
          id
          name
          currency
          exchangeRate
        }
        value
      }
    }
  }
`;

export default {
  name: "DepositIndex",
  components: {
    BIconPencil,
    BIconTrash,
  },
  async created() {
    //this.getDeposits();
    this.init_filter();
  },
  data() {
    return {
      deposits: [],
      sort_key: "date",
      sort_asc: true,

      //filter--
      //checkedFStatuses: { fStatusActive: true },
      checkedFStatuses: ["fStatusActive"],
      //checkedFStatuses: ["fStatusActive", "fStatusFinished"],
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
        const av = a[this.sort_key];
        const bv = b[this.sort_key];
        if (av == null && bv == null) return 0;
        if (av == null) return 1 * set;
        if (bv == null) return -1 * set;
        if (av < bv) return -1 * set;
        if (av > bv) return 1 * set;
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
        query: LIST_DEPOSITS_WITH_RELATIONS,
      })
        .then((result) => {
          console.log(result);
          this.deposits = result.data.listDeposits.items;

          //calc profit and loss, expected profit----
          for (const kd in this.deposits) {
            const d = this.deposits[kd];

            // profit and loss (only when finished & both accounts exist)
            if (
              d.status == Enum.EnumDepositStatus.FINISHED.val &&
              d.principalAccount?.exchangeRate != null &&
              d.valueAccount?.exchangeRate != null
            ) {
              const pri = (d.principal || 0) * (d.principalAccount.exchangeRate || 0);
              const val = (d.value || 0) * (d.valueAccount.exchangeRate || 0);
              d.pl = val - pri;
            } else {
              d.pl = null;
            }

            // expected profit (tax-considered), guard nulls
            const principal = Number(d.principal) || 0;
            const ir = Number(d.interestRate) || 0;
            const dur = Number(d.duration) || 0;
            d.expected = (((principal * ir) / 100) * dur) / 12 * 0.8;
          }

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
    async filter() {
      await this.getDeposits();

      var tmpdeposits = [];

      for (const kd in this.deposits) {
        //console.log("---1", this.deposits[kd]);
        if (
          this.checkedFStatuses.includes("fStatusActive") &&
          this.deposits[kd].status == Enum.EnumDepositStatus.ACTIVE.val
        ) {
          tmpdeposits.push(this.deposits[kd]);
        }
        if (
          this.checkedFStatuses.includes("fStatusFinished") &&
          this.deposits[kd].status == Enum.EnumDepositStatus.FINISHED.val
        ) {
          tmpdeposits.push(this.deposits[kd]);
        }
      }

      this.deposits = tmpdeposits;
    },
    // show only active deposits on created
    async init_filter() {
      await this.getDeposits();

      var tmpdeposits = [];

      for (const kd in this.deposits) {
        //console.log("---1", this.deposits[kd]);
        if (
          //this.checkedFStatuses.includes("fStatusActive") &&
          this.deposits[kd].status == Enum.EnumDepositStatus.ACTIVE.val
        ) {
          tmpdeposits.push(this.deposits[kd]);
        }
      }

      this.deposits = tmpdeposits;
    },
  },
};
</script>