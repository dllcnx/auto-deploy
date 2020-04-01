基于`bgwd666`的[deploy](https://github.com/bgwd666/deploy)发布脚本做了一些适合我自己的修改,在此万分感谢.

### 使用方法:

1. `在自己项目根目录`拉取代码
```
npx degit https://github.com/KeiferJu/auto-deploy.git deploy

cd deploy

npm install
```

2. 配置使用

在项目package.json中配置命令:
```
   ...

  "scripts": {
      ...
    "deploy": "node ./deploy/upload.js"
  },

  ...
```

然后在`deploy/config.js`里面配置上自己服务器信息,执行命令就可以部署了:
```
npm run deploy
```

### 相关配置项

- CLEAR_OLDFILES: 
    
    是否默认删除上传文件夹内容
- OUTPUT_PATH: 
    
    需要上传文件夹路径,默认dist
- SERVER_PATH: 
    
    服务器路径
- SSH_USER: 
    
    服务器用户名
- PRIVATE_KEY: 
    
    用秘钥登录服务器(推荐)的秘钥地址, 本机私钥文件地址(需要在服务器用户目录 一般是 /root/.ssh/authorized_keys 配置公钥 并该文件权限为 600, (.ssh文件夹一般默认隐藏)
- PASSWORD: 
    
    如果密码登录,填入密码,并且不能设置PRIVATE_KEY参数
- RENAME : 
    
    是否改名,是一个对象,参数为OLD_NAME和NEW_NAME
