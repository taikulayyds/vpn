/**
 * IP 纯净度检测脚本
 * @description 适用于Loon的IP纯净度检测工具，使用 IPPure API 查询节点的IP纯净度信息
 * @author AkimioJR[https://github.com/AkimioJR]
 * @date 2025-12-16
 * @version 1.0.0
 * 
 * 功能：
 * - 检测节点的IP地址
 * - 查询ISP和ASN信息
 * - 检测IP类型（住宅/数据中心）
 * - 查询欺诈风险评分
 * - 显示风险等级评估
 */

// 默认 IPPure API 地址
const DEFAULT_IPPURE_API_URL = "https://my.ippure.com/v1/info";

// 获取节点信息
const inputParams = $environment.params;
const nodeName = inputParams.node;

// 解析参数，支持自定义 API 地址
let IPPURE_API_URL = DEFAULT_IPPURE_API_URL;
if (typeof $argument !== 'undefined' && $argument && $argument.IPPURE_API_URL) {
    try {
        IPPURE_API_URL = $argument.IPPURE_API_URL;
        console.log("使用自定义API地址: " + IPPURE_API_URL);
    } catch (e) {
        console.log("解析参数失败，使用默认API地址: " + e);
    }
}

// 国旗 emoji 映射
const flags = new Map([
    ["AC", "🇦🇨"], ["AE", "🇦🇪"], ["AF", "🇦🇫"], ["AI", "🇦🇮"], ["AL", "🇦🇱"],
    ["AM", "🇦🇲"], ["AQ", "🇦🇶"], ["AR", "🇦🇷"], ["AS", "🇦🇸"], ["AT", "🇦🇹"],
    ["AU", "🇦🇺"], ["AW", "🇦🇼"], ["AX", "🇦🇽"], ["AZ", "🇦🇿"], ["BA", "🇧🇦"],
    ["BB", "🇧🇧"], ["BD", "🇧🇩"], ["BE", "🇧🇪"], ["BF", "🇧🇫"], ["BG", "🇧🇬"],
    ["BH", "🇧🇭"], ["BI", "🇧🇮"], ["BJ", "🇧🇯"], ["BM", "🇧🇲"], ["BN", "🇧🇳"],
    ["BO", "🇧🇴"], ["BR", "🇧🇷"], ["BS", "🇧🇸"], ["BT", "🇧🇹"], ["BV", "🇧🇻"],
    ["BW", "🇧🇼"], ["BY", "🇧🇾"], ["BZ", "🇧🇿"], ["CA", "🇨🇦"], ["CF", "🇨🇫"],
    ["CH", "🇨🇭"], ["CK", "🇨🇰"], ["CL", "🇨🇱"], ["CM", "🇨🇲"], ["CN", "🇨🇳"],
    ["CO", "🇨🇴"], ["CP", "🇨🇵"], ["CR", "🇨🇷"], ["CU", "🇨🇺"], ["CV", "🇨🇻"],
    ["CW", "🇨🇼"], ["CX", "🇨🇽"], ["CY", "🇨🇾"], ["CZ", "🇨🇿"], ["DE", "🇩🇪"],
    ["DG", "🇩🇬"], ["DJ", "🇩🇯"], ["DK", "🇩🇰"], ["DM", "🇩🇲"], ["DO", "🇩🇴"],
    ["DZ", "🇩🇿"], ["EA", "🇪🇦"], ["EC", "🇪🇨"], ["EE", "🇪🇪"], ["EG", "🇪🇬"],
    ["EH", "🇪🇭"], ["ER", "🇪🇷"], ["ES", "🇪🇸"], ["ET", "🇪🇹"], ["EU", "🇪🇺"],
    ["FI", "🇫🇮"], ["FJ", "🇫🇯"], ["FK", "🇫🇰"], ["FM", "🇫🇲"], ["FO", "🇫🇴"],
    ["FR", "🇫🇷"], ["GA", "🇬🇦"], ["GB", "🇬🇧"], ["GD", "🇬🇩"], ["GE", "🇬🇪"],
    ["GF", "🇬🇫"], ["GG", "🇬🇬"], ["GH", "🇬🇭"], ["GI", "🇬🇮"], ["GL", "🇬🇱"],
    ["GM", "🇬🇲"], ["GN", "🇬🇳"], ["GP", "🇬🇵"], ["GQ", "🇬🇶"], ["GR", "🇬🇷"],
    ["GT", "🇬🇹"], ["GU", "🇬🇺"], ["GW", "🇬🇼"], ["GY", "🇬🇾"], ["HK", "🇭🇰"],
    ["HN", "🇭🇳"], ["HR", "🇭🇷"], ["HT", "🇭🇹"], ["HU", "🇭🇺"], ["ID", "🇮🇩"],
    ["IE", "🇮🇪"], ["IL", "🇮🇱"], ["IM", "🇮🇲"], ["IN", "🇮🇳"], ["IO", "🇮🇴"],
    ["IQ", "🇮🇶"], ["IR", "🇮🇷"], ["IS", "🇮🇸"], ["IT", "🇮🇹"], ["JE", "🇯🇪"],
    ["JM", "🇯🇲"], ["JO", "🇯🇴"], ["JP", "🇯🇵"], ["KE", "🇰🇪"], ["KG", "🇰🇬"],
    ["KH", "🇰🇭"], ["KI", "🇰🇮"], ["KM", "🇰🇲"], ["KN", "🇰🇳"], ["KP", "🇰🇵"],
    ["KR", "🇰🇷"], ["KW", "🇰🇼"], ["KY", "🇰🇾"], ["KZ", "🇰🇿"], ["LA", "🇱🇦"],
    ["LB", "🇱🇧"], ["LC", "🇱🇨"], ["LI", "🇱🇮"], ["LK", "🇱🇰"], ["LR", "🇱🇷"],
    ["LS", "🇱🇸"], ["LT", "🇱🇹"], ["LU", "🇱🇺"], ["LV", "🇱🇻"], ["LY", "🇱🇾"],
    ["MA", "🇲🇦"], ["MC", "🇲🇨"], ["MD", "🇲🇩"], ["ME", "🇲🇪"], ["MF", "🇲🇫"],
    ["MG", "🇲🇬"], ["MH", "🇲🇭"], ["MK", "🇲🇰"], ["ML", "🇲🇱"], ["MM", "🇲🇲"],
    ["MN", "🇲🇳"], ["MO", "🇲🇴"], ["MP", "🇲🇵"], ["MQ", "🇲🇶"], ["MR", "🇲🇷"],
    ["MS", "🇲🇸"], ["MT", "🇲🇹"], ["MU", "🇲🇺"], ["MV", "🇲🇻"], ["MW", "🇲🇼"],
    ["MX", "🇲🇽"], ["MY", "🇲🇾"], ["MZ", "🇲🇿"], ["NA", "🇳🇦"], ["NC", "🇳🇨"],
    ["NE", "🇳🇪"], ["NF", "🇳🇫"], ["NG", "🇳🇬"], ["NI", "🇳🇮"], ["NL", "🇳🇱"],
    ["NO", "🇳🇴"], ["NP", "🇳🇵"], ["NR", "🇳🇷"], ["NU", "🇳🇺"], ["NZ", "🇳🇿"],
    ["OM", "🇴🇲"], ["PA", "🇵🇦"], ["PE", "🇵🇪"], ["PF", "🇵🇫"], ["PG", "🇵🇬"],
    ["PH", "🇵🇭"], ["PK", "🇵🇰"], ["PL", "🇵🇱"], ["PM", "🇵🇲"], ["PR", "🇵🇷"],
    ["PS", "🇵🇸"], ["PT", "🇵🇹"], ["PW", "🇵🇼"], ["PY", "🇵🇾"], ["QA", "🇶🇦"],
    ["RE", "🇷🇪"], ["RO", "🇷🇴"], ["RS", "🇷🇸"], ["RU", "🇷🇺"], ["RW", "🇷🇼"],
    ["SA", "🇸🇦"], ["SB", "🇸🇧"], ["SC", "🇸🇨"], ["SD", "🇸🇩"], ["SE", "🇸🇪"],
    ["SG", "🇸🇬"], ["SH", "🇸🇭"], ["SI", "🇸🇮"], ["SJ", "🇸🇯"], ["SK", "🇸🇰"],
    ["SL", "🇸🇱"], ["SM", "🇸🇲"], ["SN", "🇸🇳"], ["SO", "🇸🇴"], ["SR", "🇸🇷"],
    ["SS", "🇸🇸"], ["ST", "🇸🇹"], ["SV", "🇸🇻"], ["SX", "🇸🇽"], ["SY", "🇸🇾"],
    ["SZ", "🇸🇿"], ["TC", "🇹🇨"], ["TD", "🇹🇩"], ["TF", "🇹🇫"], ["TG", "🇹🇬"],
    ["TH", "🇹🇭"], ["TJ", "🇹🇯"], ["TK", "🇹🇰"], ["TL", "🇹🇱"], ["TM", "🇹🇲"],
    ["TN", "🇹🇳"], ["TO", "🇹🇴"], ["TR", "🇹🇷"], ["TT", "🇹🇹"], ["TV", "🇹🇻"],
    ["TW", "🇨🇳"], ["TZ", "🇹🇿"], ["UA", "🇺🇦"], ["UG", "🇺🇬"], ["UK", "🇬🇧"],
    ["UM", "🇺🇲"], ["US", "🇺🇸"], ["UY", "🇺🇾"], ["UZ", "🇺🇿"], ["VA", "🇻🇦"],
    ["VC", "🇻🇨"], ["VE", "🇻🇪"], ["VG", "🇻🇬"], ["VI", "🇻🇮"], ["VN", "🇻🇳"],
    ["VU", "🇻🇺"], ["WF", "🇼🇫"], ["WS", "🇼🇸"], ["YE", "🇾🇪"], ["YT", "🇾🇹"],
    ["ZA", "🇿🇦"], ["ZM", "🇿🇲"], ["ZW", "🇿🇼"]
]);

