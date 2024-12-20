/*
 * @Author: 康乐 yuankangle@yunexpress.cn
 * @Date: 2023-08-24 16:07:55
 * @LastEditors: 康乐 yuankangle@yunexpress.cn
 * @LastEditTime: 2023-08-25 11:20:51
 * @FilePath: \RN-MultiBundler-UI\src\utils\JGG.js
 * @Description: 九宫格算法
 */

const { cloneDeep, random } = require('lodash')
export default class JGG {

    /**
     * 方法一
     * @param {*} board 
     * @param {string} [space]
     * @returns {[]}
     */
    static solveSudoku(board, space = '.') {
        //判断是否冲突
        const hasConflict = (r, c, val) => {
            for (let i = 0; i < 9; i++) {
                if (board[i][c] == val || board[r][i] == val) {
                    return true
                }
            }
            var subRowStart = Math.floor(r / 3) * 3
            //该点对应小框中行的起始索引
            var subColStart = Math.floor(c / 3) * 3
            //该点对应小框中列的起始索引
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[subRowStart + i][subColStart + j] == val) {
                        //判断它所在小框是否重复
                        return true
                    }
                }
            }
            return false
        }
        //递归函数
        const fill = (i, j) => {
            if (j == 9) {
                //换行
                i++
                j = 0;
                if (i == 9) {
                    return true
                }
            }
            if (board[i][j] != space) {
                //如果不为空,执行下一个
                return fill(i, j + 1)
            }
            for (let num = 1; num <= 9; num++) {
                //开始填入数字
                if (hasConflict(i, j, String(num))) {
                    //冲突
                    continue
                }
                board[i][j] = String(num)
                //如果不冲突,填入该数字
                if (fill(i, j + 1)) {
                    return true
                }
                board[i][j] = space
                //否则清空
            } return false
        }
        fill(0, 0)
        return board
    }

    //方法二
    static solveSudoku2(board, space = '.') {
        const rows = new Array(9)
        const cols = new Array(9)
        const blocks = new Array(9)
        const opitons = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
        for (let i = 0; i < 9; i++) {
            //初始化
            rows[i] = new Set(opitons)
            cols[i] = new Set(opitons)
            blocks[i] = new Set(opitons)
        }
        const getBlockIndex = (i, j) => {
            //获取坐标所在框的索引
            return parseInt(i / 3) * 3 + parseInt(j / 3) // return (i / 3 | 0) * 3 + (j / 3 | 0)gi
        }
        for (let i = 0; i < 9; i++) {
            //更新set,删除该选项
            for (let j = 0; j < 9; j++) {
                if (board[i][j] != space) {
                    rows[i].delete(board[i][j])
                    cols[j].delete(board[i][j])
                    blocks[getBlockIndex(i, j)].delete(board[i][j])
                }
            }
        }
        //递归
        const fill = (i, j) => {
            if (j == 9) {
                //换行
                i++
                j = 0
                if (i == 9) {
                    return true
                }
            }
            if (board[i][j] != space) {
                return fill(i, j + 1)
            }
            const blockIndex = getBlockIndex(i, j)
            for (let num = 1; num <= 9; num++) {
                const s = String(num)
                if (!rows[i].has(s) || !cols[j].has(s) || !blocks[blockIndex].has(s)) {
                    //如果数组中没有,continue
                    continue
                }
                board[i][j] = s
                rows[i].delete(board[i][j])
                cols[j].delete(board[i][j])
                blocks[blockIndex].delete(board[i][j])
                if (fill(i, j + 1)) { return true }
                board[i][j] = space
                rows[i].add(s)
                cols[j].add(s)
                blocks[blockIndex].add(s)
            }
            return false
        }
        fill(0, 0)
        return board
    }

    // 填充数字，或者对象的拷贝
    static getM(n = 9, val = 0) {
        return Array(n).fill().map(
            () => Array(n).fill().map(
                () => cloneDeep(val)
            )
        )
    }

    // 向m中的x,y位置放入合法数字
    static setNum(m, x, y) {
        let s = new Set(Array(9).fill().map((_, k) => k + 1))

        for (let i = 0; i < 9; i++) {
            s.delete(m[i][y])
            s.delete(m[x][i])
        }

        // 去除九宫格中的重复数
        let stx = Math.floor(x / 3) * 3// 左上角x
        let sty = Math.floor(y / 3) * 3// 左上角y
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++) {
                let nx = stx + i
                let ny = sty + j
                s.delete(m[nx][ny])
            }

        let list = [...s]
        let index = random(0, list.length - 1)
        m[x][y] = list[index]
        // console.log('set', x, y, m[x][y])
    }

    // 向m中的x,y 位置填充数据，可以填充的数字个数为num
    static dfs(m, x, y, num) {
        // console.log('dfs', x, y)
        if (num === 0 || x > 8) {
            return
        }
        // 该格子放数字的概率
        let blank = 81 - (x * 9 + y)
        let p = num / blank
        // console.log(p, num, blank, x, y)
        if (Math.random() <= p) {
            // 放入数字
            this.setNum(m, x, y)
            num--
        }

        if (y === 8)
            x++, y = 0
        else y++
        this.dfs(m, x, y, num)
    }

    static fill(n) {
        let m = this.getM(9)
        this.dfs(m, 0, 0, n)
        return m
    }

    static toStr(m) {
        let rows = m.map(x => x.join(','))
        return rows.join('\n')
    }

    static randomInit() {
        let n = random(20, 35)
        let m = this.fill(n)
        console.log(m)
        console.log(this.toStr(m))
        return m
    }

}
