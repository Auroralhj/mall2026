<template>
  <div class="admin-page">
    <el-container>
      <el-aside width="200px">
        <div class="logo">MoreMall 后台</div>
        <el-menu
          :default-active="activeMenu"
          @select="handleMenuSelect"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="product">商品管理</el-menu-item>
          <el-menu-item index="category">分类管理</el-menu-item>
        </el-menu>
        <div class="back-home" @click="$router.push('/')">
          <el-icon><HomeFilled /></el-icon>
          <span>返回商城</span>
        </div>
      </el-aside>

      <el-main>
        <!-- 商品管理 -->
        <div v-if="activeMenu === 'product'">
          <div class="toolbar">
            <h3>商品管理</h3>
            <el-button type="primary" @click="openProductDialog()">新增商品</el-button>
          </div>
          <el-table :data="products" border stripe style="width:100%">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="name" label="商品名称" min-width="180" />
            <el-table-column label="分类" width="100">
              <template #default="{ row }">
                {{ getCategoryName(row.categoryId) }}
              </template>
            </el-table-column>
            <el-table-column label="规格数" width="80">
              <template #default="{ row }">{{ row.details?.length || 0 }}</template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button size="small" @click="openProductDialog(row)">编辑</el-button>
                <el-popconfirm title="确定删除该商品？" @confirm="deleteProduct(row.id)">
                  <template #reference>
                    <el-button size="small" type="danger">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分类管理 -->
        <div v-if="activeMenu === 'category'">
          <div class="toolbar">
            <h3>分类管理</h3>
            <el-button type="primary" @click="showCategoryDialog = true">新增分类</el-button>
          </div>
          <el-table :data="categories" border stripe style="width:100%" :default-sort="{prop:'id', order:'ascending'}">
            <el-table-column prop="id" label="ID" width="80" sortable />
            <el-table-column prop="name" label="分类名称" />
            <el-table-column prop="create_time" label="创建时间" width="180">
              <template #default="{ row }">{{ formatTime(row.create_time) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-popconfirm title="确定删除该分类？" @confirm="deleteCategory(row.id)">
                  <template #reference>
                    <el-button size="small" type="danger">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-main>
    </el-container>

    <!-- 商品编辑弹窗 -->
    <el-dialog v-model="showProductDialog" :title="editingProduct ? '编辑商品' : '新增商品'" width="700px">
      <el-form label-width="80px">
        <el-form-item label="商品名称">
          <el-input v-model="productForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="productForm.description" type="textarea" placeholder="请输入商品描述" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="productForm.categoryId" placeholder="选择分类">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品规格">
          <div v-for="(d, i) in productForm.details" :key="i" class="detail-row">
            <el-input v-model="d.name" placeholder="规格名称" style="width:140px" />
            <div class="img-upload">
              <img v-if="d.image" :src="d.image" class="img-preview" />
              <span v-else class="img-placeholder">🖼</span>
              <label class="img-upload-btn">
                <input type="file" accept="image/*" @change="onFileChange($event, d)" hidden />
                选择图片
              </label>
            </div>
            <el-input v-model="d.price" placeholder="原价" style="width:100px" />
            <el-input v-model="d.salePrice" placeholder="售价" style="width:100px" />
            <el-input v-model="d.stock" placeholder="库存" style="width:80px" />
            <el-button type="danger" :icon="'Delete'" circle size="small" @click="productForm.details.splice(i,1)" />
          </div>
          <el-button type="primary" link @click="addDetail">+ 添加规格</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProductDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProduct" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 分类新增弹窗 -->
    <el-dialog v-model="showCategoryDialog" title="新增分类" width="400px">
      <el-form label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="newCategoryName" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCategoryDialog = false">取消</el-button>
        <el-button type="primary" @click="addCategory">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const activeMenu = ref('product')
const products = ref([])
const categories = ref([])
const saving = ref(false)

const showProductDialog = ref(false)
const editingProduct = ref(null)
const productForm = ref({ name: '', description: '', categoryId: null, details: [] })

const showCategoryDialog = ref(false)
const newCategoryName = ref('')

const handleMenuSelect = (key) => { activeMenu.value = key }