/**
 * 获取国旗 Emoji
 * @param {string} countryCode - 国家代码
 * @returns {string} 国旗 emoji
 */
function getFlagEmoji(countryCode) {
    if (!countryCode) return "🌍";
    const flag = flags.get(countryCode.toUpperCase());
    return flag || "🌍";
}

/**
 * 根据欺诈分数获取风险等级
 * @param {number} score - 欺诈分数 (0-100)
 * @returns {string} 风险等级 HTML
 */
function getRiskLevel(score) {
    if (score === undefined || score === null) {
        return '<font color="#999999">未知 ❓</font>';
    }

    if (score <= 25) {
        return '<font color="#28a745">低风险 ✅</font>';
    } else if (score <= 50) {
        return '<font color="#ffc107">中风险 🟡</font>';
    } else if (score <= 75) {
        return '<font color="#ff8c00">高风险 ⚠️</font>';
    } else {
        return '<font color="#dc3545">极高风险 ‼️</font>';
    }
}

/**
 * 生成 HTML 消息
 * @param {object} data - API 返回的数据
 * @returns {string} HTML 格式的消息
 */
function generateHtmlMessage(data) {
    console.log("----------IP-Purity-Check--------------");
    console.log("API Response: " + JSON.stringify(data));

    // 提取数据
    const flag = getFlagEmoji(data.countryCode);
    const ip = data.ip || "N/A";
    const isp = data.asOrganization || "N/A";
    const asn = data.asn ? `AS${data.asn}` : "N/A";

    // 位置信息
    let location = `${flag} ${data.countryCode || "未知"}`;
    if (data.region) {
        location += ` - ${data.region}`;
    }
    if (data.city) {
        location += ` - ${data.city}`;
    }

    // IP 类型
    const typeStr = data.isResidential ? "住宅网络 🏠" : "数据中心 🏢";

    // 欺诈分数和风险等级
    const score = data.fraudScore !== undefined ? data.fraudScore : "N/A";
    const riskInfo = getRiskLevel(data.fraudScore);

    // 构建信息数组
    const infos = [
        ["IP", ip],
        ["ISP", isp],
        ["ASN", asn],
        ["位置", location],
        ["类型", typeStr],
        ["欺诈值", score === "N/A" ? score : `${score} 分`],
        ["风险等级", riskInfo]
    ];

    // 生成 HTML
    let html = '<div style="text-align: center; font-family: -apple-system; font-size: 15px; line-height: 1.8;">';
    html += '<hr style="margin: 10px 0; border: 0; border-top: 1px solid #ddd;"/>';

    infos.forEach(item => {
        html += `<b><font color="#888">${item[0]} : </font></b><font color="#000">${item[1]}</font><br/>`;
    });

    html += '<hr style="margin: 10px 0; border: 0; border-top: 1px solid #ddd;"/>';
    html += `<font color="#6959CD"><b>节点</b> ➟ ${nodeName}</font>`;
    html += '</div>';

    return html;
}

