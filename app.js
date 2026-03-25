// app.js - 负责核心逻辑

// 定义全局变量以便 switchTheme 访问
let myChart = null;

// === 1. 定义固定布局配置 (保证按钮永远在右侧) ===
const LEAF_LAYOUT = {
    position: 'right',
    verticalAlign: 'middle',
    align: 'left',
    distance: 10
};

// === 2. 定义配色方案 ===
const THEMES = {
    // 方案一：轻奢奶油风
    cream: {
        backgroundColor: '#fff1f0', borderColor: '#ff4d4f', borderWidth: 1,
        color: '#434343', fontWeight: 'bold',
        borderRadius: 6, padding: [8, 14], shadowBlur: 5, shadowColor: 'rgba(255, 77, 79, 0.2)'
    },
    // 方案二：潮牌机能风
    cyber: {
        backgroundColor: '#ffccc7', borderColor: '#000000', borderWidth: 2,
        color: '#000000', fontWeight: '800',
        borderRadius: 4, padding: [8, 12], shadowOffsetX: 3, shadowOffsetY: 3, shadowColor: 'rgba(0,0,0,0.2)'
    },
    // 方案三：新中式朱红 (默认)
    chinese: {
        backgroundColor: '#d63031', borderColor: '#b71540', borderWidth: 1,
        color: '#ffffff', fontWeight: 'bold',
        borderRadius: 20, padding: [8, 16], shadowBlur: 4, shadowColor: 'rgba(214, 48, 49, 0.4)'
    },
    // 方案四：极简白
    default: {
        backgroundColor: '#fff', borderColor: '#ced4da', borderWidth: 1,
        color: '#495057', fontWeight: 'normal',
        borderRadius: 5, padding: [8, 12], shadowBlur: 2, shadowColor: 'rgba(0,0,0,0.1)'
    }
};

document.addEventListener('DOMContentLoaded', function () {

    // 1. 检查数据源
    if (typeof BOARD_DATA === 'undefined') {
        alert('⚠️ 错误：未找到 board_data.js，请检查文件引入顺序！');
        return;
    }

    // 2. 初始化 ECharts
    const chartDom = document.getElementById('chart-container');
    myChart = echarts.init(chartDom);

    // 3. 数据转换
    const treeData = transformDataToTree(BOARD_DATA);

    // 4. 渲染图表 (默认使用 'chinese' 皮肤)
    initTreeChart(myChart, treeData, 'chinese');

    // 5. 监听窗口缩放
    window.addEventListener('resize', () => myChart.resize());
});

/**
 * 切换皮肤函数
 */
