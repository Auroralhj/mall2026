<template>
    <div>
    <div class="tan-page-header">
      <div class="container">
        <h2>我的购物车</h2>
      </div>
    </div>
    <div class="container">
      <div v-if="carts.length" class="cart">
        <div class="list">
          <div class="head">
            <div class="check">
              <el-checkbox v-model="checkAll">全选</el-checkbox>
            </div>
            <div class="img">&nbsp;</div>
            <div class="name">商品名称</div>
            <div class="price">单价</div>
            <div class="num">数量</div>
            <div class="total">小计</div>
            <div class="action">操作</div>
          </div>
          <ul class="body">
            <li v-for="cart in carts" class="item" :key="cart.id">
              <div class="check">
                <el-checkbox
                  v-model="cart.checked" :checked="cart.checked?true:false"
                  @change="changeChecked(cart.id, cart.checked)"
                  >&nbsp;</el-checkbox>
              </div>
              <div class="img">
                <img :src="cart.image" :alt="cart.pname + ' ' + cart.name" />
              </div>
              <div class="name">
                <router-link :to="{ path: '/productDetail/' + cart.pid }">
                  <h3 :title="cart.pname + ' ' + cart.name">
                    {{ cart.pname + " " + cart.name }}
                  </h3>
                </router-link>
              </div>
              <div class="price">{{ cart.sale_price }} 元</div>
              <div class="num">
                <el-input-number
                  v-model="cart.quantity"
                  :min="1"
                  @change="changeQuantity(cart)"
                ></el-input-number>
              </div>
              <div class="total">
                {{ (cart.quantity * cart.sale_price).toFixed(2) }} 元
              </div>
              <div class="action">
                <span @click="remove(cart.id)">×</span>
              </div>
            </li>
          </ul>
        </div>
        <div class="footer">
          <span class="total">
            共
            <i>{{ carts.length }}</i>
            件商品，已选择
            <i>{{ checkedCount }}</i>
            件
          </span>
          <span class="total-price">
            合计：
            <em>{{ totalPrice }}</em>
            元
            <el-button
              type="primary"
              font-size="18px"
              height="48px"
              width="200px"
              >去结算</el-button>
          </span>
        </div>
      </div>
      <div v-else class="empty">
        <h2>您的购物车还是空的！</h2>
        <el-button
          type="primary"
          width="170px"
          height="48px"
          @click="$router.push({ path: '/productList' })"
          >马上去购物</el-button
        >
      </div>
    </div>
  </div>
</template>
<script setup>

import axios from 'axios'
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

const carts = ref([]);

const getCart = () => {
    axios
      .get("/api/cart/list")
      .then((res) => {
        console.log(res);
        carts.value = res.data;
      })
      .catch((err) => {
        console.log(err);
      });
  };
getCart();

const totalPrice = computed(() => {
      let total = 0;
      carts.value.forEach((e) => {
        total += e.quantity * e.sale_price * e.checked;
      });
      return total.toFixed(2);
    });
const checkedCount = computed(() => {
      let count = 0;
      carts.value.forEach((e) => {
        count += e.checked;
      });
      return count;
    });
const checkAll= computed({
      get() {
        let checkAll = true;
        carts.value.forEach((e) => {
          if (!e.checked) {
            checkAll = false;
            return;
          }
        });
        return checkAll;
      },
      set(value) {
        axios
          .post("/api/cart/checked", {
            checked: value,
          })
          .then((res) => {
            if (res.data.code == 200) {
              carts.value.forEach((e) => {
                e.checked = value;
              });
              ElMessage.success(res.data.message);
            } else ElMessage.warning(res.data.message);
          })
          .catch((err) => {
            console.log(err);
          });
      },
    });

const changeChecked = (cartId, checked) => {
  axios
    .post("/api/cart/checked", {
      checked,
      cartId,
    })
    .then((res) => {
      if (res.data.code == 200) ElMessage.success(res.data.message);
      else ElMessage.warning(res.data.message);
    })
    .catch((err) => {
      console.log(err);
    });
};