/**
 * 生成错误消息
 * @param {string} title - 错误标题
 * @param {object} details - 详细信息对象（可选）
 * @returns {string} HTML 格式的错误消息
 */
function generateErrorMessage(title, details = {}) {
    let html = '<div style="text-align: center; font-family: -apple-system; font-size: 15px; line-height: 1.8;">';
    html += '<hr style="margin: 10px 0; border: 0; border-top: 1px solid #ddd;"/>';

    // 错误标题
    html += `<p style="font-size: 16px; font-weight: bold; color: #dc3545; margin: 15px 0;">🛑 ${title}</p>`;

    // 详细信息
    if (Object.keys(details).length > 0) {
        html += '<div style="text-align: left; margin: 10px 20px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">';

        for (const [key, value] of Object.entries(details)) {
            if (value !== null && value !== undefined) {
                const displayValue = String(value).length > 300 ? String(value).substring(0, 300) + '...' : value;
                html += `<p style="margin: 5px 0; font-size: 13px;"><b><font color="#666">${key}:</font></b><br/><font color="#999" style="word-break: break-all;">${displayValue}</font></p>`;
            }
        }

        html += '</div>';
    }

    html += '<hr style="margin: 10px 0; border: 0; border-top: 1px solid #ddd;"/>';
    html += `<font color="#6959CD"><b>节点</b> ➟ ${nodeName}</font>`;
    html += '</div>';

    return html;
}

