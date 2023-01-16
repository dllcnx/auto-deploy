基于`bgwd666`的[deploy](https://github.com/bgwd666/deploy)发布脚本做了一些适合我自己的修改,在此万分感谢.

### 使用方法:

1. 下载项目
```
npm install @dllcn/auto-deploy -D
```

2. 添加执行命令
```
    "deploy": "node ./node_modules/@dllcn/auto-deploy"
```

3. 在项目根目录创建`deploy.config.js`文件:
   
  ```javascript
   module.exports = Object.freeze({
       development: {//测试
           SERVER_HOST: 'xxx', // ssh地址 服务器地址
           USER: 'root', // ssh 用户名
           //方式一 用秘钥登录服务器(推荐), private 本机私钥文件地址(需要在服务器用户目录 一般是 /root/.ssh/authorized_keys 配置公钥 并该文件权限为 600, (.ssh文件夹一般默认隐藏)
           // PRIVATE_KEY: 'C:/Users/Html5/.ssh/id_rsa',
           PASSWORD: 'xxx', //方式二 用密码连接服务器
           REMOTE_ROOT: '/var/local', // 需要上传的服务器目录地址 如 /usr/local/nginx/html
           LOCAL_PATH: 'dist', // 需要上传文件夹路径,默认dist
           NAME: 'llcn',
           PORT: 22
       },
       production: {//正式
           SERVER_HOST: 'xxx',
           USER: 'root',
           //方式一 用秘钥登录服务器(推荐), private 本机私钥文件地址(需要在服务器用户目录 一般是 /root/.ssh/authorized_keys 配置公钥 并该文件权限为 600, (.ssh文件夹一般默认隐藏)
           // PRIVATE_KEY: 'C:/Users/Html5/.ssh/id_rsa',
           PASSWORD: 'xxx',
           REMOTE_ROOT: '/var/local', // 需要上传的服务器目录地址 如 /usr/local/nginx/html
           LOCAL_PATH: 'dist',  // 需要上传文件夹路径,默认dist
           NAME: 'llcn',
           PORT: 22
       }
   })
   
   /**
    * 必要配置
    */
    // SERVER_HOST:  服务器地址
   
   // LOCAL_PATH: 需要上传文件夹路径,默认dist
   // REMOTE_ROOT: 服务器路径
   // USER: 服务器用户名
   // PRIVATE_KEY: 'C:/Users/Html5/.ssh/id_rsa'  用秘钥登录服务器(推荐)的秘钥地址, private 本机私钥文件地址(需要在服务器用户目录 一般是 /root/.ssh/authorized_keys 配置公钥 并该文件权限为 600, (.ssh文件夹一般默认隐藏)
   // PASSWORD: 密码
   // PORT: 端口
   


      // LOADINGSTYLE: 进度动画,默认为 arrow4 加载动画 有 dots 至 dots12 如 dots6,line ,pipe , star, arrow 至 arrow4 等等
   /**
    * 扩展配置
    */
   // SSH_CONFIG.BACKUP: 是否备份,默认false
   // SSH_CONFIG.DELETE_LOCAL_PACKAGE: 成功后是否删除本地压缩包,默认false
   // SSH_CONFIG.BUILD_SHELL: 是否启动自动上传前编译,如果启用,填入编译命令
   // SSH_CONFIG.EXTENDS: 任务结束后,有时有的操作需要其他命令支持,可以使用扩展,填入自己要用的命令数组.例如:['cd demo', 'rm -rf *']
   
 ```
