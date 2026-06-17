const fs = require('fs');
const crypto = require('crypto');
function genId() { return crypto.randomBytes(8).toString('hex'); }

const flowsPath = 'C:/Users/林鸿杰/Desktop/期末作业/mall2026/server/flows.json';
const flows = JSON.parse(fs.readFileSync(flowsPath, 'utf8'));

// Find the "首页和用户信息" tab id
const homeTab = flows.find(n => n.label === "首页和用户信息");
const homeTabId = homeTab.id;
const homeRespId = flows.find(n => n.z === homeTabId && n.type === "http response").id;
const homeDebugId = flows.find(n => n.z === homeTabId && n.type === "debug").id;

// === 后台管理 Tab ===
const adminTabId = genId();
const adminRespId = genId();
const adminDebugId = genId();

// Pre-generate function IDs
const fAddProductId = genId();
const fUpdateProductId = genId();
const fDeleteProductId = genId();
const fAddCategoryId = genId();

const adminNodes = [
    { id: adminTabId, type: "tab", label: "后台管理", disabled: false, info: "", env: [] },

    // POST /admin/product/add
    { id: genId(), type: "http in", z: adminTabId, name: "", url: "/admin/product/add", method: "post", upload: false, skipBodyParsing: false, swaggerDoc: "", x: 180, y: 120, wires: [[fAddProductId]] },
    { id: fAddProductId, type: "function", z: adminTabId, name: "新增商品",
      func: "const db = global.get('mysql');\nlet userId = msg.req.session.user?.id;\nif (!userId) { msg.payload = { code: 400, message: '请先登录' }; return msg; }\nlet { name, description, categoryId, details } = msg.req.body;\nif (!name || !categoryId || !details || !details.length) {\n    msg.payload = { code: 400, message: '商品信息不完整' }; return msg;\n}\nlet now = new Date();\nawait db.sql('INSERT INTO product(name, description, category_id, show_index) VALUES(?,?,?,0)', name, description, categoryId)\n    .then(async res => {\n        let productId = res.insertId;\n        for (let d of details) {\n            await db.sql('INSERT INTO product_detail(name, image, stock, price, sale_price, product_id) VALUES(?,?,?,?,?,?)',\n                d.name, d.image, d.stock, d.price, d.salePrice, productId);\n        }\n        msg.payload = { code: 200, message: '商品添加成功！', productId: productId };\n    })\n    .catch(err => { console.log(err); msg.payload = { code: 500, err }; });\nreturn msg;",
      outputs: 1, timeout: 0, noerr: 0, initialize: "", finalize: "", libs: [],
      x: 470, y: 120, wires: [[adminRespId, adminDebugId]] },

    // POST /admin/product/update
    { id: genId(), type: "http in", z: adminTabId, name: "", url: "/admin/product/update", method: "post", upload: false, skipBodyParsing: false, swaggerDoc: "", x: 180, y: 200, wires: [[fUpdateProductId]] },
    { id: fUpdateProductId, type: "function", z: adminTabId, name: "修改商品",
      func: "const db = global.get('mysql');\nlet userId = msg.req.session.user?.id;\nif (!userId) { msg.payload = { code: 400, message: '请先登录' }; return msg; }\nlet { id, name, description, categoryId, details } = msg.req.body;\nif (!id) { msg.payload = { code: 400, message: '缺少商品ID' }; return msg; }\nawait db.sql('UPDATE product SET name=?, description=?, category_id=? WHERE id=?', name, description, categoryId, id);\nif (details && details.length) {\n    await db.sql('DELETE FROM product_detail WHERE product_id=?', id);\n    for (let d of details) {\n        await db.sql('INSERT INTO product_detail(name, image, stock, price, sale_price, product_id) VALUES(?,?,?,?,?,?)',\n            d.name, d.image, d.stock, d.price, d.salePrice, id);\n    }\n}\nmsg.payload = { code: 200, message: '商品修改成功！' };\nreturn msg;",
      outputs: 1, timeout: 0, noerr: 0, initialize: "", finalize: "", libs: [],
      x: 470, y: 200, wires: [[adminRespId, adminDebugId]] },

    // POST /admin/product/delete
    { id: genId(), type: "http in", z: adminTabId, name: "", url: "/admin/product/delete", method: "post", upload: false, skipBodyParsing: false, swaggerDoc: "", x: 180, y: 280, wires: [[fDeleteProductId]] },
    { id: fDeleteProductId, type: "function", z: adminTabId, name: "删除商品",
      func: "const db = global.get('mysql');\nlet userId = msg.req.session.user?.id;\nif (!userId) { msg.payload = { code: 400, message: '请先登录' }; return msg; }\nlet { id } = msg.req.body;\nif (!id) { msg.payload = { code: 400, message: '缺少商品ID' }; return msg; }\nawait db.sql('DELETE FROM product_detail WHERE product_id=?', id);\nawait db.sql('DELETE FROM product WHERE id=?', id);\nmsg.payload = { code: 200, message: '商品删除成功！' };\nreturn msg;",
      outputs: 1, timeout: 0, noerr: 0, initialize: "", finalize: "", libs: [],
      x: 470, y: 280, wires: [[adminRespId, adminDebugId]] },

    // POST /admin/category/add
    { id: genId(), type: "http in", z: adminTabId, name: "", url: "/admin/category/add", method: "post", upload: false, skipBodyParsing: false, swaggerDoc: "", x: 180, y: 360, wires: [[fAddCategoryId]] },
    { id: fAddCategoryId, type: "function", z: adminTabId, name: "新增分类",
      func: "const db = global.get('mysql');\nlet userId = msg.req.session.user?.id;\nif (!userId) { msg.payload = { code: 400, message: '请先登录' }; return msg; }\nlet { name } = msg.req.body;\nif (!name) { msg.payload = { code: 400, message: '分类名称不能为空' }; return msg; }\nlet now = new Date();\nawait db.sql('INSERT INTO product_category(name, create_time, update_time) VALUES(?,?,?)', name, now, now)\n    .then(res => { msg.payload = { code: 200, message: '分类添加成功！', id: res.insertId }; })\n    .catch(err => { console.log(err); msg.payload = { code: 500, err }; });\nreturn msg;",
      outputs: 1, timeout: 0, noerr: 0, initialize: "", finalize: "", libs: [],
      x: 470, y: 360, wires: [[adminRespId, adminDebugId]] },

    // Shared HTTP Response + Debug
    { id: adminRespId, type: "http response", z: adminTabId, name: "", statusCode: "", headers: {}, x: 850, y: 240, wires: [] },
    { id: adminDebugId, type: "debug", z: adminTabId, name: "debug", active: true, tosidebar: true, console: false, tostatus: false, complete: "false", statusVal: "", statusType: "auto", x: 850, y: 120, wires: [] }
];

