let mysql = require("mysql")

// mysql链接属性
let options = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "mall"
};

// 创建数据库连接池
let pool = mysql.createPool(options);

/**
 * 查询多条数据，仅使用于select 语句
 * @param sql sql语句
 * @param args sql的参数，可变长度
 * @returns
 */
exports.sql = (sql, ...args) => {
  return new Promise((resolve,reject) => {
    // 从连接池里获取一个连接
    pool.getConnection((err, connection) => {
      // 处理获取链接时异常
      if ( err )
        reject(err)
      else
        connection.query(sql, args, (err, result) => {
        // 执行sql时出现了异常
        if ( err ) 
          reject(err)
        // 正常返回
        else
          resolve(result)
        // 释放连接
        connection.release()
        })
    })
  })
}