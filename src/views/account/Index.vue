<template>
  <div>
    <h1>Accounts</h1>

    <table class="table table-striped">
      <thead>
        <tr>
          <th>name</th>
          <th>currency</th>
          <th>balance</th>
          <th>balance JPY</th>
          <th>exchangeRate</th>
          <th>memo</th>
          <th>active deposit</th>
          <th>trust (not implemented)</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(account, index) in accounts" :key="account.id">
          <td>{{ account.name }}</td>
          <td>{{ account.currency }}</td>
          <td>{{ numberFormat(account.balance) }}</td>
          <td>{{ numberFormat(account.balance * account.exchangeRate) }}</td>
          <td>{{ account.exchangeRate }}</td>
          <td>{{ account.memo }}</td>
          <td>{{ numberFormat(account.activedeposit) }}</td>
          <td>{{ numberFormat(account.trust) }}</td>
          <td>
            <div class="container text-center">
              <div class="row row-cols-auto">
                <div class="col">
                  <router-link
                    custom
                    v-slot="{ navigate }"
                    :to="{
                      name: 'AccountShow',
                      params: { accountId: account.id },
                    }"
                  >
                    <button class="btn btn-primary btn-sm" @click="navigate">
                      Show
                    </button>
                  </router-link>
                </div>
                <div class="col">
                  <router-link
                    custom
                    v-slot="{ navigate }"
                    :to="{
                      name: 'AccountEdit',
                      params: { accountId: account.id },
                    }"
                  >
                    <button class="btn btn-primary btn-sm" @click="navigate">
                      Edit
                    </button>
                  </router-link>
                </div>
                <div class="col">
                  <button
                    class="btn btn-primary btn-sm"
                    @click="deleteAccount(index, account.id)"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <button class="btn btn-primary" @click="updateBalances()" :disabled="isUpdating">
      {{ isUpdating ? 'Updating…' : 'Update balance' }}
    </button>

    <br />
    <br />

    <router-link custom v-slot="{ navigate }" :to="{ name: 'AccountCreate' }">
      <button class="btn btn-primary" @click="navigate">Add Account</button>
    </router-link>
  </div>
</template>

<script>
import { API } from "aws-amplify";
//import { listAccounts, listDeposits} from "../../graphql/queries";
import {
  listAccounts,
  listDeposits,
  listTrustTransactions,
} from "../../graphql/queries";
import { deleteAccount, updateAccount } from "../../graphql/mutations";

import moment from "moment";

import * as Enum from "@/Enum";

