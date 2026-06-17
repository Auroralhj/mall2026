# MoreMall 商城功能扩展设计文档

> 日期：2026-06-17
> 项目：mall2026 网上商城
> 课程：《脚本程序设计》期末项目

---

## 一、项目背景

现有项目是一个基于 **Node-RED + MySQL + Vue3 + Element Plus** 的网上商城，已实现用户登录注册、商品浏览、购物车等基础功能。本次扩展在现有基础上新增订单功能、完善用户端、新增后台管理。

## 二、技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + Vite + Element Plus + Vue Router + Axios |
| 后端 | Node-RED (JavaScript Function Node) |
| 数据库 | MySQL 8.0（现有数据表无需改动） |
| 认证 | Express Session |

## 三、新增/改造范围总览

| 模块 | 类型 | 数据库 | 后端 API | 前端页面 |
|------|------|--------|----------|----------|
| 订单功能 | 新增 | 已有表 | 新增 4 个接口 | 新增 2 个页面 |
| 收货地址 | 新增 | 已有表 | 新增 4 个接口 | 嵌入结算页 |
| 用户增强 | 改造 | 已有表 | 新增 3 个接口 | 改造 2 处 |
| 商品搜索 | 新增 | 无 | 新增 1 个接口 | 改造 1 处 |
| 后台管理 | 新增 | 已有表 | 新增 4 个接口 | 新增 1 个页面 |
| UI 翻新 | 改造 | 无 | 无 | 全局样式 |

## 四、数据库

现有表无需改动，直接使用。涉及的表：

- `order` — 订单主表（id, price, paid, contact_id, user_id, create_time, update_time）
- `order_detail` — 订单明细（id, quantity, order_id, product_id, detail_id）
- `contact` — 收货地址（id, name, telephone, address, tag, user_id）
- `user` — 用户（已有 username, password, email, avatar，无需加字段）
- `product` / `product_detail` / `product_category` — 商品相关表（后台管理操作）

## 五、后端 API 设计

在 `flows.json` 新增三个 Tab：**订单操作**、**收货地址**、**后台管理**，并在现有 Tab **首页和用户信息** 补充接口。

### 5.1 订单操作 Tab

| 路由 | 方法 | 功能 | 关键逻辑 |
|------|------|------|----------|
| `/order/submit` | POST | 提交订单 | 校验登录；生成订单 ID（时间戳+随机数）；插入 order + order_detail；清空购物车已勾选商品；返回订单 ID |
| `/order/list` | GET | 订单列表 | 按用户 ID 查询，关联 contact 显示地址信息，按时间倒序 |
| `/order/detail` | GET | 订单详情 | 按 order_id 查询，返回订单信息 + 商品明细 + 收货地址 |
| `/order/pay` | POST | 模拟支付 | 校验登录和订单归属；更新 paid=1 |

### 5.2 收货地址 Tab

| 路由 | 方法 | 功能 |
|------|------|------|
| `/contact/list` | GET | 当前用户地址列表 |
| `/contact/add` | POST | 新增（name, telephone, address, tag） |
| `/contact/update` | POST | 修改地址信息 |
| `/contact/delete` | POST | 按 ID 删除（校验归属） |

### 5.3 后台管理 Tab

| 路由 | 方法 | 功能 |
|------|------|------|
| `/admin/product/add` | POST | 新增商品（含规格信息，同时写入 product 和 product_detail） |
| `/admin/product/update` | POST | 修改商品和规格 |
| `/admin/product/delete` | POST | 按 ID 删除商品 |
| `/admin/category/add` | POST | 新增商品分类 |

> 商品列表和分类列表复用现有 `/product/list` 和 `/category/list` 接口。

### 5.4 现有 Tab 补充

| 路由 | 方法 | 功能 |
|------|------|------|
| `/user/update` | POST | 修改昵称/头像 |
| `/user/password` | POST | 修改密码（需验证原密码） |
| `/product/search` | GET | 按关键词模糊搜索商品名 |

## 六、前端设计

### 6.1 新增页面

#### a. 结算/下单页 `/checkout`

**入口**：购物车底部「去结算」按钮

**数据传递**：通过 `sessionStorage` 传递勾选的商品数据（productId, detailId, quantity, image, name, price），结算页读取后清除。

