import { createStore } from 'vuex'
import axios from 'axios';

export default createStore({
  state: {
    user: null,
    // 為替レートを共通パラメータとして追加
    exchangeRates: {
      USD: 155.0,
      EUR: 170.0,
      AUD: 102.0, // 豪ドル
      NZD: 95.0,  // ニュージーランドドル
      // 必要に応じて他通貨も追加
    },
  },
  mutations: {
    setUser(state, user){
      state.user = user;
    },
    // 為替レートを更新するmutation
    setExchangeRates(state, rates) {
      state.exchangeRates = { ...state.exchangeRates, ...rates };
    },
  },
  actions: {
    // 為替APIから最新レートを取得してstateを更新
    async fetchExchangeRates({ commit }) {
      try {
        // 例: exchangerate.hostのAPIを利用
        const res = await axios.get(' ');
        if (res.data && res.data.rates) {
          // JPY基準のレートを逆数にして格納（1USD=○○JPY 形式に変換）
          const rates = {
            USD: 1 / res.data.rates.USD,
            EUR: 1 / res.data.rates.EUR,
            AUD: 1 / res.data.rates.AUD,
            NZD: 1 / res.data.rates.NZD,
          };
          // 小数点2桁で四捨五入
          Object.keys(rates).forEach(k => rates[k] = Math.round(rates[k] * 100) / 100);
          commit('setExchangeRates', rates);
        }
      } catch (e) {
        console.error('為替レート取得失敗', e);
      }
    },
  },
  modules: {
  }
})