const changeQuantity = (cart) => {
  axios
    .post("/api/cart/quantity", {
      cartId: cart.id,
      number: cart.quantity,
    })
    .then((res) => {
      if (res.data.code == 200) ElMessage.success(res.data.message);
      else ElMessage.warning(res.data.message);
    })
    .catch((err) => {
      console.log(err);
    });
};    

const remove = (cartId) => {
  axios
    .post("/api/cart/delete", {
      id : cartId,
    })
    .then((res) => {
      if (res.data.code == 200) {
        ElMessage.success(res.data.message);
        carts.value = carts.value.filter((e) => e.id != cartId);
      } else ElMessage.warning(res.data.message);
    })
    .catch((err) => {
      console.log(err);
    });
};

</script>
<style scoped>
.tan-page-header {
  height: 63px;
  color: #616161;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 5px 5px rgb(0 0 0 / 7%);
  width: 100%;
  background-color: #fff;
  position: relative;
  z-index: 999;
}

.tan-page-header h2 {
  color: #424242;
  font-size: 18px;
  font-weight: 400;
  line-height: 60px;
}

.container {
  width: 1226px;
  margin: 0 auto;
}

.empty {
  text-align: center;
  padding: 100px 0;
}

.empty > h2 {
  color: #b0b0b0;
  font-size: 36px;
}

.empty > button {
  margin: 20px;
}

.cart > .list {
  margin-top: 38px;
  background-color: #fff;
  font-weight: 400;
}

.cart > .list > .head,
.cart > .list > .body > .item {
  display: flex;
  align-items: center;
}

.cart > .list > .head {
  height: 70px;
}

.cart > .list > .body > .item {
  padding: 15px 0;
  border-top: 1px solid #e0e0e0;
}

.cart > .list > .head > .check,
.cart > .list > .body > .item > .check {
  width: 110px;
  margin-left: 24px;
}

.cart > .list > .head > .img,
.cart > .list > .body > .item > .img {
  width: 120px;
}

.cart > .list > .body > .item > .img > img {
  width: 80px;
  height: 80px;
}

.cart > .list > .head > .name,
.cart > .list > .body > .item > .name {
  width: 380px;
}

.cart > .list > .body > .item > .name h3 {
  color: #424242;
  font-size: 18px;
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  transition: color 0.3s;
}

.cart > .list > .body > .item > .name h3:hover {
  color: #ff6700;
}

.cart > .list > .head > .price,
.cart > .list > .body > .item > .price,
.cart > .list > .head > .num,
.cart > .list > .body > .item > .num,
.cart > .list > .head > .total,
.cart > .list > .body > .item > .total {
  text-align: center;
}

.cart > .list > .head > .price,
.cart > .list > .body > .item > .price {
  width: 158px;
}

.cart > .list > .body > .item > .price {
  font-size: 16px;
}

.cart > .list > .head > .num,
.cart > .list > .body > .item > .num {
  width: 150px;
}

.cart > .list > .head > .total,
.cart > .list > .body > .item > .total {
  width: 200px;
}

.cart > .list > .body > .item > .total {
  color: #ff6700;
  font-size: 16px;
}

.cart > .list > .head > .action,
.cart > .list > .body > .item > .action {
  width: 80px;
}

.cart > .list > .body > .item > .action {
  cursor: pointer;
}

.cart > .list > .body > .item > .action > span {
  display: block;
  font-size: 18px;
  width: 24px;
  height: 24px;
  line-height: 23px;
  text-align: center;
  border-radius: 50%;
  background-color: transparent;
  transition: all 0.3s;
}

.cart > .list > .body > .item > .action > span:hover {
  background-color: #ff6700;
  color: #fff;
}

.cart > .footer {
  margin: 20px 0;
  height: 50px;
  background-color: #fff;
  display: flex;
  align-items: center;
  position: relative;
}

.cart > .footer > .total {
  margin-left: 28px;
  color: #757575;
}

.cart > .footer > .total > i {
  font-style: normal;
  color: #ff6700;
}

.cart > .footer > .total-price {
  position: absolute;
  right: 0;
  color: #ff6700;
}

.cart > .footer > .total-price > em {
  font-size: 30px;
  font-style: normal;
}

.cart > .footer > .total-price > button {
  margin-left: 50px;
}
</style>