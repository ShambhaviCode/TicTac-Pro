/* ===================================================
   TicTac Pro
   script.js
   Part 1/3
=================================================== */

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");

const newGameBtn = document.getElementById("newGame");
const resetBtn = document.getElementById("resetScores");

const modeSelect = document.getElementById("mode");
const difficultySelect = document.getElementById("difficulty");

let board = Array(9).fill("");

let currentPlayer = "X";

let gameRunning = true;

const WIN_PATTERNS = [

    [0,1,2],
    [3,4,5],
    [6,7,8],

    [0,3,6],
    [1,4,7],
    [2,5,8],

    [0,4,8],
    [2,4,6]

];

let scores = JSON.parse(
    localStorage.getItem("tttScores")
) || {

    X:0,
    O:0,
    draw:0

};

updateScoreBoard();

cells.forEach(cell=>{
    cell.addEventListener("click",handleCellClick);
});

newGameBtn.addEventListener(
    "click",
    startNewGame
);

resetBtn.addEventListener(
    "click",
    resetScores
);

modeSelect.addEventListener(
    "change",
    startNewGame
);

difficultySelect.addEventListener(
    "change",
    startNewGame
);

function updateScoreBoard(){

    scoreX.textContent=scores.X;
    scoreO.textContent=scores.O;
    scoreDraw.textContent=scores.draw;

    localStorage.setItem(
        "tttScores",
        JSON.stringify(scores)
    );

}

function handleCellClick(e){

    const index=e.target.dataset.index;

    if(!gameRunning)
        return;

    if(board[index]!="")
        return;

    playMove(index,currentPlayer);

    if(checkWinner())
        return;

    if(checkDraw())
        return;

    switchPlayer();

    if(
        modeSelect.value==="ai" &&
        currentPlayer==="O"
    ){

        statusText.textContent="AI Thinking...";

        setTimeout(aiMove,500);

    }

}

function playMove(index,player){

    board[index]=player;

    cells[index].textContent=player;

    cells[index].classList.add(
        player.toLowerCase()
    );

}

function switchPlayer(){

    currentPlayer=
        currentPlayer==="X"
        ? "O"
        : "X";

    statusText.textContent=
        `Player ${currentPlayer}'s Turn`;

}

function startNewGame(){

    board=Array(9).fill("");

    currentPlayer="X";

    gameRunning=true;

    statusText.textContent=
        "Player X's Turn";

    cells.forEach(cell=>{

        cell.textContent="";

        cell.classList.remove(
            "x",
            "o",
            "win"
        );

    });

}

function resetScores(){

    scores={
        X:0,
        O:0,
        draw:0
    };

    updateScoreBoard();

    startNewGame();

}
/* ===================================================
   TicTac Pro
   script.js
   Part 2/3
   Winner Detection + AI
=================================================== */

// ---------- Winner ----------

function checkWinner() {

    for (const pattern of WIN_PATTERNS) {

        const [a, b, c] = pattern;

        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {

            gameRunning = false;

            cells[a].classList.add("win");
            cells[b].classList.add("win");
            cells[c].classList.add("win");

            statusText.textContent =
                `🎉 Player ${board[a]} Wins!`;

            scores[board[a]]++;

            updateScoreBoard();

            celebrate();

            return true;
        }
    }

    return false;

}

// ---------- Draw ----------

function checkDraw() {

    if (board.includes(""))
        return false;

    gameRunning = false;

    statusText.textContent =
        "🤝 It's a Draw!";

    scores.draw++;

    updateScoreBoard();

    return true;

}

// ---------- Confetti ----------

function celebrate() {

    if (typeof confetti !== "undefined") {

        confetti({

            particleCount: 150,

            spread: 100,

            origin: {
                y: 0.6
            }

        });

    }

}

// ---------- AI ----------

function aiMove() {

    if (!gameRunning)
        return;

    let move;

    switch (difficultySelect.value) {

        case "easy":
            move = randomMove();
            break;

        case "medium":
            move = mediumMove();
            break;

        default:
            move = bestMove();
    }

    playMove(move, "O");

    if (checkWinner())
        return;

    if (checkDraw())
        return;

    switchPlayer();

}

// ---------- Easy AI ----------

function randomMove() {

    const empty = [];

    board.forEach((value, index) => {

        if (value === "")
            empty.push(index);

    });

    return empty[
        Math.floor(Math.random() * empty.length)
    ];

}

// ---------- Medium AI ----------

function mediumMove() {

    // 50% smart
    // 50% random

    if (Math.random() < 0.5)
        return randomMove();

    // Try to win

    for (let i = 0; i < 9; i++) {

        if (board[i] === "") {

            board[i] = "O";

            if (evaluateWinner("O")) {

                board[i] = "";

                return i;

            }

            board[i] = "";

        }

    }

    // Try to block player

    for (let i = 0; i < 9; i++) {

        if (board[i] === "") {

            board[i] = "X";

            if (evaluateWinner("X")) {

                board[i] = "";

                return i;

            }

            board[i] = "";

        }

    }

    return randomMove();

}

// ---------- Helper ----------

function evaluateWinner(player) {

    return WIN_PATTERNS.some(pattern => {

        return pattern.every(index => board[index] === player);

    });

}
/* ===================================================
   TicTac Pro
   script.js
   Part 3/3
   Impossible AI (Minimax)
=================================================== */

function bestMove() {

    let bestScore = -Infinity;
    let move = -1;

    for (let i = 0; i < 9; i++) {

        if (board[i] === "") {

            board[i] = "O";

            let score = minimax(board, 0, false);

            board[i] = "";

            if (score > bestScore) {

                bestScore = score;
                move = i;

            }

        }

    }

    return move;

}

function minimax(boardState, depth, isMaximizing) {

    let result = evaluateBoard(boardState);

    if (result !== null)
        return result - depth;

    if (isMaximizing) {

        let bestScore = -Infinity;

        for (let i = 0; i < 9; i++) {

            if (boardState[i] === "") {

                boardState[i] = "O";

                let score = minimax(
                    boardState,
                    depth + 1,
                    false
                );

                boardState[i] = "";

                bestScore = Math.max(bestScore, score);

            }

        }

        return bestScore;

    } else {

        let bestScore = Infinity;

        for (let i = 0; i < 9; i++) {

            if (boardState[i] === "") {

                boardState[i] = "X";

                let score = minimax(
                    boardState,
                    depth + 1,
                    true
                );

                boardState[i] = "";

                bestScore = Math.min(bestScore, score);

            }

        }

        return bestScore;

    }

}

function evaluateBoard(boardState) {

    for (const pattern of WIN_PATTERNS) {

        const [a, b, c] = pattern;

        if (
            boardState[a] &&
            boardState[a] === boardState[b] &&
            boardState[a] === boardState[c]
        ) {

            return boardState[a] === "O"
                ? 10
                : -10;

        }

    }

    if (!boardState.includes(""))
        return 0;

    return null;

}

/* ===================================================
   Initialize
=================================================== */

startNewGame();