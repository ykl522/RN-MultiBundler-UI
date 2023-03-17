/*
 * @Author: 康乐 yuankangle@yunexpress.cn
 * @Date: 2023-03-17 15:44:57
 * @LastEditors: 康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2023-03-17 15:54:34
 * @FilePath: \RN-MultiBundler-UI\src\page\Model.js
 * @Description: 模板
 */
const { notification } = require('antd');

export default () => {

    const [api, contextHolder] = notification.useNotification();
    const openNotification = (des, placement = 'bottomRight') => {
        api.info({
            message: `提示`,
            description: des,
            placement,
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 30, paddingRight: 30 }}>
            {contextHolder}
        </div>
    )
}