flows.push(...adminNodes);

// === 补充现有「首页和用户信息」Tab ===
const httpUserUpdateId = genId();
const funcUserUpdateId = genId();
const httpPasswordId = genId();
const funcPasswordId = genId();
const httpSearchId = genId();
const funcSearchId = genId();

const homeNodes = [
    // POST /user/update
    { id: httpUserUpdateId, type: "http in", z: homeTabId, name: "", url: "/user/update", method: "post", upload: false, skipBodyParsing: false, swaggerDoc: "", x: 320, y: 660, wires: [[funcUserUpdateId]] },
    { id: funcUserUpdateId, type: "function", z: homeTabId, name: "修改用户信息",
      func: "const db = global.get('mysql');\nlet userId = msg.req.session.user?.id;\nif (!userId) { msg.payload = { code: 400, message: '请先登录' }; return msg; }\nlet { username, avatar } = msg.req.body;\nlet updates = [], args = [];\nif (username) { updates.push('username=?'); args.push(username); }\nif (avatar) { updates.push('avatar=?'); args.push(avatar); }\nif (!updates.length) { msg.payload = { code: 400, message: '没有要修改的信息' }; return msg; }\nargs.push(userId);\nawait db.sql('UPDATE user SET ' + updates.join(',') + ' WHERE id=?', ...args)\n    .then(async res => {\n        let user = await db.sql('SELECT * FROM user WHERE id=?', userId);\n        if (user.length) { msg.req.session.user = user[0]; msg.payload = { code: 200, message: '修改成功！' }; }\n        else msg.payload = { code: 500, message: '用户不存在' };\n    })\n    .catch(err => { console.log(err); msg.payload = { code: 500, err }; });\nreturn msg;",
      outputs: 1, timeout: 0, noerr: 0, initialize: "", finalize: "", libs: [],
      x: 590, y: 660, wires: [[homeRespId, homeDebugId]] },

    // POST /user/password
    { id: httpPasswordId, type: "http in", z: homeTabId, name: "", url: "/user/password", method: "post", upload: false, skipBodyParsing: false, swaggerDoc: "", x: 320, y: 760, wires: [[funcPasswordId]] },
    { id: funcPasswordId, type: "function", z: homeTabId, name: "修改密码",
      func: "const db = global.get('mysql');\nlet userId = msg.req.session.user?.id;\nif (!userId) { msg.payload = { code: 400, message: '请先登录' }; return msg; }\nlet { oldPassword, newPassword } = msg.req.body;\nif (!oldPassword || !newPassword) { msg.payload = { code: 400, message: '密码信息不完整' }; return msg; }\nif (newPassword.length < 3) { msg.payload = { code: 400, message: '新密码长度不少于3位' }; return msg; }\nawait db.sql('SELECT * FROM user WHERE id=?', userId)\n    .then(async res => {\n        if (!res.length || res[0].password !== oldPassword) {\n            msg.payload = { code: 400, message: '原密码错误' };\n            return;\n        }\n        await db.sql('UPDATE user SET password=? WHERE id=?', newPassword, userId);\n        msg.payload = { code: 200, message: '密码修改成功！' };\n    })\n    .catch(err => { console.log(err); msg.payload = { code: 500, err }; });\nreturn msg;",
      outputs: 1, timeout: 0, noerr: 0, initialize: "", finalize: "", libs: [],
      x: 590, y: 760, wires: [[homeRespId, homeDebugId]] },

    // GET /product/search
    { id: httpSearchId, type: "http in", z: homeTabId, name: "", url: "/product/search", method: "get", upload: false, skipBodyParsing: false, swaggerDoc: "", x: 170, y: 860, wires: [[funcSearchId]] },
    { id: funcSearchId, type: "function", z: homeTabId, name: "商品搜索",
      func: "const db = global.get('mysql');\nlet keyword = msg.req.query.keyword;\nif (!keyword) { msg.payload = []; return msg; }\nawait db.sql(\"SELECT *, a.id AS aid, a.name AS aname FROM product a, product_detail b WHERE a.id = b.product_id AND a.name LIKE ?\", '%'+keyword+'%')\n    .then(res => {\n        let data = [], lastObj = null;\n        for (let i=0; i<res.length; i++) {\n            if (lastObj && lastObj.id == res[i].aid) {\n                lastObj.details.push({ id: res[i].id, name: res[i].name, image: res[i].image, stock: res[i].stock, price: res[i].price, salePrice: res[i].sale_price });\n            } else {\n                let obj = { id: res[i].aid, name: res[i].aname, description: res[i].description, categoryId: res[i].category_id, showIndex: 0, details: [{ id: res[i].id, name: res[i].name, image: res[i].image, stock: res[i].stock, price: res[i].price, salePrice: res[i].sale_price }] };\n                lastObj = obj; data.push(obj);\n            }\n        }\n        msg.payload = data;\n    })\n    .catch(err => { console.log(err); msg.payload = { code: 500, err }; });\nreturn msg;",
      outputs: 1, timeout: 0, noerr: 0, initialize: "", finalize: "", libs: [],
      x: 470, y: 860, wires: [[homeRespId, homeDebugId]] }
];

flows.push(...homeNodes);
fs.writeFileSync(flowsPath, JSON.stringify(flows, null, 4), 'utf8');
console.log('Done: admin=' + adminNodes.length + ' nodes, home=' + homeNodes.length + ' nodes');
