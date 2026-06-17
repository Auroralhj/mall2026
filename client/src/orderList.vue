<template>
  <div class="order-page">
    <div class="container">
      <h2>我的订单</h2>

      <div v-if="!orders.length" class="empty">
        <p>还没有订单</p>
        <el-button type="primary" @click="$router.push('/productList')">去逛逛</el-button>
      </div>

      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-id">订单号：{{ order.id }}</span>
          <span class="order-time">{{ formatTime(order.create_time) }}</span>
          <el-tag :type="order.paid ? 'success' : 'info'" size="small">
            {{ order.paid ? '已支付' : '待付款' }}
          </el-tag>
        </div>

        <div class="order-body">
          <div v-if="order.details" class="detail-list">
            <div v-for="d in order.details" :key="d.id" class="detail-item">
              <img :src="d.image" class="detail-img" />
              <div class="detail-info">
                <p class="detail-name">{{ d.pname }} {{ d.detail_name }}</p>
                <p class="detail-price">¥{{ d.sale_price }} × {{ d.quantity }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <div class="contact-info" v-if="order.contact_name">
            <span>{{ order.contact_name }} {{ order.telephone }}</span>
            <span class="contact-addr">{{ order.address }}</span>
          </div>
          <div class="order-actions">
            <span class="order-price">合计：¥{{ order.price }}</span>
            <el-button
              v-if="!order.paid"
              type="primary"
              size="small"
              @click="payOrder(order.id)"
              :loading="payingId === order.id"
            >去支付</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const orders = ref([])
const payingId = ref(null)

const loadOrders = () => {
  axios.get('/api/order/list')
    .then(res => {
      if (Array.isArray(res.data)) orders.value = res.data
    })
    .catch(err => console.log(err))
}

const payOrder = (orderId) => {
  payingId.value = orderId
  axios.post('/api/order/pay', { orderId })
    .then(res => {
      if (res.data.code === 200) {
        ElMessage.success('支付成功！')
        loadOrders()
      } else ElMessage.warning(res.data.message)
    })
    .catch(err => console.log(err))
    .finally(() => { payingId.value = null })
}

const formatTime = (t) => {
  if (!t) return ''
  return new Date(t).toLocaleString('zh-CN')
}

onMounted(loadOrders)
</script>

<style scoped>
.order-page {
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
.empty {
  text-align: center;
  padding: 80px 0;
  color: #999;
}
.order-card {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
}
.order-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}
.order-id { font-size: 13px; color: #666; }
.order-time { font-size: 12px; color: #999; flex: 1; }
.order-body { padding: 16px 24px; }
.detail-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
}
.detail-img { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 12px; }
.detail-name { color: #333; margin: 0 0 4px; }
.detail-price { color: #999; font-size: 13px; margin: 0; }
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  border-top: 1px solid #f0f0f0;
}
.contact-info { color: #666; font-size: 13px; }
.contact-addr { margin-left: 12px; color: #999; }
.order-actions { text-align: right; }
.order-price { color: #333; margin-right: 16px; font-size: 16px; }
</style>
