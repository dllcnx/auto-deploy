### 使用方法:

原项目[@dllcn/auto-deploy](https://www.npmjs.com/package/@dllcn/auto-deploy)的升级版，原账号因为邮箱的问题无法接着迭代发布。

1. 下载项目
```
npm install @dllcnx/auto-deploy -D
```

2. 在`package.json`的`scripts`添加执行命令
```
    "deploy": "node ./node_modules/@dllcnx/auto-deploy"
```

3. 在项目根目录创建`deploy.config.js`文件,可配置多个发布服务，例如以下配置了三个:
   
  ```javascript
  // 配置示例,具体配置看配置
  module.exports = Object.freeze({
      ftp: {//ftp配置
          NAME: "ftp发布",
          SERVER_HOST: 'xxx', // 服务器地址
          USER: 'root', // 用户名
          PASSWORD: 'xxx', //密码,需加密,加密页面参考下面链接
          REMOTE_ROOT: '/web/test/', // 需要上传的服务器目录地址 如 /usr/local/nginx/html
          LOCAL_PATH: "dist", // 需要上传文件夹路径,默认dist
          PORT: 5521,
          TYPE: "ftp",  // ftp,sftp,ssh 模认ssh
          FTP_CONFIG:{
              DELETE_REMOTE: true,
              ...
          }
      },
      sftp: {//ftp配置
          NAME: "sftp发布",
          SERVER_HOST: 'xxx', // 服务器地址
          USER: 'root', // 用户名
          PASSWORD: 'xxx', //密码,需加密,加密页面参考下面链接
          REMOTE_ROOT: '/web/test/', // 需要上传的服务器目录地址 如 /usr/local/nginx/html
          LOCAL_PATH: "dist", // 需要上传文件夹路径,默认dist
          PORT: 5521,
          TYPE: "ftp",  // ftp,sftp,ssh 模认ssh
          FTP_CONFIG:{
              DELETE_REMOTE: true,
              ...
          }
      },
      ssh: {//ssh
          NAME: "sftp发布",
          SERVER_HOST: 'xxx',
          USER: 'root',
          //方式一 用秘钥登录服务器(推荐), private 本机私钥文件地址(需要在服务器用户目录 一般是 /root/.ssh/authorized_keys 配置公钥 并该文件权限为 600, (.ssh文件夹一般默认隐藏)
          // PRIVATE_KEY: 'C:/Users/Html5/.ssh/id_rsa',
        	//方式二，密码
          PASSWORD: 'xxx',//密码,需加密,加密页面参考下面链接
          REMOTE_ROOT: '/var/local/llcn', // 需要上传的服务器目录地址 如 /usr/local/nginx/html
          LOCAL_PATH: 'dist/',  // 需要上传文件夹路径,默认dist
          PORT: 22,
          SSH_CONFIG: {
              BACKUP: true,
              ...
          }
      }
  })
  ```



4. 执行`npm run deploy`发布命令

![image-20230117231310216](https://dllcnx.com:15200/images/2023/01/202301172313308.png)

### 配置

#### 基础配置
- **name**:  配置名称，默认采用key值
- **SERVER_HOST**:  服务器地址
- **USER**: 服务器用户名
- **PASSWORD**: 密码
- **PRIVATE_KEY**: **[ssh推荐授权配置,与PASSWORD选用一样即可]**,用秘钥登录服务器(推荐)的秘钥地址, private 本机私钥文件地址(需要在服务器用户目录 一般是 `/root/.ssh/authorized_keys` 配置公钥 并该文件权限为 600, (.ssh文件夹一般默认隐藏)
- **LOCAL_PATH**: 需要上传文件夹路径,默认dist
- **REMOTE_ROOT**: 服务器路径
- **PORT**: 端口
- **LOADINGSTYLE**: **[非必须]**,进度动画,默认为 `arrow4` 加载动画 有 `dots` 至 `dots12` 如 `dots6`,`line` ,`pipe` ,`star`, `arrow` 至 `arrow4` 等等
- **TYPE**:**[非必须]**,上传方式，默认`ssh`，还可选择`ftp`，`sftp`
- **SSH_CONFIG**: **[非必须]**，ssh模式下的扩展配置
- **FTP_CONFIG**:**[非必须]**，ftp和sftp模式下的扩展配置



#### SSH_CONFIG

- **SSH_CONFIG.BACKUP**: 是否备份,默认false
- **SSH_CONFIG.DELETE_LOCAL_PACKAGE**: 成功后是否删除本地压缩包,默认false
- **SSH_CONFIG.BUILD_SHELL**: 是否启动自动上传前编译,如果启用,填入编译命令
- **SSH_CONFIG.EXTENDS**: 任务结束后,有时有的操作需要其他命令支持,可以使用扩展,填入自己要用的命令数组.例如:['cd demo', 'rm -rf *']



#### FTP_CONFIG

- **FTP_CONFIG.DELETE_REMOTE**: 如果为真，则在上传前删除目标上的所有现有文件
- **FTP_CONFIG.INCLUDE**: 默认["\*", "\*\\*\*"], 将上传除`.`开头文件以外的所有文件
- **FTP_CONFIG.EXCLUDE**: 模认排除sourcemaps和node_modules中的所有文件(包括`.`开头文件)
- **FTP_CONFIG.FORCEPASY**: 强制被动模式(未发送EPSV命令)



### 加密页面

[在线加密页面](http://dllcnx.com:15200/DeployAes/index.html)或者直接访问项目根目录单页面，加密目前只是简单混淆，防止密码明文直接暴漏到配置文件，但是会查看源码依旧存在暴漏风险，所以建议ssh的key模式授权登录。

