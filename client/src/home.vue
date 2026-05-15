<script setup>
import icon1 from './assets/icon1.png'
import icon2 from './assets/icon2.png'
import icon3 from './assets/icon3.png'
import {ref, reactive} from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

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

</script>
<template>
<header class="tan-site-header">
    <div class="tan-site-topbar">
      <div class="container">
        <div>
          <a>MoreMall商城</a>
        </div>
        <div v-if="user.username" >
                <img :src="user.avatar" style="width: 16px;height 16px;" />
                <span>{{ user.username }}</span>
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
    <div slot="footer" class="dialog-footer">
    <el-button @click="loginFormVisible = false">取 消</el-button>
    <el-button type="primary" @click="doLogin">登 录</el-button>
    </div>
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
</style>