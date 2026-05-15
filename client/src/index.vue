<template>
    <div class="tan-header container">
        <div class="tan-header-logo">
            <a><img :src="malllogo" /></a>
        </div>
        <div class="tan-header-search">
            <input class="tan-header-search-input" type="text" />
            <button class="tan-header-search-btn">&#128269;</button>
        </div>
    </div>
    <el-carousel height="550px">
        <el-carousel-item v-for="item in pics" :key="item">
            <img :src="item" style="width:100%;height:100%;" />
        </el-carousel-item>
    </el-carousel>
</template>

<script setup>
import malllogo from './assets/malllogo.png'
import axios from 'axios'
import { ref } from 'vue'

const pics = ref([])

axios.get("/api/pics")
  .then(res => {
    console.log(res);
    pics.value = res.data    
  })
  .catch(err => {
    console.log(err);
  })

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

.tan-header-nav-item>a {
    font-size: 16px;
    color: #333;
    text-decoration-line: none;
    transition: color .2s;
}

.tan-header-nav-item>a:hover {
    color: #ff6700;
}

.tan-header-logo img {
    height: 50px;
    padding-top: 25px
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

.tan-header-search:hover>.tan-header-search-input,
.tan-header-search:hover>.tan-header-search-btn {
    border-color: #b0b0b0;
}

.tan-header-search>.tan-header-search-input:focus,
.tan-header-search>.tan-header-search-input:focus+.tan-header-search-btn {
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
</style>