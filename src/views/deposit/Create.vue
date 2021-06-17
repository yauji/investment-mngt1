<template>
  <div>
    <h1>New Deposit</h1>

    <form @submit.prevent="submitCreate">
      <input type="submit" value="Submit" />

      <div class="mb-3">
        <div class="mb-3">
          <label for="" class="form-label">name *</label>
          <input
            type="text"
            class="form-control"
            v-model="form.name"
            required
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">type *</label>
          <select
            class="form-select"
            aria-label="Default select example"
            v-model="form.depositType"
            @change="onChangeDepositType()"
            required
          >
            <option
              v-for="n in refEnum.EnumDepositType"
              v-bind:key="n"
              v-bind:value="n.val"
            >
              {{ n.text }}
            </option>
          </select>
        </div>

        <div class="mb-3">
          <label for="" class="form-label">memo</label>
          <textarea class="form-control" v-model="form.memo" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">date *</label>
          <datepicker v-model="form.date" class="form-control" required />
          <!--             
             <datepicker  v-model="picked" />
          <input type="text" class="form-control" v-model="form.date" />
          -->
        </div>

        <div class="mb-3">
          <label for="" class="form-label">principalCurrency *</label>
          <select
            class="form-select"
            aria-label="Default select example"
            v-model="form.principalCurrency"
            @change="onChangePrincipalCurrency()"
            required
          >
            <!--
            <option selected>Open this select menu</option>-->
            <option selected>Open this select menu</option>
            <option
              v-for="n in refEnum.EnumCurrency"
              v-bind:key="n"
              v-bind:value="n.val"
            >
              {{ n.text }}
            </option>
            <!--
            <option value="JPY" selected>JPY</option>
            <option value="USD">USD</option>
            <option value="AUD">AUD</option>
            <option value="EUR">EUR</option>
            <option value="NZD">NZD</option>
            -->
          </select>
        </div>

        <div class="mb-3">
          <label for="" class="form-label">Principal JPY</label>
          <input
            type="number"
            class="form-control"
            v-model="form.principalJPY"
            v-bind:disabled="dPrincipalJPY"
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">Principal Foreign</label>
          <input
            type="number"
            step="0.01"
            class="form-control"
            v-model="form.principalForeign"
            v-bind:disabled="dPrincipalForeign"
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">exchange rate</label>
          <input
            type="number"
            class="form-control"
            v-model="form.exchangeRate"
            v-bind:disabled="dExchangeRate"
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">interest rate</label>
          <input
            type="number"
            class="form-control"
            v-model="form.interestRate"
            v-bind:disabled="dInterestRate"
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">duration</label>
          <input
            type="text"
            class="form-control"
            v-model="form.duration"
            v-bind:disabled="dDuration"
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">end date</label>
          <datepicker v-model="form.endDate" class="form-control" />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">valueCurrency</label>
          <select
            class="form-select"
            aria-label="Default select example"
            v-model="form.valueCurrency"
            v-bind:disabled="dvalueCurrency"
          >
            <option
              v-for="n in refEnum.EnumCurrency"
              v-bind:key="n"
              v-bind:value="n.val"
            >
              {{ n.text }}
            </option>
          </select>
        </div>

        <div class="mb-3">
          <label for="" class="form-label">value JPY</label>
          <input
            type="text"
            class="form-control"
            v-model="form.valueJPY"
            v-bind:disabled="dValueJPY"
          />
        </div>

        <div class="mb-3">
          <label for="" class="form-label">value foreign</label>
          <input
            type="text"
            class="form-control"
            v-model="form.valueForeign"
            v-bind:disabled="dValueForeign"
          />
        </div>

        <button type="submit" class="btn btn-primary">Submit</button>
      </div>
    </form>
  </div>
</template>

<script>
import { API } from "aws-amplify";

import { createDeposit } from "../../graphql/mutations";

//import { createDeposit, updateAccount } from "../../graphql/mutations";
//import { listAccounts } from "../../graphql/queries";

import Datepicker from "vue3-datepicker";

import * as Enum from "@/Enum";
//import * as Enum from '../../enum';

