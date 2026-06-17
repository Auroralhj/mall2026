<script setup>
import icon1 from './assets/icon1.png'
import icon2 from './assets/icon2.png'
import icon3 from './assets/icon3.png'
import {ref, reactive} from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter();

const formLabelWidth = ref("90px");
const loginFormVisible = ref(false);
const loginform = reactive({
        name: "",
        password: "",
    });
const loginformRef = ref(null);
const loginrules = reactive({
        name: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "change" },
          { min: 3, message: "密码长度不少于3个字符", trigger: "change" },
        ],
      });

const doLogin = () => {
    loginformRef.value.validate((valid) => {
        if (valid) {
          console.log("提交数据到服务端");
          axios
            .post("/api/user/login", {
              username: loginform.name,
              password: loginform.password,
            })
            .then((res) => {
              console.log(res);
              if (res.data.code == 200){
                ElMessage({
                showClose: true,
                message: '登录成功！',
                type: 'success'
                });
                loadUser();
                loginFormVisible.value = false;
              }else{
                ElMessage({
                showClose: true,
                message: res.data.message,
                type: 'error'
                });
              }
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          ElMessage.error("登录数据填写有误！");
          return false;
        }
      });
    }
const user =  ref({});

const loadUser = () => {
    axios
      .get("/api/user/profile")
      .then((res) => {
        user.value = res.data;
      })
      .catch((err) => {
        console.log(err);
      });
  }

loadUser();

const avatars = ref([]);

axios
  .get("/api/avatars")
  .then((res) => {
    console.log(res);
    avatars.value = res.data;
  })
  .catch((err) => {
    console.log(err);
  });

const regFormVisible = ref(false);
const regform = reactive({
        name: "",
        password: "",
        email: "",
        avatar: "",
      });

const doRegister = () => {
      axios
        .post("/api/user/register", {
          username: regform.name,
          password: regform.password,
          email: regform.email,
          avatar: regform.avatar,
        })
        .then((res) => {
            if (res.data.code == 200){
                ElMessage({
                showClose: true,
                message: '注册成功！',
                type: 'success'
                });
                loginFormVisible.value = true;
                regFormVisible.value = false;
              }else{
                ElMessage({
                showClose: true,
                message: "用户名或者email已存在!",
                type: 'error'
                });
              }
        })
        .catch((err) => {
          console.log(err);
        });
    };

// 个人设置
const settingsVisible = ref(false);
const saving = ref(false);
const settingsForm = reactive({
  nickname: '', avatar: '', oldPassword: '', newPassword: '', confirmPassword: ''
});

const openSettings = () => {
  settingsForm.nickname = user.value.username || '';
  settingsForm.avatar = user.value.avatar || '';
  settingsForm.oldPassword = '';
  settingsForm.newPassword = '';
  settingsForm.confirmPassword = '';
  settingsVisible.value = true;
};

const saveSettings = () => {
  if (settingsForm.nickname !== user.value.username || settingsForm.avatar !== user.value.avatar) {
    saving.value = true;
    axios.post('/api/user/update', { username: settingsForm.nickname, avatar: settingsForm.avatar })
      .then(res => {
        if (res.data.code === 200) {
          user.value.username = settingsForm.nickname;
          user.value.avatar = settingsForm.avatar;
          ElMessage.success('信息已更新');
        } else ElMessage.warning(res.data.message);
      }).catch(err => console.log(err)).finally(() => { saving.value = false });
  }
  if (settingsForm.oldPassword || settingsForm.newPassword) {
    if (!settingsForm.oldPassword) { ElMessage.warning('请输入原密码'); return; }
    if (!settingsForm.newPassword) { ElMessage.warning('请输入新密码'); return; }
    if (settingsForm.newPassword !== settingsForm.confirmPassword) { ElMessage.warning('两次密码不一致'); return; }
    saving.value = true;
    axios.post('/api/user/password', { oldPassword: settingsForm.oldPassword, newPassword: settingsForm.newPassword })
      .then(res => {
        if (res.data.code === 200) {
          ElMessage.success('密码已修改，请重新登录');
          user.value = {}; settingsVisible.value = false;
        } else ElMessage.warning(res.data.message);
      }).catch(err => console.log(err)).finally(() => { saving.value = false });
  }
};

const handleUserCommand = (command) => {
  switch (command) {
    case 'settings': openSettings(); break;
    case 'orders': router.push('/orderList'); break;
    case 'logout': user.value = {}; ElMessage.success('已退出登录'); router.push('/'); break;
  }
};

</script>
<template>
<header class="tan-site-header">
    <div class="tan-site-topbar">
      <div class="container">
        <div>
          <router-link to="/productList">MoreMall商城</router-link>
        </div>
        <div v-if="user.username" class="user-area">
                <router-link :to="{ path: '/cart' }">购物车</router-link>
                <router-link to="/admin">后台管理</router-link>
                <el-dropdown @command="handleUserCommand" trigger="click">
                  <span class="user-dropdown-trigger">
                    <img :src="user.avatar" class="user-avatar" />
                    <span>{{ user.username }}</span>
                    <el-icon><ArrowDown /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="settings">个人设置</el-dropdown-item>
                      <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                      <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
        </div>
          <div v-else>
            <span @click="loginFormVisible = true">登录</span>
            <span @click="regFormVisible = true">注册</span>
          </div>
      </div>
    </div>
 </header>
 <router-view />
 <footer class="tan-site-footer">
    <ul class="tan-site-footer-top">
        <li>
            <img :src="icon1" alt="" />
            <span>30天无忧退换货</span>
        </li>
        <li>
            <img :src="icon2" alt="" />
            <span>满88元免邮费</span>
        </li>
        <li>
            <img :src="icon3" alt="" />
            <span>XX品质保证</span>
        </li>
    </ul>
    <div class="tan-site-footer-bottom">
        <ul>
            <li>关于我们</li>
            <li>帮助中心</li>
            <li>售后服务</li>
            <li>配送与验收</li>
            <li>商务合作</li>
            <li>企业采购</li>
            <li>开放平台</li>
            <li>搜索推荐</li>
            <li>友情链接</li>
        </ul>
        <p>XX公司版权所有 © 1996-2026 经营许可证：XXXXXXXXXXXXXXXXX</p>
    </div>
</footer>
<el-dialog title="登录" v-model="loginFormVisible">
    <el-form
    :model="loginform"
    ref="loginformRef"
    :rules="loginrules"
    :label-width="formLabelWidth"
    >
    <el-form-item label="用户名：" prop="name">
        <el-input
        v-model="loginform.name"
        placeholder="请输入用户名"
        prefix-icon="key"
        ></el-input>
    </el-form-item>
    <el-form-item label="密码：" prop="password">
        <el-input
        v-model="loginform.password"
        placeholder="请输入密码"
        prefix-icon="unlock"
        show-password
        ></el-input>
    </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
      <el-button @click="loginFormVisible = false">取 消</el-button>
      <el-button type="primary" @click="doLogin">登 录</el-button>
      </div>
    </template>
</el-dialog>
<el-dialog title="注册" v-model="regFormVisible">
      <el-form :model="regform" :label-width="formLabelWidth">
        <el-form-item label="用户名：">
          <el-input
            v-model="regform.name"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码：">
          <el-input
            v-model="regform.password"
            placeholder="请输入密码"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item label="电子邮箱：">
          <el-input
            v-model="regform.email"
            placeholder="请输入电子邮箱："
          ></el-input>
        </el-form-item>
        <el-form-item label="头像：">
          <el-radio-group v-model="regform.avatar">
            <el-radio
              :label="item"
              v-for="(item, index) in avatars"
              :key="index"
            >
              <img :src="item" style="width: 48px;height:48px;" />
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="regFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="doRegister">注 册</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 个人设置弹窗 -->
    <el-dialog title="个人设置" v-model="settingsVisible" width="480px">
      <el-form :model="settingsForm" label-width="90px">
        <el-form-item label="昵称">
          <el-input v-model="settingsForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="头像">
          <el-radio-group v-model="settingsForm.avatar">
            <el-radio v-for="(item, index) in avatars" :key="index" :label="item">
              <img :src="item" style="width:40px;height:40px;border-radius:50%;" />
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-divider>修改密码（留空则不修改）</el-divider>
        <el-form-item label="原密码">
          <el-input v-model="settingsForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="settingsForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="settingsForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="settingsVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSettings" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
</template>
<style scoped>
.tan-site-header {
    background-color: #fff;
    border-bottom: 1px solid #e0e0e0;;
}


.tan-site-topbar {
    background-color: #333;
    height: 40px;
}

.tan-site-topbar > .container {
    display: flex;
    justify-content: space-between;
}

.tan-site-topbar a,
.tan-site-topbar span {
    color: #b0b0b0;
    line-height: 40px;
    font-size: 12px;
    cursor: pointer;
    padding: 0 5px;
    transition: all .3s;
}

.tan-site-topbar a:hover,
.tan-site-topbar span:hover {
    color: #fff;
}

.tan-site-footer {
    height: 230px;
    background-color: #414141;
    color:white;
    overflow: hidden;
}

.tan-site-footer-top {
    display: flex;
    padding: 36px 0;
    border-bottom: 1px solid #4f4f4f;
}

.tan-site-footer-top > li {
    display: flex;
    width: 33%;
    height: 60px;
    justify-content: center;
    align-items: center;
}

.tan-site-footer-top > li > span {
    vertical-align: middle;
    font-size: 18px;
    margin-left: 10px;
}

.tan-site-footer-top > img {
    vertical-align: middle;
}

.tan-site-footer-bottom {
    color: #aaa;
    font-size: 13px;
    text-align: center;
    margin-top: 30px;
}

.tan-site-footer-bottom > ul > li {
    display: inline-block;
    cursor: pointer;
    padding: 0 6px;
    border-right: 2px solid #aaa;
}

.tan-site-footer-bottom > ul > li:last-child {
    border-right:none;
}

.tan-site-footer-bottom > p {
    margin: 5px;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #b0b0b0;
  line-height: 40px;
  font-size: 12px;
  transition: color .3s;
}
.user-dropdown-trigger:hover { color: #fff; }

.user-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  vertical-align: middle;
}
</style>