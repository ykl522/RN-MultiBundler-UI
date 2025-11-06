/*
 * @Author: 康乐 yuankangle@gmail.com
 * @Date: 2022-11-15 09:38:26
 * @LastEditors: 康乐 yuankangle@gmail.com
 * @LastEditTime: 2023-08-24 17:37:08
 * @FilePath: \RN-MultiBundler-UI\src\page\Md5View.js
 * @Description: md5
 */
import React, { useState, useEffect, useRef } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { downloadFile } from '../net/HttpRequest';
import Draggable from 'react-draggable'; // 版本用4.4.4，不然打包后会运行报错，卡在加载界面
import { Button, Modal, Upload, Table } from 'antd';
const crypto = require('crypto');
export default function Md5View(props) {

    const [fileList, setFileList] = useState([])
    const [urlList, setUrlList] = useState(props && props.downloadMd5Data ? props.downloadMd5Data : [])
    const [open, setOpen] = useState(false)
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
    const [disabled, setDisabled] = useState(true);
    const draggleRef = useRef(null);
    const fileListRef = useRef([]);

    useEffect(() => {
        console.log("fileList--->", fileList)
    }, [fileList])

    const md5 = (filePath) => {
        try {
            const fs = require('fs');
            if (!fs.existsSync(filePath)) {
                return '';
            }
            const buffer = fs.readFileSync(filePath);
            const hash = crypto.createHash('md5');
            hash.update(buffer, 'utf8');
            const md5 = hash.digest('hex');
            console.log(md5);
            return md5
        } catch (error) {
            error && console.error(error);
        }
        return ''
    }

    const draggerProps = {
        name: 'file',
        multiple: true,
        showUploadList: fileList.length > 0,
        onChange: (info) => {
            try {
                if (info) {
                    const { status, originFileObj } = info.file;
                    console.log(status + "===>", info)
                    if (status === 'done') {
                        for (let file of info.fileList) {
                            file.md5 = md5(file.originFileObj.path)
                            file.url = ''
                            file.path = file.originFileObj.path
                        }
                        fileListRef.current = [...info.fileList]
                        setFileList(fileListRef.current)
                    } else {
                        //必须刷新，不然状态不会改变
                        setFileList([...info.fileList])
                    }
                }
            } catch (error) {
                error && console.error(error);
            }
        },
        onDrop(e) {
            e && e.dataTransfer && console.log('Dropped files', e.dataTransfer.files);
        },
        onPreview(e) {
            console.log('------------', e)
        },
        onRemove(e) {
            try {
                fileListRef.current = []
                for (let item of fileList) {
                    if (e.uid != item.uid) {
                        fileListRef.current.push(item)
                    }
                }
                setFileList([...fileListRef.current])
            } catch (error) {
                error && console.error(error);
            }
        }
    };

    const handleCancel = () => {
        setOpen(false)
    }

    // 下载Blob的函数 blob是axios返回的文件数据，fileName是下载的文件名
    const downloadBlob = (columnData, data, fileName) => {
        try {
            const hash = crypto.createHash('md5');
            const byteArray = Buffer.from(data, 'utf8');
            hash.update(byteArray);
            const md5 = hash.digest('hex');
            console.log('文件下载成功，MD5:', md5);
            columnData.md5 = md5;
            setUrlList(prevList => {
                const updatedList = [...prevList];
                updatedList.forEach(item => {
                    if (item.url === columnData.url) {
                        item.md5 = md5;
                        item.size = byteArray.length; // 更新文件大小
                    }
                });
                return updatedList;
            })
            // const fs = require('fs');
            // fs.writeFile(props.downloadPath + '\\' + fileName, Buffer.from(data));
        } catch (error) {
            error && console.error(error);
        }
    };

    const columns = [
        {
            title: '文件路径',
            dataIndex: 'path',
            key: 'path',
            render: (data) => <div style={{ width: 380 }}>{`${data || ''}`}</div>
        },
        {
            title: '文件大小',
            dataIndex: 'size',
            key: 'size',
            render: (data) => <div style={{ width: 55 }}>{data ? `${(data / 1024 / 1024).toFixed(2)}M` : ''}</div>
        },
        {
            title: 'MD5',
            dataIndex: 'md5',
            key: 'md5',
            render: (data) => <a style={{ width: 315 }}>{`${data || ''}`}</a>
        }, {
            title: '最后修改时间',
            dataIndex: 'lastModified',
            key: 'lastModified',
            render: (data) => <div style={{ width: 155 }}>{data ? new Date(data).toLocaleString() : ''}</div>
        }
    ]

    const downloadColumns = [
        {
            title: 'URL路径',
            dataIndex: 'url',
            key: 'url',
            render: (data) => <div style={{ width: 380 }}>{`${data || ''}`}</div>
        },
        {
            title: '文件大小',
            dataIndex: 'size',
            key: 'size',
            render: (data) => <div style={{ width: 55 }}>{data ? `${(data / 1024 / 1024).toFixed(2)}M` : ''}</div>
        },
        {
            title: 'MD5',
            dataIndex: 'md5',
            width: 315,
            key: 'md5',
            render: (data, columnData) => (
                <div style={{ width: 315, height: '100%' }}>
                    <div style={{ position: 'absolute', width: `${columnData && columnData.progress ? columnData.progress : 0}%`, height: '100%', left: 0, top: 0, backgroundColor: '#00ff0045' }} />
                    <a style={{ width: 315, color: '#f00', fontWeight: 'bold' }}>{`${data || ''}`}</a>
                </div>
            )
        }, {
            title: '操作',
            dataIndex: 'opration',
            key: 'opration',
            render: (_, columnData) => <div style={{ width: 55, color: 'blue' }}
                onClick={() => {
                    // 这里可以添加下载逻辑
                    console.log(columnData)
                    downloadFile(columnData.url, (progress) => {
                        columnData.progress = progress;
                        setUrlList(prevList => {
                            const updatedList = [...prevList];
                            updatedList.forEach(item => {
                                if (item && item.url === columnData.url) {
                                    item.progress = progress;
                                }
                            });
                            return updatedList;
                        })
                    }, (data) => {
                        downloadBlob(columnData, data, columnData.fileName || columnData.url.split('/').pop());
                    })
                }} >下载</div>
        }
    ]

    const onStart = (_event, uiData) => {
        try {
            var _a;
            const { clientWidth, clientHeight } = window.document.documentElement;
            const targetRect =
                (_a = draggleRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
            if (!targetRect) {
                return;
            }
            setBounds({
                left: -targetRect.left + uiData.x,
                right: clientWidth - (targetRect.right - uiData.x),
                top: -targetRect.top + uiData.y,
                bottom: clientHeight - (targetRect.bottom - uiData.y),
            });
        } catch (error) {
            error && console.error('处理拖拽开始时出错:', error);
        }
    };

    // 添加一个安全的模态框渲染函数
    const renderModalContent = (modal) => {
        try {
            return (
                <Draggable
                    disabled={disabled}
                    bounds={bounds}
                    nodeRef={draggleRef}
                    onStart={(event, uiData) => onStart(event, uiData)}
                >
                    <div ref={draggleRef}>{modal}</div>
                </Draggable>
            );
        } catch (error) {
            console.error('渲染可拖拽模态框时出错:', error);
            // 出错时返回不带拖拽功能的模态框
            return <div ref={draggleRef}>{modal}</div>;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 30, paddingRight: 30 }}>
            <Upload.Dragger height={250} {...draggerProps} fileList={fileList}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">单击或拖动文件到此区域</p>
                <p className="ant-upload-hint">
                    支持单个或者批量文件生成文件的MD5值
                </p>
            </Upload.Dragger>
            <Table style={{ marginTop: 10 }} pagination={false} bordered size={'small'} rowKey={'uid'} columns={columns} dataSource={fileList} />
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                <Button style={{ width: 100, marginTop: 15, marginBottom: 15 }} onClick={() => {
                    setFileList(() => {
                        fileListRef.current = []
                        return []
                    })
                }}>清空</Button>
                <Button style={{ width: 100, marginTop: 15, marginBottom: 15, marginLeft: 15 }} onClick={() => {
                    setOpen(true)
                }}>下载文件</Button>
            </div>
            {/** 下载文件对话框 */}
            <Modal
                title={
                    <div
                        style={{ width: '100%', cursor: 'move' }}
                        onMouseOver={() => {
                            if (disabled) {
                                setDisabled(false);
                            }
                        }}
                        onMouseOut={() => {
                            setDisabled(true);
                        }}
                        onFocus={() => { }}
                        onBlur={() => { }}
                    >
                        下载文件生成MD5
                    </div>
                }
                open={open}
                onCancel={handleCancel}
                width={1000}
                mask={false}
                footer={[
                    <Button key="back" onClick={handleCancel}>关闭</Button>,
                ]}
                modalRender={renderModalContent}
            >
                <Table
                    style={{ marginTop: 10 }}
                    pagination={false}
                    bordered
                    size={'small'}
                    rowKey={'url'}
                    columns={downloadColumns}
                    dataSource={urlList || []}
                />
            </Modal>
        </div>
    )
}


