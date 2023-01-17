const chalk = require('chalk') //命令行颜色
const ora = require('ora') // 加载流程动画
const spinner_style = require('../utils/spinner_style') //加载动画样式
const shell = require('shelljs') // 执行shell命令
const node_ssh = require('node-ssh') // ssh连接服务器

const zipFile = require('compressing2') // 压缩zip
const fs = require('fs') // nodejs内置文件模块
const path = require('path') // nodejs内置路径模块

const SSH = new node_ssh();

let config; // 用于保存 inquirer 命令行交互后选择正式|测试版的配置
let pathHierarchy; //测试目录
let distZipPath; //打包后地址(smx-bundle.tar.gz是文件名,不需要更改, 主要在config中配置 REMOTE_ROOT 即可)//文件夹目录

let AesConfig = require('../utils/Base')
let CryptoJS = require('../utils/crypto-js')
//logs
const defaultLog = log => console.log(chalk.blue(`---------------- ${log} ----------------`));
const errorLog = log => console.log(chalk.red(`---------------- ${log} ----------------`));
const successLog = log => console.log(chalk.green(`---------------------- OK ----------------------`));
const endLog = log => console.log(chalk.green(`--------------- ${log} ---------------`));



/**
 * 项目打包
 * @returns {Promise<void>}
 */
const compileDist = async () => {
    const loading = ora(defaultLog('正在进行项目打包')).start()
    loading.spinner = spinner_style[config.LOADINGSTYLE || 'arrow4']
    shell.cd(path.resolve(__dirname, `../${pathHierarchy}`))
    const res = await shell.exec(config.BUILD_SHELL) //执行shell 打包命令
    loading.stop()
    if (res.code === 0) {
        successLog();
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
    const loading = ora(defaultLog('正在进行代码压缩')).start();
    loading.spinner = spinner_style[config.LOADINGSTYLE || 'arrow4']
    try {
        const distDir = path.resolve(__dirname, `../${pathHierarchy}${config.LOCAL_PATH}`);
        await zipFile.tgz.compressDir(distDir, distZipPath);
    } catch (error) {
        loading.stop();
        errorLog(error);
        errorLog('压缩失败, 退出程序!');
        process.exit(); //退出流程
    }

    loading.stop();
    successLog();
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
        host: config.SERVER_HOST,
        username: config.USER,
        [type]: data,
        tryKeyboard: true,
        port: config.PORT
    }

    try {
        await SSH.connect(opt);
    } catch (error) {
        loading.stop();
        errorLog(error);
        errorLog('SSH连接失败,请检查密码或者私钥以及网络状态!')
        process.exit(); //退出流程
    }

    loading.stop();
    successLog();
}


/**
 * 上传前服务器文档操作
 * @returns {Promise<void>}
 */
const clearOldFile = async () => {
    const loading = ora(defaultLog('正在进行部署准备')).start();
    loading.spinner = spinner_style[config.LOADINGSTYLE || 'arrow4']

    try {
        await runCommand(`mkdir ${config.NAME}`);
    } catch (e) {
        if (e.message && e.message.indexOf('File exists') === -1) {
            loading.stop();
            errorLog(e);
            errorLog('创建目录失败!');
            process.exit(); //退出流程
        }
    }


    if (config.BACKUP) {
        try {
            loading.text = '正在进行备份';
            const time = new Date().getTime();
            await runCommand(`tar -zcvf ${config.NAME}_${time}.tar.gz ${config.NAME}`);
            console.log('-ok!')
        } catch (error) {
            errorLog(error);
            errorLog('备份失败!')
        }
    }

    try {
        loading.text = '正在回收部署目录';
        const commands = [`cd ${config.NAME} && ls`, `cd ${config.NAME} && rm -rf *`];
        await Promise.all(commands.map(async (it) => {
            return await runCommand(it);
        }));
        console.log('-ok!')
    } catch (error) {
        loading.stop();
        errorLog(error);
        errorLog('回收部署目录失败!');
        process.exit(); //退出流程
    }


    loading.stop();
    successLog()
}

/**
 * 上传文件
 * @returns {Promise<void>}
 */