export default {
  name: "DepositCreate",

  components: {
    Datepicker,
  },
  computed: {
    refEnum: () => Enum,
  },
  data() {
    return {
      //picked: "",
      form: {
        name: "a",
        //        name: "",
        //typeDeposit: Enum.EnumDepositeType.BUY_FOREIGN_CURRENCY_BY_JPY.val,
        depositType: "BUY_FOREIGN_CURRENCY_BY_JPY",
        //typeDeposit
        memo: "",
        status: "",

        date: new Date(),
        //        date: "",
        principalCurrency: "JPY",
        principalJPY: 1000,
        //        principalJPY: 0,
        principalForeign: 0,
        exchangeRate: 100.0,
        //        exchangeRate: 0,
        interestRate: 0,
        duration: 0,

        endDate: "",
        valueCurrency: "USD",
        valueJPY: 0,
        valueForeign: 10.0,
        //        valueForeign: 0,
      },
      dPrincipalJPY: true,
      dPrincipalForeign: true,
      dExchangeRate: true,
      dInterestRate: true,
      dDuration: true,
      dEndDate: true,
      dValueCurrency: true,
      dValueJPY: true,
      dValueForeign: true,
      /*
      dPrincipalCurrecy: true,
*/
    };
  },
  methods: {
    disableAll: function () {
      this.dPrincipalCurrecy = true;
      this.dPrincipalJPY = true;
      this.dPrincipalForeign = true;
      this.dExchangeRate = true;
      this.dInterestRate = true;
      this.dDuration = true;
      this.dEndDate = true;
      this.dValueCurrency = true;
      this.dValueJPY = true;
      this.dValueForeign = true;
    },
    onChangeDepositType: function () {
      //console.log("xxxxxx");

      this.disableAll();

      this.form.status = Enum.EnumDepositStatus.ACTIVE.val;

      if (this.form.depositType == Enum.EnumDepositType.DEPOSIT_JPY.val) {
        this.dPrincipalJPY = false;
        this.dInterestRate = false;
        this.dDuration = false;
      } else if (this.form.depositType == Enum.EnumDepositType.DEPOSIT_FC.val) {
        this.dPrincipalForeign = false;
        this.dExchangeRate = false;
        this.dInterestRate = false;
        this.dDuration = false;
      } else if (
        this.form.depositType ==
        Enum.EnumDepositType.BUY_FOREIGN_CURRENCY_BY_JPY.val
      ) {
        this.dPrincipalJPY = false;
        this.dExchangeRate = false;
        this.form.duration = 0;
        this.dValueForeign = false;

        this.form.status = Enum.EnumDepositStatus.FINISHED.val;
      } else if (
        this.form.depositType ==
        Enum.EnumDepositType.BUY_FOREIGN_CURRENCY_BY_FC.val
      ) {
        this.dPrincipalForeign = false;
        this.dExchangeRate = false;
        this.form.duration = 0;
        this.dValueJPY = false;

        this.form.status = Enum.EnumDepositStatus.FINISHED.val;
      } else if (
        this.form.depositType == Enum.EnumDepositType.SELL_FOREIGN_CURRENCY.val
      ) {
        this.dPrincipalForeign = false;
        this.dExchangeRate = false;
        this.dInterestRate = false;
        this.form.duration = 0;
        this.dValueForeign = false;
        this.form.status = Enum.EnumDepositStatus.FINISHED.val;
      }
    },
    onChangePrincipalCurrency: function () {
      if (this.form.principalCurrency == "JPY") {
        this.dPrincipalJPY = false;
      } else {
        this.dPrincipalForeign = false;
      }
    },

    async submitCreate() {
      this.form.status = "ACTIVE";

      //console.log("xxxxxxxx");
      //console.log(this.form.date);
      await API.graphql({
        query: createDeposit,
        variables: { input: this.form },
      })
        .then((result) => {
          console.log(result);
          this.$router.push({ name: "DepositIndex" });
        })
        .catch((error) => {
          console.log(error);
        });

      //update account----
      /*
      if (this.form.depositType == Enum.EnumDepositType.DEPOSIT_JPY.val) {
        console.log("a");
      } else if (this.form.depositType == Enum.EnumDepositType.DEPOSIT_FC.val) {
        console.log("a");
      } else if (
        this.form.depositType ==
        Enum.EnumDepositType.BUY_FOREIGN_CURRENCY_BY_JPY.val
      ) {
        await API.graphql({
          query: listAccounts,
        })
          .then((result) => {
            const accounts = result.data.listAccounts.items;

            for (const key in accounts) {
              if (accounts[key].currency == this.form.valueCurrency) {
                var a = accounts[key];
                delete a.createdAt;
                delete a.updatedAt;
                delete a.owner;

                a.balance += this.form.valueForeign;

                API.graphql({
                  query: updateAccount,
                  variables: { input: a },
                })
                  .then((result) => {
                    console.log(result);
                    this.$router.push({ name: "DepositIndex" });
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              }
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } else if (
        this.form.depositType ==
        Enum.EnumDepositType.BUY_FOREIGN_CURRENCY_BY_FC.val
      ) {
        console.log("a");
      } else if (
        this.form.depositType == Enum.EnumDepositType.SELL_FOREIGN_CURRENCY.val
      ) {
        console.log("a");
      }
      */
    },
  },
};
</script>