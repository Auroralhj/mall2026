import { createRouter, createWebHistory} from 'vue-router'


const routes = [
    {
        path : "/",
        name : 'home',
        component: () => import('./home.vue'),
        children : [
            {
                path : "/",
                component : () => import('./index.vue')
            },
            {
                path: '/productList', 
                component: () => import('./productList.vue')
            },
            { 
                path: '/productDetail/:id',
                component: () => import('./productDetail.vue')
            },
            {
                path: '/cart',
                component: () => import('./cart.vue')
            },
            {
                path: '/checkout',
                component: () => import('./checkout.vue')
            },
            {
                path: '/orderList',
                component: () => import('./orderList.vue')
            },
        ]
    },
    {
        path: '/admin',
        component: () => import('./admin.vue')
    }
]

const router = createRouter({
    history : createWebHistory(),
    routes
});

export default router