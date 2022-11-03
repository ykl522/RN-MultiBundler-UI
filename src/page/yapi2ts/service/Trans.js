const STORED_DATA_KEY = 'JSON2TS_INPUT_DATA'
const BREAK_LINE = '<br>'
const ONE_SPACE = '&nbsp'
const ZERO_SPACE = ''
const COLOR = {
    /**
     * 属性
     */
    PROPERTY: 'rgb(132,184,211)',
    REMARK: "green",

    /**
     * 类型描述
     */
    TYPEDESC: "rgb(70,175,154)",
    FUNCTION: "",
    STRING: "",

    /**
     * 代码块花括号
     */
    BLOCKTAG: "yellow"
}
/**
 * 
 * @param {YAPIData} data 
 */
function parseFac(data, floor = 1, isArrayChild = false) {
    try {
        const map = {
            "number": parseNumber,
            "integer": parseNumber,
            "string": parseString,
            "boolean": parseBoolean,
            "array": parseArray,
            "object": parseObject,
        }
        let fn = map[data.type];
        if (typeof fn !== 'function') {
            return alert(`类型:[${data.type}] 不正确`)
        }
        return fn(data, floor, isArrayChild)
    } catch (error) {
        alert(error)
    }
}

function genSpace(num) {
    let out = ZERO_SPACE;
    while (num--) {
        out += ONE_SPACE
    }
    return out
}

/**
 * 生成注释节点信息
 * @param {string} mark 
 * @returns 
 */
function genMark(mark, floor = 1) {
    mark = `${mark || ''}`.trim();
    if (!mark.length) return ''

    return ''
        + genSpace(floor * 4)
        + `<span style="color:${COLOR.REMARK}">/**</span>` + BREAK_LINE//备注起始
        + genSpace(floor * 4 + 1) + `<span style="color:${COLOR.REMARK}">*</span>` + genSpace(1)
        + `<span style="color:${COLOR.REMARK}">` + mark + '</span>' + BREAK_LINE//备注内容
        + genSpace(floor * 4 + 1) + `<span style="color:${COLOR.REMARK}">*/</span>` + BREAK_LINE//备注结束
}

function genTypeDom(type, isArrayChild = false) {
    return `<span style="color:${COLOR.TYPEDESC};font-weight:700">${type}</span>${isArrayChild ? '' : '<br>'}`
}

/**
 * 解析数字
 * @param {NumberProperty} data 
 * @param {number} [floor] 
 * @param {boolean} [isArrayChild] 
 * @returns 
 */
function parseNumber(data, floor = 1, isArrayChild = false) {
    return genTypeDom('number', isArrayChild)
}


/**
 * 解析字符串
 * @param {StringProperty} data 
 * @param {number} [floor] 
 * @param {boolean} [isArrayChild] 
 * @returns 
 */
function parseString(data, floor = 1, isArrayChild = false) {
    return genTypeDom('string', isArrayChild)
}

/**
 * 解析布尔
 * @param {BooleanProperty} data 
 * @param {number} [floor] 
 * @param {boolean} [isArrayChild] 
 * @returns 
 */
function parseBoolean(data, floor = 1, isArrayChild = false) {
    return genTypeDom('boolean', isArrayChild)
}
/**
 * 解析数组
 * @param {ArrayProperty} data 
 * @param {number} [floor] 
 * @param {boolean} [isArrayChild] 
 * @returns 
 */
function parseArray(data, floor = 1, isArrayChild = false) {
    return parseFac(data.items, floor + 1, true) + '[]' + BREAK_LINE
}
/**
 * 解析Object
 * @param {ObjectProperty} data 
 * @param {number} [floor] 
 */
function parseObject(data, floor = 1) {
    let properties = data.properties;
    let required = data.required;

    return ''
        + `<span style="color:${COLOR.BLOCKTAG}">{</span>`
        + BREAK_LINE
        + Object.keys(properties).map(key => {
            let isRequired = (required || []).includes(key);
            return (
                genMark(properties[key].description, floor)
                + genSpace(floor * 4)
                + `<span style="color:${COLOR.PROPERTY}">${key}</span>`
                + `<span style="color:${COLOR.PROPERTY}">${(isRequired ? '' : '?')}</span>`
                + `<span style="color:${COLOR.PROPERTY}">:</span>`
                + genSpace(1)
                + parseFac(properties[key], floor + 1)
            )
        }).join(BREAK_LINE)
        + BREAK_LINE
        + genSpace((floor - 1) * 4)
        + `<span style="color:${COLOR.BLOCKTAG}">}</span>`
}

// 保存上一次输入

function store(value) {
    localStorage.setItem(STORED_DATA_KEY, JSON.stringify(value));
}
function getStore() {
    return localStorage.getItem(STORED_DATA_KEY)
}