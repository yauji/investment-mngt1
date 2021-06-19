<template>
  <div>
    <h1>New TrustBalance</h1>

    <form @submit.prevent="submitCreate">
      <div class="mb-3">
        <label for="" class="form-label">currency *</label>
        <select
          class="form-select"
          aria-label="Default select example"
          v-model="form.currency"
          required
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
        <label for="" class="form-label">name *</label>
        <input type="text" class="form-control" v-model="form.name" required />
      </div>

      <div class="mb-3">
        <label for="" class="form-label">memo</label>
        <textarea class="form-control" v-model="form.memo" />
      </div>

      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
</template>

<script>
import { API } from "aws-amplify";

import { createTrustBalance } from "../../graphql/mutations";

//import { createTrustBalance, updateAccount } from "../../graphql/mutations";
//import { listAccounts } from "../../graphql/queries";

//import Datepicker from "vue3-datepicker";

import * as Enum from "@/Enum";

export default {
  name: "TrustBalanceCreate",

  components: {
    //Datepicker,
  },
  computed: {
    refEnum: () => Enum,
  },
  data() {
    return {
      //picked: "",
      form: {
        balance: 0,
        noItem: 0,
        basicPrice: 0,
      },
    };
  },
  methods: {
    /*
    disableAll: function () {
      this.dBasicPrice = true;
      this.dBasicPriceForeign = true;
      this.dNoItem = true;

      this.dBuyJPY = true;
      this.dBuyForeign = true;
      this.dSellJPY = true;
      this.dSellForeign = true;
      this.dDividendJPY = true;
      this.dDividendForeign = true;
    },
    onChangeTrustBalanceType: function () {
      this.disableAll();

      //      this.form.status = Enum.EnumTrustBalanceStatus.ACTIVE.val;

      if (this.form.tradeType == Enum.EnumTradeType.BUY.val) {
        this.dBasicPrice = false;
        this.dBasicPriceForeign = false;
        this.dNoItem = false;

        this.dBuyJPY = false;
        this.dBuyForeign = false;
      } else if (this.form.tradeType == Enum.EnumTradeType.SELL.val) {
        this.dBasicPrice = false;
        this.dBasicPriceForeign = false;
        this.dNoItem = false;

        this.dSellJPY = false;
        this.dSellForeign = false;
      } else if (this.form.tradeType == Enum.EnumTradeType.DIVIDEND.val) {
        this.dDividendJPY = false;
        this.dDividendForeign = false;
      }
    },
    onChangePrincipalCurrency: function () {
      if (this.form.principalCurrency == "JPY") {
        this.dPrincipalJPY = false;
      } else {
        this.dPrincipalForeign = false;
      }
    },
*/
    async submitCreate() {
      await API.graphql({
        query: createTrustBalance,
        variables: { input: this.form },
      })
        .then((result) => {
          console.log(result);
          this.$router.push({ name: "TrustBalanceIndex" });
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>