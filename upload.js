const pathHierarchy = '../../../' //脚本到项目的层级  项目/node_modules/deploy-node/index.js

const chalk = require('chalk') //命令行颜色
const ora = require('ora') // 加载流程动画
const spinner_style = require('./spinner_style') //加载动画样式
const shell = require('shelljs') // 执行shell命令
const node_ssh = require('node-ssh') // ssh连接服务器
const inquirer = require('inquirer') //命令行交互
const zipFile = require('compressing2') // 压缩zip
const fs = require('fs') // nodejs内置文件模块
const path = require('path') // nodejs内置路径模块
// const CONFIG = require('./config') // 配置

const SSH = new node_ssh();

let CONFIG
try {
    CONFIG = require(`${pathHierarchy}deploy.config.js`) // 项目配置
} catch (error) {
    errorLog('请在项目根目录添加 deploy.config.js 配置文件, 参考说明文档中的配置')
    process.exit() //退出流程
}

let config; // 用于保存 inquirer 命令行交互后选择正式|测试版的配置

//logs
const defaultLog = log => console.log(chalk.blue(`---------------- ${log} ----------------`));
const errorLog = log => console.log(chalk.red(`---------------- ${log} ----------------`));
const successLog = log => console.log(chalk.green(`---------------- ${log} ----------------`));

//文件夹目录
const distZipPath = path.resolve(__dirname, `${pathHierarchy}../smx-bundle.tar.gz`); //打包后地址(smx-bundle.tar.gz是文件名,不需要更改, 主要在config中配置 PATH 即可)


//项目打包代码 npm run build
const compileDist = async () => {
    const loading = ora(defaultLog('项目开始打包')).start()
    loading.spinner = spinner_style[config.LOADINGSTYLE || 'arrow4']
    shell.cd(path.resolve(__dirname, pathHierarchy))
    const res = await shell.exec(config.BUILD_SHELL) //执行shell 打包命令
    loading.stop()
    if (res.code === 0) {
      successLog('项目打包成功!')
    } else {
      errorLog('项目打包失败, 请重试!')
      process.exit() //退出流程
    }
}


/**
 * 压缩代码
 * @returns {Promise<void>}
 */
const zipDist = async () => {
    const loading = ora(defaultLog('正在压缩代码')).start();
    loading.spinner = spinner_style[config.LOADINGSTYLE || 'arrow4']
    try {
        const distDir = path.resolve(__dirname, `${pathHierarchy}${config.OUTPUT_PATH}`);
        await zipFile.tgz.compressDir(distDir, distZipPath)
        successLog('压缩成功!');
    } catch (error) {
        errorLog(error);
        errorLog('压缩失败, 退出程序!');
        process.exit(); //退出流程
    }
    loading.stop();
}


/**
 * 连接服务器
 * @returns {Promise<void>}
 */
const connectSSH = async () => {
    const loading = ora(defaultLog('正在连接服务器')).start();
    loading.spinner = spinner_style[config.LOADINGSTYLE || 'arrow4']


    const type = config.PASSWORD ? 'password' : 'privateKey'
    const data = config.PASSWORD || config.PRIVATE_KEY
    const opt = {
        host: config.SERVER_PATH,
        username: config.SSH_USER,
        [type]: data,
        tryKeyboard: true,
        port: config.PORT
    }

    try {
        await SSH.connect(opt);
        successLog('SSH连接成功!');
    } catch (error) {
        errorLog(error);
        errorLog('SSH连接失败,请检查密码或者私钥以及网络状态!')
        process.exit(); //退出流程
    }
    loading.stop();
}


/**
 * 上传前服务器文档操作
 * @returns {Promise<void>}
 */
const clearOldFile = async () => {
    try {
        await runCommand(`mkdir ${config.NAME}`);
    } catch (e) {
        // console.log(`检索到服务器存在${config.NAME}文件夹`);
    }


    if (config.BACKUP) {
        const time = new Date().getTime();
        try {
            await runCommand(`tar -zcvf ${config.NAME}_${time}.tar.gz ${config.NAME}`);
        } catch {
            console.log('备份失败');
        }
    }


    const commands = [`cd ${config.NAME} && ls`, `cd ${config.NAME} && rm -rf *`];
    await Promise.all(commands.map(async (it) => {
        return await runCommand(it);
    }));

}

/**
 * 上传文件
 * @returns {Promise<void>}
 */