const loadProducts = () => {
  axios.get('/api/product/list')
    .then(res => { if (Array.isArray(res.data)) products.value = res.data })
    .catch(err => console.log(err))
}

const loadCategories = () => {
  axios.get('/api/category/list?t=' + Date.now())
    .then(res => { if (Array.isArray(res.data)) categories.value = res.data })
    .catch(err => console.log(err))
}

const getCategoryName = (id) => {
  const c = categories.value.find(c => c.id === id)
  return c ? c.name : '-'
}

const onFileChange = (e, detail) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { detail.image = ev.target.result }
  reader.readAsDataURL(file)
}

const addDetail = () => {
  productForm.value.details.push({ name: '', image: '', price: '', salePrice: '', stock: '' })
}

const openProductDialog = (product) => {
  if (product) {
    editingProduct.value = product
    productForm.value = {
      id: product.id,
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      details: (product.details || []).map(d => ({
        id: d.id, name: d.name, image: d.image,
        price: d.price, salePrice: d.salePrice, stock: d.stock
      }))
    }
  } else {
    editingProduct.value = null
    productForm.value = { name: '', description: '', categoryId: null, details: [] }
  }
  showProductDialog.value = true
}

const saveProduct = () => {
  const { id, name, description, categoryId, details } = productForm.value
  if (!name || !categoryId || !details.length) {
    ElMessage.warning('请填写完整的商品信息')
    return
  }
  saving.value = true
  const url = editingProduct.value ? '/api/admin/product/update' : '/api/admin/product/add'
  const data = editingProduct.value ? { id, name, description, categoryId, details } : { name, description, categoryId, details }
  axios.post(url, data)
    .then(res => {
      if (res.data.code === 200) {
        ElMessage.success(res.data.message)
        showProductDialog.value = false
        loadProducts()
      } else ElMessage.warning(res.data.message)
    })
    .catch(err => console.log(err))
    .finally(() => { saving.value = false })
}

const deleteProduct = (id) => {
  axios.post('/api/admin/product/delete', { id })
    .then(res => {
      if (res.data.code === 200) {
        ElMessage.success(res.data.message)
        loadProducts()
      } else ElMessage.warning(res.data.message)
    })
    .catch(err => console.log(err))
}

const deleteCategory = (id) => {
  axios.post('/api/admin/category/delete', { id })
    .then(res => {
      if (res.data.code === 200) {
        ElMessage.success(res.data.message)
        loadCategories()
      } else ElMessage.warning(res.data.message)
    })
    .catch(err => console.log(err))
}

const addCategory = () => {
  if (!newCategoryName.value) {
    ElMessage.warning('请输入分类名称')
    return
  }
  axios.post('/api/admin/category/add', { name: newCategoryName.value })
    .then(res => {
      if (res.data.code === 200) {
        ElMessage.success(res.data.message)
        showCategoryDialog.value = false
        newCategoryName.value = ''
        loadCategories()
      } else ElMessage.warning(res.data.message)
    })
    .catch(err => console.log(err))
}

const formatTime = (t) => {
  if (!t) return ''
  return new Date(t).toLocaleString('zh-CN')
}

onMounted(() => {
  loadProducts()
  loadCategories()
})
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
}
.el-aside {
  background: #304156;
  min-height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}
.logo {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.el-menu {
  border-right: none;
}
.back-home {
  position: absolute;
  bottom: 24px;
  left: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 0;
  color: #bfcbd9;
  font-size: 15px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-home:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.back-home .el-icon {
  font-size: 18px;
}
.el-main {
  margin-left: 200px;
  background: #f5f5f5;
  min-height: 100vh;
  padding: 24px;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.toolbar h3 { margin: 0; font-size: 18px; color: #333; }
.img-upload {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.img-preview {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.img-placeholder {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 1px dashed #d0d0d0;
  color: #bbb;
  font-size: 18px;
  background: #fafafa;
}

.img-upload-btn {
  font-size: 12px;
  color: #409EFF;
  cursor: pointer;
  padding: 4px 10px;
  border: 1px solid #409EFF;
  border-radius: 4px;
  white-space: nowrap;
  transition: all .2s;
}

.img-upload-btn:hover {
  color: #fff;
  background: #409EFF;
}

.detail-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}
</style>
