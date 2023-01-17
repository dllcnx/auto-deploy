const chalk = require('chalk') //命令行颜色
const ora = require('ora') // 加载流程动画
const spinner_style = require('../utils/spinner_style') //加载动画样式
const path = require('path') // nodejs内置路径模块


//logs
const defaultLog = log => console.log(chalk.blue(`---------------- ${log} ----------------`));
const errorLog = log => console.log(chalk.red(`---------------- ${log} ----------------`));
const successLog = log => console.log(chalk.green(`---------------------- OK ----------------------`));
const endLog = log => console.log(chalk.green(`--------------- ${log} ---------------`));


const FtpDeploy = require('./ftp-deploy')
const ftpDeploy = new FtpDeploy();

let AesConfig = require('../utils/Base')
let CryptoJS = require('../utils/crypto-js')

let config; // 用于保存 inquirer 命令行交互后选择正式|测试版的配置
let pathHierarchy; //测试目录

//----------------------------------------发布程序---------------------------------------------------------//
const runFtpTask = async (cf, pt) => {
    const distDir = path.resolve(__dirname, `../${pt}${cf.LOCAL_PATH}`);

    config = {
        user: cf.USER,
        // Password optional, prompted if none given
        password: decrypt(cf.PASSWORD),
        host: cf.SERVER_HOST,
        port: cf.PORT,
        localRoot: distDir,
        remoteRoot: cf.REMOTE_ROOT,
        sftp: cf.TYPE === 'sftp' ? true : false,
        include: cf.FTP_CONFIG && cf.FTP_CONFIG.INCLUDE && cf.FTP_CONFIG.INCLUDE.length > 0 ? cf.FTP_CONFIG.INCLUDE : ["*", "**/*"],
        exclude: cf.FTP_CONFIG && cf.FTP_CONFIG.EXCLUDE && cf.FTP_CONFIG.EXCLUDE.length > 0 ? cf.FTP_CONFIG.EXCLUDE : [],
        deleteRemote: cf.FTP_CONFIG && cf.FTP_CONFIG.DELETE_REMOTE === true ? true : false,
        forcePasv: cf.FTP_CONFIG && cf.FTP_CONFIG.FORCEPASY === false ? false : true,
    }

    cf.LOADINGSTYLE ? config['LOADINGSTYLE'] = cf.LOADINGSTYLE : "";

    console.log(chalk.yellow(`------------>  欢迎使用自动部署工具  <------------`));
    const loading = ora(defaultLog('正在进行文件上传')).start()
    loading.spinner = spinner_style[config.LOADINGSTYLE || 'arrow4']

    ftpDeploy
        .deploy(config)
        .then((res) => {
            // console.log("finished:", res)
            console.log('')
            defaultLog(res)
            loading.stop()
            endLog('大吉大利, 部署成功');
            process.exit();
        })
        .catch((err) => {
            errorLog(err)
            errorLog('项目打包失败, 请重试!')
            process.exit();
        });



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

module.exports = runFtpTask;

