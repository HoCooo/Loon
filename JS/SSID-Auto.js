/**
 * 根据网络环境变化自动切换策略组节点或运行模式
 * 本方案可单独调整每一个策略组的对应节点 
 */ 
const GlobalDirect = 0
const ByRule = 1
const GlobalProxy = 2
const ModelTranslate = {
    [GlobalDirect]: "全局直连",
    [ByRule]: "自动分流",
    [GlobalProxy]: "全局代理"
}

/**
 * 配置某网络下的运行模式
 * 
 * 格式如下：
 * "ssid名称": {
 *     runningModel: GlobalDirect, // 运行模式
 *     selectPolicy: { // 设置策略组
 *         "Proxy": "DIRECT", // 节点或其他策略明称，如：'日本 1.5x'、'自动测试'
 *         "Google": "Proxy", // 将名称为 Google 的策略改为 Proxy
 *         "Telegram": "Proxy", // 将名称为 Telegram 的策略改为 Proxy
 *     }
 * }
 */
const ModelList = {
     "SSID": {
      selectPolicy: { 
          "节点选择": "直接连接",
        }
    }
}

/**
 * 所有未配置的网络更改均走此配置
 */
const DelaultModel = {
      selectPolicy: { 
          "节点选择": "沪港专线",
    }
}

const isNotificationMatched = true // 匹配到配置好的模式后是否通知
const isNotificationOther = true // 其他模式是否通知

// 匹配网络
const config = JSON.parse($config.getConfig())
const model = ModelList[config.ssid] ?? DelaultModel
const isNotification = model === DelaultModel ? isNotificationOther : isNotificationMatched
changeModel(Object.assign(model, { ssid: config.ssid }), isNotification)

/**
 * 切换运行模式
 * @param {Object} config 用户配置
 * @param {Boolean} isNotification 是否通知
 */
function changeModel(config, isNotification) {
    let message = ""
    if (undefined !== config.runningModel) {
        message += `运行模式 -> ${ModelTranslate[config.runningModel]}\n`
        $config.setRunningModel(config.runningModel)
    }
    if (undefined !== config.selectPolicy) {
        message += `策略组变更:\n `
        for (let policy of Object.keys(config.selectPolicy)) {
            $config.setSelectPolicy(policy, config.selectPolicy[policy])
            message += `${policy} -> ${config.selectPolicy[policy]}\n`
        }
    }
    if (isNotification) {
        $notification.post("网络变化", `网络已切换到：${config.ssid}`, message)
    }
}

$done({ModelList:DelaultModel})