window.switchTheme = function (themeName) {
    if (!myChart) return;

    // 更新按钮激活状态
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.btn-${themeName}`).classList.add('active');

    // 获取新样式
    const themeStyle = THEMES[themeName];

    // 动态更新配置 (合并固定布局 + 颜色样式)
    myChart.setOption({
        series: [{
            leaves: {
                label: Object.assign({}, LEAF_LAYOUT, themeStyle)
            }
        }]
    });
};

/**
 * 数据转换：扁平 -> 树形
 */
function transformDataToTree(flatData) {
    const root = {
        name: "装修板材全览",
        symbolSize: 25,
        itemStyle: { color: '#343a40', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' },
        label: {
            fontSize: 16, fontWeight: 'bold', color: '#fff',
            backgroundColor: '#343a40', padding: [10, 20], borderRadius: 20
        },
        children: []
    };

    const categories = {
        "人造板": { color: '#fd7e14', children: [] },
        "实木": { color: '#20c997', children: [] },
        "其他": { color: '#be4bdb', children: [] }
    };

    flatData.forEach(item => {
        const catName = item.category === "其他" ? "其他" : item.category;
        if (!categories[catName]) categories[catName] = { color: '#868e96', children: [] };

        categories[catName].children.push({
            name: item.name,
            value: item.load,
            details: item,
            symbolSize: 12,
            itemStyle: { color: categories[catName].color }
        });
    });

    for (let catKey in categories) {
        if (categories[catKey].children.length > 0) {
            root.children.push({
                name: catKey,
                symbolSize: 15,
                itemStyle: { color: categories[catKey].color },
                label: {
                    color: '#fff', backgroundColor: categories[catKey].color,
                    padding: [6, 12], borderRadius: 15, fontWeight: 'bold'
                },
                children: categories[catKey].children
            });
        }
    }
    return root;
}

/**
 * 初始化图表
 */
function initTreeChart(chartInstance, data, defaultTheme) {
    const option = {
        title: {
            text: '装修板材性能脑图',
            subtext: '拖拽可漫游 · 点击查看详情',
            top: 20, left: 20,
            textStyle: { fontSize: 24, color: '#343a40' }
        },
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderColor: '#ddd',
            textStyle: { color: '#333' },
            formatter: function (params) {
                return params.data.details ? `<b>${params.name}</b><br/>用途: ${params.data.details.usage}` : params.name;
            }
        },
        series: [{
            type: 'tree',
            data: [data],
            orient: 'horizontal',
            top: '10%', bottom: '10%',
            left: '10%', right: '30%', // 右侧留白防止文字截断
            roam: true,
            scaleLimit: { min: 0.5, max: 2 },

            symbol: 'emptyCircle',
            symbolSize: 7,
            edgeShape: 'curve',
            initialTreeDepth: 2,

            lineStyle: { color: '#adb5bd', width: 1.5, curveness: 0.5 },

            // 中间层节点通用样式
            label: {
                position: 'left',
                verticalAlign: 'middle',
                align: 'right',
                fontSize: 14,
                distance: 10,
                backgroundColor: '#fff',
                borderColor: '#dee2e6',
                borderWidth: 1,
                borderRadius: 5,
                padding: [8, 12],
                shadowBlur: 5,
                shadowColor: 'rgba(0,0,0,0.1)',
                color: '#495057'
            },

            // 叶子节点样式 (合并 布局 + 默认主题)
            leaves: {
                label: Object.assign({}, LEAF_LAYOUT, THEMES[defaultTheme])
            },

            expandAndCollapse: true,
            animationDuration: 550,
            animationDurationUpdate: 750
        }]
    };

    chartInstance.setOption(option);

    chartInstance.on('click', function (params) {
        if (params.data.details) {
            renderDetails(params.data.details);
        }
    });
}

/**
 * 渲染详情页
 */
function renderDetails(data) {
    const panel = document.getElementById('info-panel');
    const searchLink = `https://www.baidu.com/s?wd=${encodeURIComponent(data.name + " 优缺点 装修")}`;

    let imgHtml = '';
    // 检查图片字段是否存在且不为空
    if (data.image && data.image.trim() !== "") {
        imgHtml = `
            <div class="img-wrapper" style="display:block">
                <img src="data/${data.image}" 
                     alt="${data.name}" 
                     class="board-img" 
                     onerror="this.parentElement.style.display='none'"> 
            </div>
        `;
    }

    const html = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">${data.name}</h2>
                <div class="card-alias">🏷️ ${data.alias}</div>
            </div>
            
            ${imgHtml}

            <div class="rating-group">
                <div class="rating-row"><span class="label">🏋️ 承重</span><span class="stars">${data.load}</span></div>
                <div class="rating-row"><span class="label">📏 平整</span><span class="stars">${data.flat}</span></div>
                <div class="rating-row"><span class="label">🧪 环保</span><span class="stars">${data.safe}</span></div>
                <div class="rating-row"><span class="label">💧 防潮</span><span class="stars">${data.moist}</span></div>
                <div class="rating-row"><span class="label">🛡️ 变形</span><span class="stars">${data.deform}</span></div>
            </div>

            <div class="usage-box">
                <div class="usage-title">✨ 最佳用途</div>
                <div style="font-weight:500; font-size:14px; line-height:1.6">${data.usage}</div>
            </div>
            
            <div class="desc-text">${data.desc}</div>

            <a href="${searchLink}" target="_blank" class="btn-link">
                🔍 百度搜索 "${data.name}"
            </a>
        </div>
    `;
    panel.innerHTML = html;
}