/**
 * 执行 IP 纯净度检测
 */
function checkIPPurity() {
    const requestParams = {
        url: IPPURE_API_URL,
        node: nodeName,
        timeout: 10000, // 10秒超时
        headers: {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        }
    };

    console.log("开始查询IP纯净度...");
    console.log("节点: " + nodeName);

    $httpClient.get(requestParams, function (error, response, data) {
        if (error) {
            console.log("请求失败: " + error);
            const errorHtml = generateErrorMessage("查询失败", {
                "错误信息": error
            });
            $done({
                "title": "🔎 IP 纯净度检测",
                "htmlMessage": errorHtml
            });
            return;
        }

        if (response.status !== 200) {
            console.log("请求失败，状态码: " + response.status);
            console.log("响应内容: " + data);
            const errorHtml = generateErrorMessage("请求失败", {
                "状态码": response.status,
                "响应内容": data || "无响应内容"
            });
            $done({
                "title": "🔎 IP 纯净度检测",
                "htmlMessage": errorHtml
            });
            return;
        }

        try {
            const jsonData = JSON.parse(data);
            console.log("解析成功，IP: " + jsonData.ip);
            console.log("欺诈分数: " + jsonData.fraudScore);

            const htmlMessage = generateHtmlMessage(jsonData);
            $done({
                "title": "🔎 IP 纯净度检测",
                "htmlMessage": htmlMessage
            });
        } catch (e) {
            console.log("解析失败: " + e);
            console.log("原始数据: " + data);
            const errorHtml = generateErrorMessage("数据解析失败", {
                "错误类型": e.name || "解析错误",
                "错误信息": e.message || e,
                "原始数据": data || "无数据"
            });
            $done({
                "title": "🔎 IP 纯净度检测",
                "htmlMessage": errorHtml
            });
        }
    });
}

// 执行检测
checkIPPurity();