const uploadFiles = async () => {
    // 上传文件
    const loading = ora(defaultLog('正在进行部署')).start();
    loading.spinner = spinner_style[config.LOADINGSTYLE || 'arrow4']
    try {
        loading.text = '正在进行代码上传';
        await SSH.putFiles([{
            local: distZipPath,
            remote: `${config.REMOTE_ROOT}/${config.NAME}/smx-bundle.tar.gz`
        }]); //local 本地 ; remote 服务器 ;
        console.log('-ok!')
    } catch (error) {
        loading.stop();
        errorLog(error);
        errorLog('上传失败!');
        process.exit(); //退出流程
    }


    try {
        loading.text = '正在解压整理部署文件';
        await runCommand(`cd ${config.NAME} && tar -mzxvf smx-bundle.tar.gz`); //解压


        await runCommand(`rm -rf ${config.REMOTE_ROOT}/${config.NAME}/smx-bundle.tar.gz`) //解压完删除线上压缩包
        //
        // // 移除文件夹
        await runCommand(`mv -f ${config.REMOTE_ROOT}/${config.NAME}/${config.OLD_NAME}/*  ${config.REMOTE_ROOT}/${config.NAME}`)
        await runCommand(`rm -rf ${config.REMOTE_ROOT}/${config.NAME}/${config.OLD_NAME}`) //移出后删除 dist 文件夹

        console.log('-ok!')
    } catch (error) {
        loading.stop();
        errorLog(error);
        errorLog('解压整理出现异常!');
        process.exit(); //退出流程
    }


    // 后续扩展命令
    if (config.EXTENDS) {
        for (let v of config.EXTENDS) {
            await runCommand(v)
        }
    }

    SSH.dispose(); //断开连接
    loading.stop();
    successLog()
}


// 删除本地上传后的打包文件
const deleteFile = async () => {
    const loading = ora(defaultLog('正在进行后续处理')).start();
    loading.spinner = spinner_style[config.LOADINGSTYLE || 'arrow4']
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
    } catch (error) { }

    loading.stop();
    successLog()
}


/**
 * 线上执行命令
 * @param {String} command 命令操作 如 ls
 */
const runCommand = async (command) => {
    const result = await SSH.exec(command, [], {
        cwd: config.REMOTE_ROOT
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
const runUploadTask = async (cf, pt) => {

    if (cf.REMOTE_ROOT.substr(-1) === '\/') {
        cf.REMOTE_ROOT = cf.REMOTE_ROOT.substring(0, cf.REMOTE_ROOT.length - 1)
    }


    if (cf.LOCAL_PATH.substr(-1) === '\/') {
        cf.LOCAL_PATH = cf.LOCAL_PATH.substring(0, cf.LOCAL_PATH.length - 1)
    }



    let index = cf.REMOTE_ROOT.lastIndexOf("\/");  // 后面
    let l_index = cf.LOCAL_PATH.lastIndexOf("\/");  // 后面

    config = {
        SERVER_HOST: cf.SERVER_HOST,
        USER: cf.USER,
        PASSWORD: decrypt(cf.PASSWORD),
        REMOTE_ROOT: cf.REMOTE_ROOT.substring(0, index),
        LOCAL_PATH: cf.LOCAL_PATH,
        OLD_NAME: cf.LOCAL_PATH.substring((l_index + 1), cf.LOCAL_PATH.length),
        NAME: cf.REMOTE_ROOT.substring((index + 1), cf.REMOTE_ROOT.length),
        PORT: cf.PORT
    }




    cf.LOADINGSTYLE ? config['LOADINGSTYLE'] = cf.LOADINGSTYLE : "";
    cf.PRIVATE_KEY ? config['PRIVATE_KEY'] = cf.PRIVATE_KEY : "";
    if (cf.SSH_CONFIG) {
        cf.SSH_CONFIG.BUILD_SHELL ? config['BUILD_SHELL'] = cf.SSH_CONFIG.BUILD_SHELL : "";
        cf.SSH_CONFIG.RENAME ? config['RENAME'] = cf.SSH_CONFIG.RENAME : "";
        cf.SSH_CONFIG.BACKUP ? config['BACKUP'] = cf.SSH_CONFIG.BACKUP : "";
        cf.SSH_CONFIG.EXTENDS ? config['EXTENDS'] = cf.SSH_CONFIG.EXTENDS : "";
        cf.SSH_CONFIG.DELETE_LOCAL_PACKAGE ? config['DELETE_LOCAL_PACKAGE'] = cf.SSH_CONFIG.DELETE_LOCAL_PACKAGE : "";

    }




    pathHierarchy = pt;
    distZipPath = path.resolve(__dirname, `../${pathHierarchy}/dllcnx-bundle.tar.gz`);
    console.log(chalk.yellow(`------------>  欢迎使用自动部署工具  <------------`));

    //打包
    if (config.BUILD_SHELL) {
        await compileDist()
    }

    //压缩代码
    await zipDist();

    //连接服务器上传文件
    await uploadZipBySSH();


    //删除本地打包文件

    if (config.DELETE_LOCAL_PACKAGE) {
        await deleteFile();
    }


    endLog('大吉大利, 部署成功');
    process.exit();
}


function decrypt(data) {
    const key = CryptoJS.enc.Utf8.parse(AesConfig.AES_KEY);
    const iv = CryptoJS.enc.Utf8.parse(AesConfig.AES_IV);

    const decrypted = CryptoJS.AES.decrypt(data, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    // console.log(decrypted);
    return CryptoJS.enc.Utf8.stringify(decrypted).toString();
}

module.exports = runUploadTask;