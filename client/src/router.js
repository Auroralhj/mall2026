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
            }
        ]
    }
]

const router = createRouter({
    history : createWebHistory(),
    routes
});

export default router