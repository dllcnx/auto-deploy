module.exports = Object.freeze({
  development: {//测试
    SERVER_PATH: '172.17.60.20', // ssh地址 服务器地址
    SSH_USER: 'root', // ssh 用户名 
    PASSWORD: '123456', //方式二 用密码连接服务器
    PATH: '/var/local', // 需要上传的服务器目录地址 如 /usr/local/nginx/html
    OUTPUT_PATH: 'docs/__sapper__/export/smx-svelma' // 需要上传文件夹路径,默认dist
  },
  production: {//正式
    SERVER_PATH: '172.17.60.20', 
    SSH_USER: 'root',
     //方式一 用秘钥登录服务器(推荐), private 本机私钥文件地址(需要在服务器用户目录 一般是 /root/.ssh/authorized_keys 配置公钥 并该文件权限为 600, (.ssh文件夹一般默认隐藏)
    // PRIVATE_KEY: 'C:/Users/Html5/.ssh/id_rsa', 
    PASSWORD: '123456', 
    PATH: '/var/local', // 需要上传的服务器目录地址 如 /usr/local/nginx/html
    OUTPUT_PATH: 'docs/__sapper__/export/smx-svelma'  // 需要上传文件夹路径,默认dist
  }
})

// CLEAR_OLDFILES: 是否默认删除上传文件夹内容
// OUTPUT_PATH: 需要上传文件夹路径,默认dist
// SERVER_PATH: 服务器路径
// SSH_USER: 服务器用户名
// PRIVATE_KEY: 'C:/Users/Html5/.ssh/id_rsa'  用秘钥登录服务器(推荐)的秘钥地址, private 本机私钥文件地址(需要在服务器用户目录 一般是 /root/.ssh/authorized_keys 配置公钥 并该文件权限为 600, (.ssh文件夹一般默认隐藏)
// PASSWORD: 密码
// RENAME : 是否改名,是一个对象,参数为OLD_NAME和NEW_NAME