**页面结构**：
- 收货地址区域：单选已有地址，支持新增/编辑地址（弹窗）
- 商品清单区域：展示从购物车带入的商品（图片、名称、规格、单价、数量、小计）
- 合计金额
- 「提交订单」按钮

**交互流程**：
1. 从购物车勾选商品 → 点击去结算 → 路由跳转 `/checkout`
2. 选择/新增收货地址
3. 确认商品和金额
4. 点击提交订单 → 调用 `/order/submit` → 成功后跳转到 `/orderList`，显示「下单成功」

#### b. 订单列表页 `/orderList`

**入口**：顶部用户菜单「我的订单」

**页面结构**：
- 订单卡片列表，每条显示：订单号、时间、金额、状态标签（待付款=灰色 / 已支付=绿色）、商品缩略图
- 点击展开订单详情（商品明细 + 收货地址）
- 待付款订单显示「去支付」按钮

#### c. 后台管理页 `/admin`

**入口**：独立路由 `/admin`，需登录校验（任意登录用户可访问）

**页面结构**：
- 左侧边栏：商品管理 / 分类管理
- 商品管理：表格（商品名、分类、价格、库存）+ 新增/编辑弹窗（含规格添加）+ 删除确认
- 分类管理：列表 + 新增弹窗

### 6.2 改造页面

#### a. 用户中心

改造 `home.vue` header 区域：
- 登录后显示头像+昵称，点击出现下拉菜单：个人设置 / 我的订单 / 退出登录
- 「个人设置」弹窗：修改昵称、头像（从预设选择）、修改密码（输入原密码+新密码）

#### b. 搜索功能

改造 `productList.vue` 顶部搜索框：
- 输入关键词 → 回车或点击搜索 → 调用 `/product/search` → 刷新商品列表

#### c. 购物车改造

改造 `cart.vue`：
- 底部新增「去结算」按钮，点击将已勾选商品信息带入 `/checkout`
- 空购物车时显示空状态提示

#### d. 商品详情改造

改造 `productDetail.vue`：
- 「立即购买」按钮功能：以当前商品直接跳转结算页，通过 `sessionStorage` 传递单个商品数据（数量=1）

### 6.3 路由新增

```javascript
// router.js 新增路由
{ path: '/checkout', component: () => import('./checkout.vue') }
{ path: '/orderList', component: () => import('./orderList.vue') }
{ path: '/admin', component: () => import('./admin.vue') }
```

### 6.4 UI 翻新

- **配色**：主色调改为更现代的蓝色系（`#409EFF` → 配合 Element Plus 主题色）
- **字体**：统一使用系统字体栈，标题加粗
- **间距**：页面内容区域统一 `max-width: 1226px` + 居中对齐
- **卡片**：圆角阴影卡片风格
- **导航**：header 固定顶部，优化响应式
- **页脚**：保留现有结构，更新配色

## 七、错误处理与校验

| 场景 | 处理 |
|------|------|
| 未登录访问结算/订单页 | 重定向到首页，弹出登录框 |
| 订单提交时地址为空 | 提示「请选择收货地址」 |
| 订单提交时库存不足 | 提示具体商品库存不足 |
| 修改密码原密码错误 | 提示「原密码错误」 |
| 后台删除商品 | 二次确认弹窗 |
| 网络异常 | 统一 axios 拦截器处理，ElMessage 提示 |

## 八、测试要点

1. 完整下单流程：选商品 → 加购 → 结算 → 选地址 → 提交 → 查看订单
2. 地址 CRUD：新增、编辑、删除、切换选中
3. 用户信息修改：昵称、头像、密码
4. 搜索：空搜索、模糊搜索、无结果
5. 后台商品管理：新增（含多规格）、编辑、删除
6. 异常场景：未登录拦截、库存不足、空购物车结算

## 九、新增文件清单

```
server/flows.json              — 修改：新增 3 个 Tab + 补充现有 Tab
client/src/checkout.vue        — 新增：结算/下单页
client/src/orderList.vue       — 新增：订单列表页
client/src/admin.vue           — 新增：后台管理页
client/src/router.js           — 修改：新增 3 条路由
client/src/home.vue            — 修改：用户菜单下拉、个人设置弹窗
client/src/cart.vue            — 修改：去结算按钮、空状态
client/src/productList.vue     — 修改：搜索功能
client/src/productDetail.vue   — 修改：立即购买
client/src/style.css           — 修改：UI 翻新全局样式
```
