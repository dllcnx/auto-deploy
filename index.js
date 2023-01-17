const pathHierarchy = '../../../' //脚本到项目的层级  项目/node_modules/deploy-node/index.js
// const pathHierarchy = './test/' //测试目录

const inquirer = require('inquirer') //命令行交互
const runUploadTask = require('./ssh/upload')
const runFtpTask = require('./ftp/index')

let DCONFIG;
let choices = [];
try {
    DCONFIG = require(`${pathHierarchy}deploy.config.js`) // 项目配置
    // console.log(DCONFIG)
    for (const key in DCONFIG) {
        if (Object.hasOwnProperty.call(DCONFIG, key)) {
            const element = DCONFIG[key].NAME || key;
            choices.push({
                name: element,
                value: key
            })
        }
    }
} catch (error) {
    errorLog('请在项目根目录添加 deploy.config.js 配置文件, 参考说明文档中的配置')
    process.exit() //退出流程
}


let config; // 用于保存 inquirer 命令行交互后选择正式|测试版的配置



// 开始前的配置检查
/**
 *
 * @param {Object} conf 配置对象
 */
const checkConfig = (conf) => {
    const checkArr = Object.entries(conf);
    checkArr.map(it => {
        const key = it[0];
        if (key === 'REMOTE_ROOT' && conf[key] === '/') { //上传压缩包前会清空目标目录内所有文件
            errorLog('REMOTE_ROOT 不能是服务器根目录!');
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
        choices: choices,
        when: function (answers) { // 当watch为true的时候才会提问当前问题
            return answers.confirm
        }
    }])
    .then(answers => {
        if (answers.confirm) {
            config = DCONFIG[answers.env];
            if (!config.LOCAL_PATH) {
                config.LOCAL_PATH = 'dist';
            }

            if (!config.PORT) {
                config.PORT = 22;
            }

         


            checkConfig(config); // 检查
            if (config.TYPE === 'ftp' || config.TYPE === 'sftp') {
                runFtpTask(config, pathHierarchy)
            } else {
                runUploadTask(config, pathHierarchy); // 发布
            }

        }
    });