const uploadFiles = async () => {
    // 上传文件
    const loading = ora(defaultLog('准备上传文件')).start();
    loading.spinner = spinner_style[config.LOADINGSTYLE || 'arrow4']
    try {
        await SSH.putFiles([{
            local: distZipPath,
            remote: `${config.PATH}/${config.NAME}/smx-bundle.tar.gz`
        }]); //local 本地 ; remote 服务器 ;
        successLog('上传成功!');
        loading.text = '正在解压文件';

        await runCommand(`cd ${config.NAME} && tar -zxvf smx-bundle.tar.gz`); //解压


        await runCommand(`rm -rf ${config.PATH}/${config.NAME}/smx-bundle.tar.gz`) //解压完删除线上压缩包
        //
        // // 移除文件夹
        await runCommand(`mv -f ${config.PATH}/${config.NAME}/${config.OLD_NAME}/*  ${config.PATH}/${config.NAME}`)
        await runCommand(`rm -rf ${config.PATH}/${config.NAME}/${config.OLD_NAME}`) //移出后删除 dist 文件夹


        // 后续扩展命令
        if (config.EXTENDS) {
            for (let v of config.EXTENDS) {
                await runCommand(v)
            }
        }

        SSH.dispose(); //断开连接
    } catch (error) {
        errorLog(error);
        errorLog('上传失败!');
        process.exit(); //退出流程
    }
    loading.stop();
}


// 删除本地上传后的打包文件
const deleteFile = async () => {
    delPath = distZipPath;
    try {
        /**
         * @des 判断文件或文件夹是否存在
         */
        if (fs.existsSync(delPath)) {
            fs.unlinkSync(delPath);
        } else {
            console.log('inexistence path：', delPath);
        }
    } catch (error) {
        console.log('删除本地打包文件失败', error);
    }
}


/**
 * 线上执行命令
 * @param {String} command 命令操作 如 ls
 */
const runCommand = async (command) => {
    const result = await SSH.exec(command, [], {
        cwd: config.PATH
    })
    // defaultLog(result);
}


//传送zip文件到服务器
const uploadZipBySSH = async () => {
    //连接ssh
    await connectSSH();

    //线上目标文件清空
    await clearOldFile();

    // 上传文件
    await uploadFiles();

}


//----------------------------------------发布程序---------------------------------------------------------//
const runUploadTask = async () => {
    console.log(chalk.yellow(`--------->  欢迎使用自动部署工具  <---------`));

    //打包
    if(config.BUILD_SHELL){
        await compileDist()
    }

    //压缩代码
    await zipDist();

    //连接服务器上传文件
    await uploadZipBySSH();

    //删除本地打包文件

    if(config.DELETE_LOCAL_PACKAGE){
        await deleteFile();
    }

    successLog('大吉大利, 部署成功!');
    process.exit();
}

// 开始前的配置检查
/**
 *
 * @param {Object} conf 配置对象
 */
const checkConfig = (conf) => {
    const checkArr = Object.entries(conf);
    checkArr.map(it => {
        const key = it[0];
        if (key === 'PATH' && conf[key] === '/') { //上传压缩包前会清空目标目录内所有文件
            errorLog('PATH 不能是服务器根目录!');
            process.exit(); //退出流程
        }
        if (!conf[key] && conf[key] !== false) {
            errorLog(`配置项 ${key} 不能为空`);
            process.exit(); //退出流程
        }
    })
}
//--------------------------------------------------------------------------------------------------//

// 执行交互后 启动发布程序
inquirer
    .prompt([{
        type: 'confirm',
        message: '请确认您的上传目录(NAME)是没有部署或存储过其它重要的文件',
        name: 'confirm',
    }, {
        type: 'list',
        message: '选择您的部署环境',
        name: 'env',
        choices: [{
            name: '测试环境',
            value: 'development'
        }, {
            name: '正式环境',
            value: 'production'
        }],
        when: function (answers) { // 当watch为true的时候才会提问当前问题
            return answers.confirm
        }
    }])
    .then(answers => {
        if (answers.confirm) {
            config = CONFIG[answers.env];
            if (!config.OUTPUT_PATH) {
                config.OUTPUT_PATH = 'dist';
            }

            if (!config.PORT) {
                config.PORT = 22;
            }

            const names = config.OUTPUT_PATH.split('/');
            if (names[names.length - 1]) {
                config.OLD_NAME = names[names.length - 1];
            } else {
                config.OLD_NAME = names[names.length - 2];
            }


            checkConfig(config); // 检查
            runUploadTask(); // 发布
        }
    });