export default {
  name: "AccountIndex",
  async created() {
    this.getAccounts();
  },
  data() {
    return {
      accounts: [],
      isUpdating: false,
    };
  },
  methods: {
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
    async getAccounts() {
      await API.graphql({
        query: listAccounts,
      })
        .then((result) => {
          //console.log(result);
          this.accounts = result.data.listAccounts.items;
        })
        .catch((error) => {
          console.log(error);
        });

      //calc active deposit----
      for (const ka in this.accounts) {
        var a = this.accounts[ka];
        //a.activedeposit = 1;

        //calc active deposit----
        let filter = {
          principalAccountId: {
            eq: a.id,
          },
        };

        var tad = 0;
        await API.graphql({
          query: listDeposits,
          variables: { filter: filter },
        })
          .then((result) => {
            //console.log(result);
            var tdeposits = result.data.listDeposits.items;

            for (const kd in tdeposits) {
              const d = tdeposits[kd];
              if (d.status == Enum.EnumDepositStatus.ACTIVE.val) {
                tad += d.principal;
              }
            }
          })
          .catch((error) => {
            console.log(error);
          });
        a.activedeposit = tad;

        //calc active trust----
        //a.activedeposit = 1;

        //calc active deposit----
        /*
        filter = {
          principalAccountId: {
            eq: a.id,
          },
        };

        var tad = 0;
        await API.graphql({
          query: listDeposits,
          variables: { filter: filter },
        })
          .then((result) => {
            //console.log(result);
            var tdeposits = result.data.listDeposits.items;

            for (const kd in tdeposits) {
              const d = tdeposits[kd];
              if (d.status == Enum.EnumDepositStatus.ACTIVE.val) {
                tad += d.principal;
              }
            }
          })
          .catch((error) => {
            console.log(error);
          });
        a.activedeposit = tad;
        */
      }

      //calc trust balance-----
      //TODO
      //a.trust = 2;
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
          this.accounts.splice(index, 1);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async updateBalances() {
      this.isUpdating = true;
      try {
        //get deposits-----
        var deposits;
        await API.graphql({
          query: listDeposits,
        })
          .then((result) => {
            //console.log(result);
            deposits = result.data.listDeposits.items;
          })
          .catch((error) => {
            console.log(error);
          });

        //console.log(deposits);

        //get accounts---
        /*
        var accounts;
        await API.graphql({
          query: listAccounts,
        })
          .then((result) => {
            //console.log(result);
            accounts = result.data.listAccounts.items;
          })
          .catch((error) => {
            console.log(error);
          });
*/
        //console.log("-----1", this.accounts);
        //var accounts = this.accounts;

        // create dic----
        var dicAccountIdBalance = [];

        for (const a in this.accounts) {
          dicAccountIdBalance[this.accounts[a].id] = 0;
        }

        for (const kd in deposits) {
          //console.log(deposits[kd]);
          const d = deposits[kd];

          //console.log("-------11", d.principal, d.value);
          dicAccountIdBalance[d.principalAccountId] -= d.principal;

          if (d.status == Enum.EnumDepositStatus.FINISHED.val) {
            //console.log("-----3", d.status);
            dicAccountIdBalance[d.valueAccountId] += d.value;
          }
        }

        //console.log("------12");
        //console.log(dicAccountIdBalance);

        //trust transaction----
        var trusttransactions = {};
        await API.graphql({
          query: listTrustTransactions,
        })
          .then((result) => {
            //console.log(result);
            trusttransactions = result.data.listTrustTransactions.items;
          })
          .catch((error) => {
            console.log(error);
          });
        //console.log(trusttransactions);

        for (const ktt in trusttransactions) {
          const tt = trusttransactions[ktt];

          if (tt.tradeType == Enum.EnumTradeType.BUY.val) {
            dicAccountIdBalance[tt.accountId] -= tt.buy;
            //console.log("------31", tt.buy);
          } else if (tt.tradeType == Enum.EnumTradeType.SELL.val) {
            dicAccountIdBalance[tt.accountId] += tt.sell;
            //console.log("------32", tt.sell);
          } else if (tt.tradeType == Enum.EnumTradeType.DIVIDEND.val) {
            dicAccountIdBalance[tt.accountId] += tt.dividend;
            //console.log("------33", tt);
          }

          /*
          if (tt.tradeType == Enum.EnumTradeType.BUY.val) {
            console.log("------3",tt.trustBalance.currency);
            if(tt.trustBalance.currency != Enum.EnumCurrency.JPY.val){
              dicAccountIdBalance[tt.trustBalance.currency] -= tt.buyForeign;
            }

          }
          */
        }

        //console.log("-----4", dicAccountIdBalance);

        //update account balances---
        for (const ka in this.accounts) {
          const a = this.accounts[ka];
          const newBalance = dicAccountIdBalance[a.id] ?? 0;

          // Build strict input for update
          const toNum = (v) => {
            if (v === null || v === undefined || v === "") return null;
            const n = typeof v === "number" ? v : parseFloat(v);
            return Number.isFinite(n) ? n : 0;
          };

          const payload = { ...a };
          payload.balance = toNum(newBalance);

          // Remove graphql/meta/computed fields if present
          delete payload.createdAt;
          delete payload.updatedAt;
          delete payload.owner;
          delete payload.__typename;
          delete payload._lastChangedAt;
          delete payload.activedeposit; // computed in UI

          // Whitelist for UpdateAccountInput (adjust to your schema)
          const allowed = [
            'id',
            'name',
            'currency',
            'memo',
            'exchangeRate',
            'balance',
            '_version', // Amplify/AppSync conflict detection
          ];
          const input = {};
          for (const k of allowed) {
            if (payload[k] !== undefined) input[k] = payload[k];
          }

          console.log('[AccountIndex] updateAccount input:', input);

          try {
            const result = await API.graphql({
              query: updateAccount,
              variables: { input },
            });
            console.log('[AccountIndex] updateAccount ok:', result);
          } catch (error) {
            console.error('[AccountIndex] updateAccount failed:', error);
            if (error && error.errors) {
              for (const e of error.errors) {
                console.error('[AccountIndex] graphql error:', e.message, e);
              }
            }
          }
        }
      } finally {
        // refresh accounts list after updates and reset flag
        await this.getAccounts();
        this.isUpdating = false;
      }
    },
  },
};
</script>