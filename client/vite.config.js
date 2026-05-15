import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  // 代理跨域
  server: {
    //设置前端网站的端口
    port: 8000,
    //代理协议
    proxy: {
      '/api': //请求转发的前缀
      {
        target: 'http://localhost:3000',  //目标地址
        changeOrigin: true,               //是否跨域
        rewrite: (path) => path.replace(/^\/api/, '') //请求转发的路径
      },
    }
  },
})
