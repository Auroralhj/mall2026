<template>
    <div  v-if="product">
    <div class="product-detail">
            <div class="body container">
                <div class="image-left">
                    <!-- <tan-swiper width="560px" height="560px" :images="swiperImages"></tan-swiper> -->
                    <el-carousel indicator-position="outside"  width="560px" height="560px">
                        <el-carousel-item v-for="(item,index) in product.details" :key="index" class="tan-image-item">
                            <img :src="item.image" style="height:100%" />
                        </el-carousel-item>
                    </el-carousel>
                </div>
                <div class="info">
                    <h2>{{ product.name }}</h2>
                    <p class="description">{{ product.description }}</p>
                    <p class="price">{{ product.details[product.showIndex].salePrice }} 起</p>
                    <div class="line"></div>
                    <div class="option">
                        <h2 class="title">选择规格</h2>
                        <ul class="list">
                            <li 
                                v-for="detail, index in product.details" 
                                class="item" 
                                :class="{ active: product.showIndex == index }" 
                                :key="detail.id"
                                @click="product.showIndex = index"
                            >
                                {{ detail.name }}
                            </li>
                        </ul>
                    </div>
                    <div class="number">
                        <h2 class="title">购买数量</h2>
                        <el-input-number v-model="number" :min="1"></el-input-number>
                    </div>
                    <div class="btns">
                        <el-button type="warning" width="298px" height="52px" font-size="16px" @click="buyNow">立即购买</el-button>
                        <el-button @click="addCart" type="info" width="140px" height="52px" font-size="16px" >加入购物车</el-button>
                    </div>
                </div>
            </div>
        </div>
  </div>
</template>
<script setup>
import axios from 'axios'
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const product = ref(null);
const number = ref(1);


const getProductById = (id) => {
      axios
        .get("/api/product/getById?id="+id)
        .then((res) => {
          product.value = res.data;
        })
        .catch((err) => {
          console.log(err);
        });
    };
getProductById(route.params.id);


import { ElMessage } from "element-plus"

const buyNow = () => {
    const detail = product.value.details[product.value.showIndex];
    const data = [{
        productId: product.value.id,
        detailId: detail.id,
        name: product.value.name,
        detailName: detail.name,
        image: detail.image,
        price: detail.salePrice,
        quantity: number.value
    }];
    sessionStorage.setItem('checkoutItems', JSON.stringify(data));
    router.push('/checkout');
};

const addCart = () => {
        let data = {
            quantity: number.value,
            productId: product.value.id,
            detailId: product.value.details[product.value.showIndex].id
        }
        axios
        .post("/api/cart/add", data)
        .then((res) => {
            if ( res.data.code == 200 )
                ElMessage.success(res.data.message)
            else
                ElMessage.warning(res.data.message)
        })
        .catch((err) => {
          console.log(err);
        });
    }

</script>
<style scoped>
.product-detail {
    background-color: #fff;
}

.product-detail > .body {
    padding-top: 32px;
    display: flex;
}

.product-detail > .body > .image-left {
    width: 606px;
}

.product-detail > .body > .info {
    flex: 1;
    margin-left: 20px;
}

.product-detail > .body > .info > h2 {
    font-size: 24px;
    font-weight: 400;
    color: #212121;
}

.product-detail > .body > .info > .description {
    color: #b0b0b0;
    margin: 0;
    padding: 0;
    padding-top: 8px;
    line-height: 1.5;
    padding: 14px 0;
}

.product-detail > .body > .info > .price {
    color: #ff6700;
    padding: 14px 0;
    font-size: 24px;
}

.product-detail > .body > .info .title {
    font-size: 18px;
    font-weight: 400;
    padding: 14px 0;
}

.product-detail > .body > .info > .option > .list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.product-detail > .body > .info > .option > .list > .item {
    width: 292px;
    color: #757575;
    height: 42px;
    line-height: 42px;
    border: 1px solid #e0e0e0;
    margin-bottom: 10px;
    text-align: center;
    font-size: 16px;
    transition: all .3s ease;
}

.product-detail > .body > .info > .option > .list > .item.active,
.product-detail > .body > .info > .option > .list > .item:hover {
    color: #ff6700;
    border-color: #ff6700;
}

.product-detail > .body > .info > .number {
    display: flex;
    align-items: center;
}

.product-detail > .body > .info > .number > .title {
    margin-right: 14px;
}

.product-detail > .body > .info > .btns {
    margin: 20px 0;
}

.product-detail > .body > .info > .btns > button:nth-child(1) {
    margin-right: 10px;
}
</style>