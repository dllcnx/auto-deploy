基于`bgwd666`的[deploy](https://github.com/bgwd666/deploy)发布脚本做了一些适合我自己的修改,在此万分感谢.

### 使用方法:

1. 拉取代码
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