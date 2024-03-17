const difficultyList = [
    {
        fieldWidth: 550,
        cellSize: 50,
        cellCount: 11,
        mineCount: 12,
    },

    {
        fieldWidth: 600,
        cellSize: 40,
        cellCount: 15,
        mineCount: 34,
    },

    {
        fieldWidth: 665,
        cellSize: 35,
        cellCount: 19,
        mineCount: 72,
    }
]

const colorNum = ['#0000FF', '#008000', '#FF0000', '#00008b', '#964b00', '#30d5c8', '#000', '#fff']
const mainField = document.getElementById('pole_game')
const difficultyValue = document.getElementById('difficulty')
const buttonNewGame = document.getElementById('new_game')
const timer = document.getElementById('timer')
var checkTimer = false
var second
var minute
var openCellCheck
var matrix
var interval

difficultyValue.addEventListener("change", newGame)
buttonNewGame.addEventListener("click", newGame)

function elInList(el, list) {
    for (i of list) {
        if (el === i) {
            return true
        }
    }

    return false
}

function getRandomInt(num) {
    return Math.floor(Math.random() * num);
}

function createField(difficulty) {
    mainField.classList = ''
    mainField.innerHTML = ''
    mainField.classList.add('field_game')
    mainField.classList.add(`field_widgth_${difficulty.fieldWidth}`)

    for (let i = 0; i < difficulty.cellCount; i++) {
        row = []
        for (let j = 0; j < difficulty.cellCount; j++) {
            mainField.innerHTML += `
                <div id ="${[i, j]}" class="cell_size_${difficulty.cellSize} 
                cell_closed_color_${(i + j) % 2}">
                </div>
            `
        }
    }
}

function createMatrix(difficulty) {
    matrix = []
    let rowMatrix
    let x
    let y
    let mineCount = 0

    for (let i = 0; i < difficulty.cellCount; i++) {
        rowMatrix = []
        for (let j = 0; j < difficulty.cellCount; j++) {
            rowMatrix.push(0)
        }
        matrix.push(rowMatrix)
    }

    while (mineCount < difficulty.mineCount) {
        x = getRandomInt(difficulty.cellCount)
        y = getRandomInt(difficulty.cellCount)

        if (matrix[y][x] != 9) {
            matrix[y][x] = 9
            mineCount++
        }
    }

    for (let i = 0; i < difficulty.cellCount; i++) {
        for (let j = 0; j < difficulty.cellCount; j++) {
            if (matrix[i][j] != 9) {
                matrix[i][j] = checkCell([i, j])
            }
        }
    }
}

function checkCell(index) {
    let countMine = 0

    for (let i = -1; i < 2; i++) {
        let x
        let y
        for (let j = -1; j < 2; j++) {
            y = index[0] + i
            x = index[1] + j

            if (checkMine([y, x])) { countMine++ }
        }
    }

    return countMine
}

function checkMine(id) {
    if (matrix[id[0]] === undefined) { return false }
    if (matrix[id[0]][id[1]] === 9) { return true }

    return false
}

function openCell(id) {
    if (elInList(id, openCellCheck)) { return }

    let idList = id.split(',').map((num) => Number(num))
    document.getElementById(id).classList.add(`cell_open_color_${(idList[0] + idList[1]) % 2}`)
    document.getElementById(id).removeEventListener("contextmenu", clickFlag)
    openCellCheck.push(id)
    let element = matrix[idList[0]][idList[1]]

    if (element === 9) {
        document.getElementById(id).innerHTML = '💣'
        gameOver()
        return
    }

    checkWin()
    if (element != 0) {
        document.getElementById(id).innerHTML = `<span style="color: ${colorNum[element - 1]}">${element}</span>`
        return
    }

    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            y = idList[0] + i
            x = idList[1] + j
            if (matrix[y]?.[x] != undefined) {
                openCell(`${y},${x}`)
            }

        }
    }
}

function clickCell() {
    let idCell = this.id

    if (!checkTimer) {
        startTimer()
        checkTimer = true
    }

    openCell(idCell)
}

function connectClickCell(difficulty) {
    for (let i = 0; i < difficulty.cellCount; i++) {
        for (let j = 0; j < difficulty.cellCount; j++) {
            document.getElementById([i, j]).addEventListener("click", clickCell, { once: true })
            document.getElementById([i, j]).addEventListener("contextmenu", clickFlag)
        }
    }
}

function gameOver() {
    stopTimer()
    let difficultyNow = difficultyList[difficultyValue.value]
    document.getElementById('win_or_lose').innerHTML = '<span style="color: red">Не повезло!</span>'

    for (let i = 0; i < difficultyNow.cellCount; i++) {
        for (let j = 0; j < difficultyNow.cellCount; j++) {
            document.getElementById([i, j]).removeEventListener("click", clickCell, { once: true })
            document.getElementById([i, j]).removeEventListener("contextmenu", clickFlag)

            if (matrix[i][j] === 9) {
                openCell(`${i},${j}`)
            }
        }
    }
}

function onConnect(difficulty) {

    for (let i = 0; i < difficulty.cellCount; i++) {
        for (let j = 0; j < difficulty.cellCount; j++) {
            document.getElementById([i, j]).removeEventListener("click", clickCell, { once: true })
            document.getElementById([i, j]).removeEventListener("contextmenu", clickFlag)
        }
    }
}

function checkWin() {
    let difficultyNow = difficultyList[difficultyValue.value]
    if (difficultyNow.cellCount ** 2 - openCellCheck.length === difficultyNow.mineCount) {
        stopTimer()
        document.getElementById('win_or_lose').innerHTML = '<span style="color: green">Победа!</span>'
        onConnect(difficultyNow)
    }
}

function clickFlag(event) {
    event.preventDefault()

    console.log(this.children.length)

    if (this.children.length == 0) {
        this.innerHTML = '<span>🚩</span>'
        this.removeEventListener("click", clickCell, { once: true })
    } else {
        this.innerHTML = ''
        this.addEventListener("click", clickCell, { once: true })
    }
}

function startTimer() {
    interval = setInterval(updateTimer, 1000)
}

function updateTimer() {
    second++

    if (second == 60) {
        minute++
        second = 0
    }

    timer.textContent = `
        ${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}
    `
}

function stopTimer() {
    clearInterval(interval)
}

function newGame() {
    let difficultyNow = difficultyList[difficultyValue.value]
    millisecond = 0
    second = 0
    minute = 0
    checkTimer = false
    clearInterval(interval)
    timer.textContent = '00:00'
    openCellCheck = []
    document.getElementById('win_or_lose').innerHTML = ''

    createMatrix(difficultyNow)
    createField(difficultyNow)
    connectClickCell(difficultyNow)
}

newGame()
