<template>
    <div class="tan-header container">
        <div class="tan-header-logo">
            <a><img src="./assets/malllogo.png" /></a>
        </div>
        <ul class="tan-header-nav">
            <li
            class="tan-header-nav-item"
            >
            <a @click="getProduct()">
                全部
            </a>
            </li>
            <li
            v-for="category in productCategory"
            :key="category.id"
            class="tan-header-nav-item"
            >
            <a @click="getProduct(category.id)">
                {{ category.name }}
            </a>
            </li>
        </ul>
        <div class="tan-header-search">
            <input class="tan-header-search-input" type="text" />
            <button class="tan-header-search-btn">&#128269;</button>
        </div>
    </div>
    <ul class="tan-product-list-products">
      <li v-for="p in productList" :key="p.id">
        <router-link :to="{ path: '/productDetail/'+p.id }">
          <img
            class="tan-product-list-products-cover-image"
            :src="p.details[p.showIndex].image"
          />
          <h3 class="tan-product-list-products-title">
            {{ p.name + " " + p.details[p.showIndex].name }}
          </h3>
          <p class="tan-product-list-products-description">
            {{ p.description }}
          </p>
          <p class="tan-product-list-products-price">
            <span>￥{{ p.details[p.showIndex].salePrice }}元</span>
            <del>￥{{ p.details[p.showIndex].price }}元</del>
          </p>
          <ul class="tan-product-list-products-thumb-list">
            <li
              v-for="(d, index) in p.details"
              :key="d.id"
              :class="{ active: p.showIndex == index }"
              @mouseenter="p.showIndex = index"
              @click.prevent=""
            >
              <img :src="d.image" />
            </li>
          </ul>
        </router-link>
      </li>
    </ul>
</template>
<script setup>
import axios from 'axios'
import { ref } from 'vue';

const productCategory = ref([]);

const getCategory = () =>{
              axios.get("/api/category/list")
              .then(res=>{
                  productCategory.value = res.data;
              })
              .catch(err=>{
                  console.log(err);
              })
};
getCategory();

const productList = ref([]);

const getProduct = (cid) => {
        let url = "/api/product/list?categoryId=";
        if (cid)
            url += cid;
      axios
        .get(url)
        .then((res) => {
          productList.value = res.data;
        })
        .catch((err) => {
          console.log(err);
        });
};
getProduct(null);

</script>
<style scoped>
.tan-header {
      display: flex;
      height: 100px;
      align-self: center;
      position: relative;
  }
  
  .tan-header-nav {
      display: flex;
      margin-left: 100px;
  }
  
  .tan-header-nav-item {
      padding: 38px 12px;
  }
  
  .tan-header-nav-item > a {
      font-size: 16px;
      color: #333;
      text-decoration-line: none;
      transition: color .2s;
  }
  
  .tan-header-nav-item > a:hover {
      color: #ff6700;
  }
  .tan-header-logo img{
      height: 50px;
      padding-top:25px
  }
  
  .tan-header-search {
      display: flex;
      height: 50px;
      margin-top: 26px;
      position: absolute;
      right: 0;
  }
  
  .tan-header-search-input, 
  .tan-header-search-btn {
      height: 48px;
      border: 1px solid #e0e0e0;
      outline: none;
      transition: all .3s;
  }
  
  .tan-header-search:hover > .tan-header-search-input,
  .tan-header-search:hover > .tan-header-search-btn {
      border-color: #b0b0b0;
  }
  
  .tan-header-search > .tan-header-search-input:focus, 
  .tan-header-search > .tan-header-search-input:focus + .tan-header-search-btn {
      border-color: #ff6700;
  }
  
  .tan-header-search-input {
      width: 223px;
      padding: 0 10px;
  }
  
  .tan-header-search-btn {
      width: 52px;
      height: 50px;
      color: #616161;
      background-color: #fff;
      position: relative;
      left: -1px;
      cursor: pointer;
      font-size: 22px;
  }
  .tan-image-item{
      height: 460px;
  }
  .tan-header-nav {
    display: flex;
    margin-left: 100px;
}

.tan-header-nav-item {
    padding: 38px 12px;
}

.tan-header-nav-item > a {
    font-size: 16px;
    color: #333;
    text-decoration-line: none;
    transition: color .2s;
}

.tan-header-nav-item > a:hover {
    color: #ff6700;
}    

.tan-product-list {
  margin: 14px auto;
}

.tan-product-list-header {
  display: flex;
  position: relative;
}

.tan-product-list-header-title,
.tan-product-list-header-more-link {
  height: 58px;
  line-height: 58px;
  color: #333;
}

.tan-product-list-header-title {
  font-size: 22px;
  font-weight: 200;
}

.tan-product-list-header-more {
  position: absolute;
  right: 0;
}

.tan-product-list-header-more-link {
  text-decoration-line: none;
  font-size: 16px;
  transition: all 0.4s;
}

.tan-product-list-header-more-link:hover {
  color: #ff6700;
}

.tan-product-list-products {
  display: flex;
  flex-wrap: wrap;
}

.tan-product-list-products > li {
  width: 296px;
  height: 383px;
  padding-top: 47px;
  background-color: #fff;
  transition: all 0.3s linear;
  margin-right: 14px;
  margin-bottom: 14px;
}

.tan-product-list-products > li:nth-child(4n + 4) {
  margin-right: 0;
}

.tan-product-list-products > li:hover {
  box-shadow: 0 5px 15px rgb(0 0 0 / 20%);
  transform: translate3d(0, -2px, 0);
}

.tan-product-list-products-cover-image {
  display: block;
  width: 200px;
  height: 200px;
  margin: 0 auto 16px;
}

.tan-product-list-products-title,
.tan-product-list-products-description,
.tan-product-list-products-price {
  text-align: center;
  color: #333;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin: 0 auto;
  padding: 3px 20px;
}

.tan-product-list-products-title {
  width: 230px;
  font-size: 14px;
  font-weight: 400;
}

.tan-product-list-products-description {
  height: 18px;
  font-size: 12px;
  color: #b0b0b0;
}

.tan-product-list-products-price {
  color: #ff6700;
  margin-bottom: 15px;
}

.tan-product-list-products-price > del {
  margin-left: 4px;
  color: #b0b0b0;
}

.tan-product-list-products-thumb-list {
  width: 100%;
  height: 37px;
  overflow: hidden;
  display: flex;
  justify-content: center;
}

.tan-product-list-products-thumb-list > li {
  width: 34px;
  height: 34px;
  margin: 0 4px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: border-color 0.2s linear;
}

.tan-product-list-products-thumb-list > li:hover,
.tan-product-list-products-thumb-list > li.active {
  border: 1px solid #ff6700;
}

.tan-product-list-products-thumb-list > li > img {
  width: 34px;
  height: 34px;
}
</style>