/*
 * @Author: 康乐 yuankangle@yunexpress.cn
 * @Date: 2022-11-15 09:38:26
 * @LastEditors: 康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2023-08-24 17:37:08
 * @FilePath: \RN-MultiBundler-UI\src\page\Md5View.js
 * @Description: md5
 */
import { useState, useEffect, useRef } from 'react';
const { Button, Input, notification, Upload, Table } = require('antd');
const fs = require('fs');
const crypto = require('crypto');
import { InboxOutlined } from '@ant-design/icons';
import JGG from '../utils/JGG';
export default function Md5View() {

    const [fileList, setFileList] = useState([])
    let fileListRef = useRef([])

    useEffect(() => {
        console.log("fileList--->", fileList)
    }, [fileList])

    const props = {
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
        }]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 30, paddingRight: 30 }}>
            <Upload.Dragger height={250} {...props} fileList={fileList}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">单击或拖动文件到此区域</p>
                <p className="ant-upload-hint">
                    支持单个或者批量文件生成文件的MD5值
                </p>
            </Upload.Dragger>
            <Table style={{ marginTop: 10 }} pagination={false} bordered size={'small'} rowKey={'uid'} columns={columns} dataSource={fileList} />
            <Button style={{ width: 100, marginTop: 15, marginBottom: 15 }} onClick={() => {
                var board = [["5", "3", ".", ".", "7", ".", ".", ".", "."], ["6", ".", ".", "1", "9", "5", ".", ".", "."], [".", "9", "8", ".", ".", ".", ".", "6", "."], ["8", ".", ".", ".", "6", ".", ".", ".", "3"], ["4", ".", ".", "8", ".", "3", ".", ".", "1"], ["7", ".", ".", ".", "2", ".", ".", ".", "6"], [".", "6", ".", ".", ".", ".", "2", "8", "."], [".", ".", ".", "4", "1", "9", ".", ".", "5"], [".", ".", ".", ".", "8", ".", ".", "7", "9"]]
                console.log('JGG---', JGG.solveSudoku2(board))
                setFileList(() => {
                    fileListRef.current = []
                    return []
                })
            }}>清空</Button>
        </div>
    )
}


