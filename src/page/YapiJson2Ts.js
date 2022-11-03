// import '../styles/yapi2ts.css'

import { useEffect } from "react";

/**
 * Yapi接口json转ts类型
 */
export default function YapiJson2Ts() {

    /**
     * 窗口大小设置
     */
    function initIframeSize() {
        const ifm = document.getElementById("yapi2ts");
        let { scrollHeight, scrollWidth } = document.documentElement
        console.log(scrollHeight, scrollWidth)
        ifm.height = `${scrollHeight}px`
        ifm.width = `${scrollWidth}px`
    }

    useEffect(() => {
        initIframeSize()
    }, [])
    return (
        <iframe
            id="yapi2ts"
            src={`file://${__dirname}/yapi2ts/index.html`}
            frameBorder="0"
            scrolling="no"></iframe>
    )
}
