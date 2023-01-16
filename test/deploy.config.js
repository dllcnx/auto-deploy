module.exports = Object.freeze({
    development: {//测试
        SERVER_HOST: 'dllcnx.com', // ssh地址 服务器地址
        USER: 'jukaifeng', // ssh 用户名
        //方式一 用秘钥登录服务器(推荐), private 本机私钥文件地址(需要在服务器用户目录 一般是 /root/.ssh/authorized_keys 配置公钥 并该文件权限为 600, (.ssh文件夹一般默认隐藏)
        // PRIVATE_KEY: 'C:/Users/Html5/.ssh/id_rsa',
        PASSWORD: 'Www100530qq', //方式二 用密码连接服务器
        REMOTE_ROOT: '/web/test/', // 需要上传的服务器目录地址 如 /usr/local/nginx/html
        LOCAL_PATH: "dist", // 需要上传文件夹路径,默认dist
        PORT: 5521,
        TYPE: "ftp",  // ftp,sftp,ssh 模认ssh
    },
    production: {//正式
        SERVER_HOST: '172.17.13.31',
        USER: 'root',
        //方式一 用秘钥登录服务器(推荐), private 本机私钥文件地址(需要在服务器用户目录 一般是 /root/.ssh/authorized_keys 配置公钥 并该文件权限为 600, (.ssh文件夹一般默认隐藏)
        // PRIVATE_KEY: 'C:/Users/Html5/.ssh/id_rsa',
        PASSWORD: 'Sm@rtMapX!@#$%^',
        REMOTE_ROOT: '/var/local/llcn', // 需要上传的服务器目录地址 如 /usr/local/nginx/html
        LOCAL_PATH: './dist/',  // 需要上传文件夹路径,默认dist
        PORT: 22,
        SSH_CONFIG: {
            BACKUP: true,
            RENAME: "test2", // 没有
            DELETE_LOCAL_PACKAGE: true,
            EXTENDS: ['cd /var/local', 'mkdir ex']
        }
      
    }
})