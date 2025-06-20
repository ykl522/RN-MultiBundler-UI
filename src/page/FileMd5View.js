/*
 * @Author: 康乐 yuankangle@gmail.com
 * @Date: 2022-11-15 09:38:26
 * @LastEditors: 康乐 yuankangle@gmail.com
 * @LastEditTime: 2023-08-24 17:37:08
 * @FilePath: \RN-MultiBundler-UI\src\page\Md5View.js
 * @Description: md5
 */
import { useState, useEffect, useRef } from 'react';
const { Button, Modal, notification, Upload, Table } = require('antd');
const fs = require('fs');
const crypto = require('crypto');
import { InboxOutlined } from '@ant-design/icons';
import JGG from '../utils/JGG';
import { downloadFile } from '../net/HttpRequest';
import Draggable from 'react-draggable';
export default function Md5View(props) {

    const [fileList, setFileList] = useState([])
    const [urlList, setUrlList] = useState([
    ])
    const [visible, setVisible] = useState(false)
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
    const [disabled, setDisabled] = useState(true);
    const draggleRef = useRef(null);
    let fileListRef = useRef([])

    useEffect(() => {
        console.log("fileList--->", fileList)
    }, [fileList])

    const draggerProps = {
        name: 'file',
        multiple: true,
        showUploadList: fileList.length > 0,
        onChange: (info) => {
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
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
        onPreview(e) {
            console.log('------------', e)
        },
        onRemove(e) {
            fileListRef.current = []
            for (let item of fileList) {
                if (e.uid != item.uid) {
                    fileListRef.current.push(item)
                }
            }
            setFileList([...fileListRef.current])
        }
    };

    const md5 = (filePath) => {
        const buffer = fs.readFileSync(filePath);
        const hash = crypto.createHash('md5');
        hash.update(buffer, 'utf8');
        const md5 = hash.digest('hex');
        console.log(md5);
        return md5
    }

    const handleCancel = () => {
        setVisible(false)
    }

    // 下载Blob的函数 blob是axios返回的文件数据，fileName是下载的文件名
    const downloadBlob = (columnData, data, fileName) => {
        const crypto = require('crypto');
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
        // fs.writeFile(props.downloadPath + '\\' + fileName, Buffer.from(data));
    };

    const columns = [
        {
            title: '文件路径',
            dataIndex: 'path',
            key: 'path',
            render: (data) => <div style={{ width: 380 }}>{data}</div>
        },
        {
            title: '文件大小',
            dataIndex: 'size',
            key: 'size',
            render: (data) => <div style={{ width: 55 }}>{`${(data / 1024 / 1024).toFixed(2)}M`}</div>
        },
        {
            title: 'MD5',
            dataIndex: 'md5',
            key: 'md5',
            render: (data) => <a style={{ width: 315 }}>{data}</a>
        }, {
            title: '最后修改时间',
            dataIndex: 'lastModified',
            key: 'lastModified',
            render: (data) => <div style={{ width: 155 }}>{new Date(data).toLocaleString()}</div>
        }
    ]

    const downloadColumns = [
        {
            title: 'URL路径',
            dataIndex: 'url',
            key: 'url',
            render: (data) => <div style={{ width: 380 }}>{data}</div>
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
            render: (data) => <a style={{ width: 315 }}>{data}</a>
        }, {
            title: '操作',
            dataIndex: 'opration',
            key: 'opration',
            render: (_, columnData) => <div style={{ width: 55, color: 'blue' }}
                onClick={() => {
                    // 这里可以添加下载逻辑
                    console.log(columnData)
                    downloadFile(columnData.url, (progress) => {
                        console.log(progress)
                    }, (data) => {
                        downloadBlob(columnData, data, columnData.fileName || columnData.url.split('/').pop());
                    })
                }} >下载</div>
        }
    ]

    const onStart = (_event, uiData) => {
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
                    var board = [["5", "3", ".", ".", "7", ".", ".", ".", "."], ["6", ".", ".", "1", "9", "5", ".", ".", "."], [".", "9", "8", ".", ".", ".", ".", "6", "."], ["8", ".", ".", ".", "6", ".", ".", ".", "3"], ["4", ".", ".", "8", ".", "3", ".", ".", "1"], ["7", ".", ".", ".", "2", ".", ".", ".", "6"], [".", "6", ".", ".", ".", ".", "2", "8", "."], [".", ".", ".", "4", "1", "9", ".", ".", "5"], [".", ".", ".", ".", "8", ".", ".", "7", "9"]]
                    console.log('JGG---', JGG.solveSudoku2(board))
                    setFileList(() => {
                        fileListRef.current = []
                        return []
                    })
                }}>清空</Button>
                <Button style={{ width: 100, marginTop: 15, marginBottom: 15, marginLeft: 15 }} onClick={() => {
                    setVisible(true)
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
                visible={visible}
                onCancel={handleCancel}
                width={1000}
                mask={false}
                footer={[
                    <Button key="back" onClick={handleCancel}>关闭</Button>,
                ]}
                modalRender={modal => (
                    <Draggable
                        disabled={disabled}
                        bounds={bounds}
                        nodeRef={draggleRef}
                        onStart={(event, uiData) => onStart(event, uiData)}
                    >
                        <div ref={draggleRef}>{modal}</div>
                    </Draggable>
                )}
            >
                <Table
                    style={{ marginTop: 10 }}
                    pagination={false}
                    bordered
                    size={'small'}
                    rowKey={'url'}
                    columns={downloadColumns}
                    dataSource={urlList}
                />
            </Modal>
        </div>
    )
}


