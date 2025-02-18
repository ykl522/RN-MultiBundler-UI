/**
 * 获取转换按钮
 * @returns 
 */
function getTransBtn() {
    return document.getElementById('trans-btn')
}



/**
 * 获取输入输入框
 * @returns 
 */
function getInputTextArea() {
    return document.getElementById("input-text")
}


/**
 * 获取输入输入框
 * @returns 
 */
function getOutputTextArea() {
    return document.getElementById("output-text")
}

function addListenerOnInputTextArea() {
    const inputArea = getInputTextArea()

    inputArea.onchange = (e) => {
        console.log("???", e)
    }
}

/**
 * 转换按钮添加点击事件
 */
function addClickOnTransBtn() {
    const transBtn = getTransBtn();

    transBtn.onclick = () => {
        const inputValue = getInputTextArea().value;
        const outDom = getOutputTextArea();
        outDom.innerHTML = parseFac(JSON.parse(inputValue))
        store(inputValue)
    }
}

/**
 * 输出框添加点击事件
 */
function addClickOnOutputDiv() {
    const output = getOutputTextArea()
    output.onclick = async () => {
        await navigator.clipboard.writeText(output.innerText);
        // message.info('转换内容已复制到粘贴板');
        showToast()
    }
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.style.display = 'block';
    toast.innerHTML = '转换内容已复制到粘贴板';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000); // 持续 3 秒后消失
}

(() => {
    window.onload = () => {
        getInputTextArea().innerHTML = JSON.parse(getStore())
        addClickOnTransBtn();
        addClickOnOutputDiv();
        if (getInputTextArea().innerHTML.length) {
            getTransBtn().onclick();
        }
    }
})()