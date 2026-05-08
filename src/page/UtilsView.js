import React, { useState, useEffect, useRef, useMemo } from 'react';
const { Button, Modal, notification, Checkbox, Menu, Dropdown, Input, Drawer, Space } = require('antd');
const { remote } = require("electron");
import { DownOutlined } from '@ant-design/icons';
import { workSpace } from '../config'
import WinExec from '../utils/WinExec';
import ReactJson from 'react-json-view';

/**
 * 其他工具
 * @param {*} props 
 * @returns 
 */
export default function UtilsView(props) {

    const [quantity, setQuantity] = useState(0);
    const [open, setOpen] = useState(false);
    const [jsonModalVisible, setJsonModalVisible] = useState(false);
    const [jsonString, setJsonString] = useState('');
    const [parsedJson, setParsedJson] = useState(null);
    const [jsonError, setJsonError] = useState('');
    
    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };
    
    const showJsonModal = () => {
        setJsonModalVisible(true);
    };
    
    const closeJsonModal = () => {
        setJsonModalVisible(false);
        setJsonString('');
        setParsedJson(null);
        setJsonError('');
    };
    
    const handleJsonChange = (e) => {
        const value = e.target.value;
        setJsonString(value);
        
        if (value.trim() !== '') {
            let parsedJsonResult;
            let errorOccurred = false;
            
            try {
                // 检查字符串是否有首尾引号
                if (value.startsWith('"') && value.endsWith('"')) {
                    // 有首尾引号，处理为序列化的JSON字符串
                    let unescapedStr = value.substring(1, value.length - 1);
                    
                    // 处理常见的转义字符，顺序很重要
                    unescapedStr = unescapedStr
                        .replace(/\\\\/g, '\\')  // 先处理转义的反斜杠
                        .replace(/\\"/g, '"')     // 处理转义的引号
                        .replace(/\\n/g, '\n')    // 处理转义的换行符
                        .replace(/\\r/g, '\r')    // 处理转义的回车符
                        .replace(/\\t/g, '\t')    // 处理转义的制表符
                        .replace(/\\b/g, '\b')    // 处理转义的退格符
                        .replace(/\\f/g, '\f');   // 处理转义的换页符
                    
                    parsedJsonResult = JSON.parse(unescapedStr);
                    setJsonError('');
                } else {
                    // 没有首尾引号，直接尝试解析
                    parsedJsonResult = JSON.parse(value);
                    setJsonError('');
                }
            } catch (error) {
                setJsonError(`JSON 解析错误: ${error.message}`);
                errorOccurred = true;
            }
            
            if (!errorOccurred) {
                setParsedJson(parsedJsonResult);
            } else {
                setParsedJson(null);
            }
        } else {
            setParsedJson(null);
            setJsonError('');
        }
    };

    const calculateMinCostWithPlan = (totalQuantity, items) => {
        // 初始化动态规划数组
        const dp = new Array(totalQuantity + 1).fill().map(() => ({
            cost: Infinity,
            counts: new Array(items.length).fill(0)
        }));

        // 初始状态：数量0的成本为0
        dp[0] = { cost: 0, counts: new Array(items.length).fill(0) };

        // 遍历每个物品方案
        for (let j = 0; j < items.length; j++) {
            const { cost, quant, times } = items[j];

            // 复制当前状态（避免修改正在遍历的数组）
            const currentStates = [...dp];

            // 尝试使用当前方案1到times次
            for (let k = 1; k <= times; k++) {
                // 倒序遍历所有可能数量
                for (let i = totalQuantity; i >= 0; i--) {
                    // 跳过不可达状态
                    if (currentStates[i].cost === Infinity) continue;

                    // 计算新状态
                    const newQuant = i + k * quant;
                    const newCost = currentStates[i].cost + k * cost;
                    const target = Math.min(newQuant, totalQuantity);

                    // 仅当新成本更低时更新
                    if (newCost < dp[target].cost) {
                        // 创建新的计数数组
                        const newCounts = [...currentStates[i].counts];
                        newCounts[j] += k;

                        // 更新目标状态
                        dp[target] = {
                            cost: newCost,
                            counts: newCounts
                        };
                    }
                }
            }
        }

        // 提取最优方案详情
        const result = {
            totalCost: dp[totalQuantity].cost,
            totalQuantity: 0,
            details: [],
            counts: dp[totalQuantity].counts
        };

        // 计算详细方案信息
        for (let j = 0; j < items.length; j++) {
            const count = dp[totalQuantity].counts[j];
            if (count > 0) {
                const { cost, quant } = items[j];
                const totalQuant = quant * count;
                const totalItemCost = cost * count;

                result.details.push({
                    itemIndex: j,
                    quantityPerUse: quant,
                    costPerUse: cost,
                    timesUsed: count,
                    totalQuantity: totalQuant,
                    totalCost: totalItemCost
                });

                result.totalQuantity += totalQuant;
            }
        }

        return result;
    }

    // 测试数据
    const items = [
        { cost: 6, quant: 7, times: 3 },    // 方案1
        { cost: 30, quant: 27, times: 5 },  // 方案2
        { cost: 68, quant: 55, times: 5 },  // 方案3
        { cost: 128, quant: 90, times: 10 },// 方案4
        { cost: 198, quant: 120, times: 10 }// 方案5
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 30, paddingRight: 30 }}>
            <Input style={{ width: 300, marginTop: 15, marginBottom: 15, marginRight: 15 }} placeholder="请输入数量" onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value)) {
                    setQuantity(value);
                } else {
                    setQuantity(0);
                }
            }} />
            <div style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Button style={{ width: 100, marginTop: 15, marginBottom: 15, marginRight: 15 }} onClick={() => {
                    // 测试总数量70
                    const result = calculateMinCostWithPlan(quantity, items);
                    console.log("最小成本:", result.totalCost);
                    console.log("总数量:", result.totalQuantity);
                    console.log("方案组合:", result.counts);
                    console.log("详细方案:");

                    result.details.forEach(detail => {
                        console.log(
                            `  方案${detail.itemIndex + 1}: ` +
                            `使用${detail.timesUsed}次, ` +
                            `每次数量=${detail.quantityPerUse}, ` +
                            `每次成本=${detail.costPerUse}, ` +
                            `总数量=${detail.totalQuantity}, ` +
                            `总成本=${detail.totalCost}`
                        );
                    });

                    console.log("总成本验证:",
                        result.details.reduce((sum, item) => sum + item.totalCost, 0)
                    );
                }}>计算</Button>
                <Button style={{ width: 150, marginTop: 15, marginBottom: 15, marginRight: 15 }} onClick={showDrawer}>成本优化方案计算</Button>
                <Button style={{ width: 150, marginTop: 15, marginBottom: 15, marginRight: 15 }} onClick={showJsonModal}>JSON格式化浏览</Button>
            </div>
            
            <Modal
                title="JSON格式化浏览"
                width={800}
                open={jsonModalVisible}
                onCancel={closeJsonModal}
                footer={[
                    <Button key="back" onClick={closeJsonModal}>关闭</Button>,
                ]}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Input.TextArea 
                        rows={8} 
                        placeholder="请粘贴您的JSON字符串" 
                        value={jsonString}
                        onChange={handleJsonChange}
                    />
                    {jsonError && <div style={{ color: 'red' }}>{jsonError}</div>}
                    {parsedJson !== null && typeof parsedJson !== 'undefined' && (
                        <div style={{ 
                            maxHeight: '400px',
                            overflow: 'auto',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '10px',
                            backgroundColor: '#fafafa'
                        }}>
                            <ReactJson 
                                src={parsedJson} 
                                theme="rjv-default"
                                indentWidth={2}
                                collapsed={false}
                                collapseStringsAfterLength={100}
                                enableClipboard={true}
                                displayDataTypes={false}
                                displayObjectSize={true}
                            />
                        </div>
                    )}
                </Space>
            </Modal>
            
            <Drawer title="成本优化方案计算" width={800} placement="right" onClose={onClose} open={open}>
                <iframe
                    style={{ width: '100%', height: '98%', overflow: 'auto' }}
                    id="yapi2ts"
                    src={`file://${__dirname}/html/CostOptimizationPlanCalc.html`}
                    frameBorder="0"
                    scrolling="auto"></iframe>
            </Drawer>
        </div>
    )
}