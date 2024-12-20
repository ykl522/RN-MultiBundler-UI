/*
 * @Author: 康乐 yuankangle@yunexpress.cn
 * @Date: 2023-08-24 17:15:26
 * @LastEditors: 康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2023-08-31 11:08:50
 * @FilePath: \RN-MultiBundler-UI\src\page\JGGView.js
 */
import { Button } from 'antd';
import { useState, useEffect, useRef } from 'react';
import JGG from '../utils/JGG';
const { cloneDeep } = require('lodash')


export default function JGGView() {

    // 细
    const BORDER_WIDTH_FINE = 1
    // 粗
    const BORDER_WIDTH_WIDE = 2

    const boardDef = [
        ["5", "3", ".", ".", "7", ".", ".", ".", "."],
        ["6", ".", ".", "1", "9", "5", ".", ".", "."],
        [".", "9", "8", ".", ".", ".", ".", "6", "."],
        ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
        ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
        ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
        [".", "6", ".", ".", ".", ".", "2", "8", "."],
        [".", ".", ".", "4", "1", "9", ".", ".", "5"],
        [".", ".", ".", ".", "8", ".", ".", "7", "9"]
    ]

    const [board, setBoard] = useState(boardDef)
    const boardRef = useRef(boardDef)
    const newBoardRef = useRef([])
    const [isLoading, setIsLoading] = useState(false)
    const [showSelector, setShowSelector] = useState()

    const getRandomData = () => {
        const randomData = JGG.randomInit()
        for (let rowsIndex in randomData) {
            let rows = randomData[rowsIndex]
            for (let index in rows) {
                rows[index] = rows[index] ? `${rows[index]}`.replace('0', '.') : '.'
                boardRef.current[rowsIndex][index] = rows[index]
            }
        }
        const newBoard = JGG.solveSudoku(cloneDeep(randomData))
        console.log('newBoard--->', newBoard)
        if (newBoard && newBoard.toString().includes('.')) {
            return getRandomData()
        } else {
            newBoardRef.current = newBoard
            return cloneDeep(randomData)
        }
    }

    useEffect(() => {
        setIsLoading(false)
    }, [board])

    return (<div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 30, paddingRight: 30 }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Button
                style={{ width: 100, marginTop: 15, marginBottom: 15, marginRight: 15 }}
                loading={isLoading}
                onClick={() => {
                    setIsLoading(true)
                    setBoard(getRandomData())
                }}
            >随机</Button>
            <Button
                style={{ width: 100, marginTop: 15, marginBottom: 15, marginRight: 15 }}
                onClick={() => {
                    console.log('boardRef.current--->', boardRef.current)
                    setBoard(cloneDeep(boardRef.current))
                }}
            >还原</Button>
            <Button
                style={{ width: 100, marginTop: 15, marginBottom: 15, marginRight: 15 }}
                onClick={() => {
                    if (newBoardRef.current) {
                        setBoard(cloneDeep(newBoardRef.current))
                    } else {
                        const newBoard = JGG.solveSudoku(board)
                        setBoard(cloneDeep(newBoard))
                    }
                }}
            >解答</Button>
        </div>
        {
            board.map((_V, rowsIndex) => {
                return (
                    <div key={rowsIndex} style={{ display: 'flex', flexDirection: 'row' }}>
                        {
                            board[rowsIndex].map((item, index) => {
                                return (
                                    <div key={index}
                                        onClick={(e) => {
                                            console.log('------------------------', board[rowsIndex][index])
                                            const boundingClientRect = e.target.getBoundingClientRect()
                                            console.log('-----------e------------', boundingClientRect)
                                            if (board[rowsIndex][index]) {
                                                boundingClientRect.boardRowsIndex = rowsIndex
                                                boundingClientRect.boardIndex = index
                                                setShowSelector(boundingClientRect)
                                            }
                                        }}
                                        style={{
                                            display: 'flex',
                                            borderColor: '#000',
                                            borderStyle: 'solid',
                                            borderWidth: 1,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: 50,
                                            height: 50,
                                            borderLeftWidth: index % 3 == 0 ? BORDER_WIDTH_WIDE : BORDER_WIDTH_FINE,
                                            borderTopWidth: rowsIndex % 3 == 0 ? BORDER_WIDTH_WIDE : BORDER_WIDTH_FINE,
                                            borderRightWidth: index % 3 == 2 ? BORDER_WIDTH_WIDE : BORDER_WIDTH_FINE,
                                            borderBottomWidth: rowsIndex % 3 == 2 ? BORDER_WIDTH_WIDE : BORDER_WIDTH_FINE,
                                        }}
                                    >
                                        {item === '.' ? '' : item}
                                    </div>
                                )
                            })
                        }
                    </div>
                )
            })
        }
        {showSelector ?
            <div
                style={{
                    position: 'absolute', display: 'flex', flexDirection: 'column',
                    top: showSelector.y - 53 - showSelector.height / 2, left: showSelector.x - showSelector.width / 2, backgroundColor: 'white'
                }}
                onClick={() => {
                    setShowSelector(null)
                }}>{
                    [1, 2, 3].map((v, rowsIndex) => {
                        return (
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                {
                                    [1, 2, 3].map((vv, index) => {
                                        return (
                                            <div
                                                style={{
                                                    display: 'flex', width: '30px', height: '30px',
                                                    justifyContent: 'center', alignItems: 'center',
                                                    borderColor: '#000', borderStyle: 'solid', borderWidth: 1,
                                                    borderLeftWidth: index % 3 == 0 ? BORDER_WIDTH_FINE : 1,
                                                    borderTopWidth: rowsIndex % 3 == 0 ? BORDER_WIDTH_FINE : 1,
                                                    borderRightWidth: index % 3 == 2 ? BORDER_WIDTH_FINE : 0,
                                                    borderBottomWidth: rowsIndex % 3 == 2 ? BORDER_WIDTH_FINE : 0,
                                                }}
                                                onClick={() => {
                                                    let newBoard = cloneDeep(board)
                                                    newBoard[showSelector.boardRowsIndex][showSelector.boardIndex] = vv + rowsIndex * v
                                                    setBoard(newBoard)
                                                }}
                                            >
                                                {vv + rowsIndex * v}
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        )
                    })}
                <div style={{ display: 'flex', flexDirection: 'row', borderColor: '#000' }}>
                    <div style={{ flex: 1, textAlign: 'center', borderColor: '#000', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 1, borderTopWidth: 0 }}
                        onClick={() => {
                            let newBoard = cloneDeep(board)
                            newBoard[showSelector.boardRowsIndex][showSelector.boardIndex] = '.'
                            setBoard(newBoard)
                        }}
                    >清除</div>
                    <div style={{ flex: 1, textAlign: 'center', borderColor: '#000', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 }}
                        onClick={() => {
                            setShowSelector(null)
                        }}
                    >关闭</div>
                </div>

            </div> : null}
    </div>)

}