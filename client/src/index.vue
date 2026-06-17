<template>
  <div class="home-page">
    <!-- 品牌行：Logo 居中 -->
    <div class="brand-row container">
      <router-link to="/" class="brand-logo">
        <img src="./assets/malllogo.png" alt="MoreMall" />
      </router-link>
    </div>

    <!-- 轮播图 -->
    <el-carousel height="420px">
      <el-carousel-item v-for="item in pics" :key="item">
        <img :src="item" style="width:100%;height:100%;object-fit:cover;" />
      </el-carousel-item>
    </el-carousel>

    <!-- 热门推荐 -->
    <div class="section container">
      <div class="section-head">
        <h2>热门推荐</h2>
        <router-link to="/productList" class="more-link">查看全部 →</router-link>
      </div>
      <div class="product-grid">
        <div v-for="p in hotProducts" :key="p.id" class="product-card">
          <router-link :to="'/productDetail/' + p.id">
            <img :src="p.details[p.showIndex].image" class="card-img" />
            <h3 class="card-name">{{ p.name + ' ' + p.details[p.showIndex].name }}</h3>
            <p class="card-desc">{{ p.description }}</p>
            <p class="card-price">
              <span>¥{{ p.details[p.showIndex].salePrice }}</span>
              <del>¥{{ p.details[p.showIndex].price }}</del>
            </p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref } from 'vue'

const pics = ref([])
axios.get('/api/pics')
  .then(res => { pics.value = res.data })
  .catch(err => console.log(err))

const hotProducts = ref([])
axios.get('/api/product/list')
  .then(res => {
    if (Array.isArray(res.data)) hotProducts.value = res.data.slice(0, 4)
  })
  .catch(err => console.log(err))
</script>

<style scoped>
.home-page {
  background: #f5f5f5;
}

/* ===== 品牌行 ===== */
.brand-row {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  background: #fff;
}

.brand-logo img {
  height: 48px;
}

/* ===== 推荐区 ===== */
.section {
  padding: 36px 0 48px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-head h2 {
  font-size: 22px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.more-link {
  font-size: 14px;
  color: #999;
  text-decoration: none;
  transition: color .25s;
}
.more-link:hover { color: #ff6700; }

/* ===== 商品卡片 ===== */
.product-grid {
  display: flex;
  gap: 14px;
}

.product-card {
  width: 296px;
  background: #fff;
  transition: all .3s ease;
}

.product-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  transform: translate3d(0, -2px, 0);
}

.product-card a {
  display: block;
  padding: 36px 16px 20px;
  text-align: center;
  text-decoration: none;
  color: inherit;
}

.card-img {
  width: 180px;
  height: 180px;
  object-fit: contain;
  margin-bottom: 14px;
}

.card-name {
  font-size: 14px;
  font-weight: 400;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 auto 4px;
  max-width: 240px;
}

.card-desc {
  font-size: 12px;
  color: #b0b0b0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 auto 10px;
  max-width: 240px;
}

.card-price {
  margin: 0;
  color: #ff6700;
  font-size: 15px;
}

.card-price del {
  margin-left: 6px;
  color: #b0b0b0;
  font-size: 12px;
}
</style>
