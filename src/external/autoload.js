/*
 * @Author: 康乐 yuankangle@yunexpress.cn
 * @Date: 2023-03-21 17:06:18
 * @LastEditors: 康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2023-03-21 17:57:36
 * @FilePath: \RN-MultiBundler-UI\src\external\autoload.js
 */
export const kbn =
    `const live2d_path = "https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/";
    function loadExternalResource(url, type) {
        return new Promise((resolve, reject) => {
            let tag;
            if (type === "css") {
                tag = document.createElement("link");
                tag.rel = "stylesheet";
                tag.href = url;
            }
            else if (type === "js") {
                tag = document.createElement("script");
                tag.src = url;
            }
            if (tag) {
                tag.onload = () => resolve(url);
                tag.onerror = () => reject(url);
                document.head.appendChild(tag);
            }
        });
    }
    if (screen.width >= 768) {
        Promise.all([
            loadExternalResource(live2d_path + "waifu.css", "css"),
            loadExternalResource(live2d_path + "live2d.min.js", "js"),
            loadExternalResource(live2d_path + "waifu-tips.js", "js")
        ]).then(() => {
            initWidget({
                waifuPath: live2d_path + "waifu-tips.json",
                cdnPath: "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/",
                tools: ["hitokoto", "asteroids", "switch-model", "switch-texture", "photo", "info", "quit"]
            });
        });
    }`
