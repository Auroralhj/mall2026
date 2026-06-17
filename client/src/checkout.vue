<template>
  <div class="checkout-page">
    <div class="container">
      <h2>确认订单</h2>

      <!-- 收货地址 -->
      <div class="section">
        <h3>收货地址</h3>
        <div v-if="contacts.length" class="address-list">
          <div
            v-for="c in contacts"
            :key="c.id"
            class="address-card"
            :class="{ active: selectedContactId === c.id }"
            @click="selectedContactId = c.id"
          >
            <div class="address-info">
              <span class="name">{{ c.name }}</span>
              <span class="phone">{{ c.telephone }}</span>
              <el-tag size="small" type="info">{{ c.tag }}</el-tag>
            </div>
            <p class="address-text">{{ c.address }}</p>
          </div>
        </div>
        <el-button type="primary" link @click="showAddressDialog = true">
          + 新增收货地址
        </el-button>
      </div>

      <!-- 商品清单 -->
      <div class="section">
        <h3>商品清单</h3>
        <div class="item-list">
          <div v-for="(item, i) in orderItems" :key="i" class="item">
            <img :src="item.image" class="item-img" />
            <div class="item-info">
              <p class="item-name">{{ item.name }} {{ item.detailName }}</p>
              <p class="item-price">¥{{ item.price }} × {{ item.quantity }}</p>
            </div>
            <div class="item-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>
        <div class="total">
          合计：<span class="total-price">¥{{ totalPrice }}</span>
        </div>
      </div>

      <!-- 提交 -->
      <div class="submit-bar">
        <el-button type="primary" size="large" @click="submitOrder" :loading="submitting">
          提交订单
        </el-button>
      </div>
    </div>

    <!-- 新增地址弹窗 -->
    <el-dialog v-model="showAddressDialog" title="新增收货地址" width="500px">
      <el-form :model="newAddress" label-width="80px">
        <el-form-item label="收货人">
          <el-input v-model="newAddress.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="newAddress.telephone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="newAddress.address" type="textarea" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="newAddress.tag" placeholder="选择标签">
            <el-option label="家" value="家" />
            <el-option label="公司" value="公司" />
            <el-option label="学校" value="学校" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="addAddress">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const router = useRouter()

const contacts = ref([])
const selectedContactId = ref(null)
const orderItems = ref([])
const submitting = ref(false)

const showAddressDialog = ref(false)
const newAddress = ref({ name: '', telephone: '', address: '', tag: '家' })

// 从 sessionStorage 读取商品数据
const stored = sessionStorage.getItem('checkoutItems')
if (stored) {
  try { orderItems.value = JSON.parse(stored) } catch (e) { orderItems.value = [] }
}
if (!orderItems.value.length) {
  ElMessage.warning('没有待结算商品，请先去购物车选择')
  router.push('/cart')
}

const totalPrice = computed(() => {
  return orderItems.value.reduce((t, item) => t + item.price * item.quantity, 0).toFixed(2)
})

const loadContacts = () => {
  axios.get('/api/contact/list')
    .then(res => {
      if (Array.isArray(res.data)) {
        contacts.value = res.data
        if (res.data.length) selectedContactId.value = res.data[0].id
      }
    })
    .catch(err => console.log(err))
}

const addAddress = () => {
  const { name, telephone, address, tag } = newAddress.value
  if (!name || !telephone || !address) {
    ElMessage.warning('请填写完整的地址信息')
    return
  }
  axios.post('/api/contact/add', { name, telephone, address, tag })
    .then(res => {
      if (res.data.code === 200) {
        ElMessage.success('地址添加成功')
        showAddressDialog.value = false
        newAddress.value = { name: '', telephone: '', address: '', tag: '家' }
        loadContacts()
      } else {
        ElMessage.warning(res.data.message)
      }
    })
    .catch(err => console.log(err))
}

const submitOrder = () => {
  if (!selectedContactId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  submitting.value = true
  const items = orderItems.value.map(item => ({
    productId: item.productId,
    detailId: item.detailId,
    quantity: item.quantity
  }))
  axios.post('/api/order/submit', {
    contactId: selectedContactId.value,
    items: items
  }).then(res => {
    if (res.data.code === 200) {
      ElMessage.success('下单成功！')
      sessionStorage.removeItem('checkoutItems')
      router.push('/orderList')
    } else {
      ElMessage.warning(res.data.message)
    }
  }).catch(err => console.log(err))
  .finally(() => { submitting.value = false })
}

onMounted(loadContacts)
</script>

<style scoped>
.checkout-page {
  background: #f5f5f5;
  min-height: 80vh;
  padding: 30px 0;
}
.container {
  width: 1226px;
  margin: 0 auto;
}
h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 30px;
}
.section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.section h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.address-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
.address-card {
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  padding: 14px 18px;
  cursor: pointer;
  min-width: 260px;
  transition: all .3s;
}
.address-card:hover, .address-card.active {
  border-color: #409EFF;
}
.address-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.address-info .name { font-weight: 600; color: #333; }
.address-info .phone { color: #999; }
.address-text { color: #666; margin: 0; font-size: 13px; }
.item-list { margin-bottom: 16px; }
.item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.item:last-child { border-bottom: none; }
.item-img { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; margin-right: 16px; }
.item-info { flex: 1; }
.item-name { color: #333; margin: 0 0 4px; }
.item-price { color: #999; font-size: 13px; margin: 0; }
.item-subtotal { color: #ff6700; font-size: 16px; font-weight: 600; }
.total {
  text-align: right;
  font-size: 16px;
  color: #333;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
.total-price { color: #ff6700; font-size: 24px; font-weight: 700; }
.submit-bar {
  text-align: right;
  padding: 20px 0;
}
</style>
