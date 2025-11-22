// Exercise 9
let stats = {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0
};

// Exercise 1
const WORD_LIST = [
    "TABLE", "CHAIR", "PIANO", "MOUSE", "HOUSE",
    "PLANT", "BRAIN", "CLOUD", "BEACH", "FRUIT",
    "LLAMA", "ROBOT", "TIGER", "EAGLE", "OCEAN"
];

let targetWord = '';
const MAX_TRIES = 6;
const WORD_LENGTH = 5;

let tries = 0;
let gameOver = false;

let board, guessButton, guessInput, newGameButton, errorMessage;

function updateStats() {
    const winPercentage = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
    document.getElementById('games-played').textContent = stats.gamesPlayed;
    document.getElementById('win-percentage').textContent = winPercentage + '%';
    document.getElementById('current-streak').textContent = stats.currentStreak;

}

function selectRandomWord() {
    const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
    return WORD_LIST[randomIndex];
}

function initializeBoard() {
    board.innerHTML = '';

    for (let i = 0; i < MAX_TRIES; i++) {
        let row = document.createElement('div');
        row.classList.add('row');
        board.append(row);

        for (let j = 0; j < WORD_LENGTH; j++) {
            let cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-row', i);
            cell.setAttribute('data-column', j);
            row.append(cell);
        }
    }
}

function resetGame() {
    targetWord = selectRandomWord();
    tries = 0;
    gameOver = false;
    initializeBoard();

    guessInput.value = '';
    guessInput.focus();
    guessInput.disabled = false;
    guessButton.disabled = false;
    newGameButton.classList.add('hidden');
    errorMessage.classList.add('hidden');

    console.log(`*Cuvânt ţintă nou:* ${targetWord}`);
}

function showErrorMessage(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 1500);
}

// Exercise 8
function checkGuess(guess, word) {
    const feedback = new Array(WORD_LENGTH).fill('absent');
    const targetWordLetters = word.split('');
    const guessLetters = guess.split('');
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessLetters[i] === targetWordLetters[i]) {
            feedback[i] = 'correct';
            targetWordLetters[i] = null;
            guessLetters[i] = null;
        }
    }


    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessLetters[i] !== null) {
            const indexInTarget = targetWordLetters.indexOf(guessLetters[i]);

            if (indexInTarget !== -1) {
                feedback[i] = 'present'; targetWordLetters[indexInTarget] = null;
            }

        }
    }
    return feedback;
}

function handleGuess() {
    if (gameOver) {
        showErrorMessage("Jocul s-a terminat. Apasă 'Joc Nou'.");
        return;
    }

    let guess = guessInput.value.toUpperCase();

    // Exercise 2
    if (guess.length !== WORD_LENGTH) {
        showErrorMessage(`Ghicirea trebuie să aibă exact ${WORD_LENGTH} litere.`);
        return;
    }

    const feedback = checkGuess(guess, targetWord);

    for (let i = 0; i < WORD_LENGTH; i++) {
        const currentCell = document.querySelector(`[data-row="${tries}"][data-column="${i}"]`);
        const currentLetter = document.createTextNode(guess[i]);
        currentCell.append(currentLetter);
        // Exercise 7
        setTimeout(() => {
            currentCell.classList.add(feedback[i]);
            currentCell.style.animation = `flip 0.6s linear`;
        }, i * 300);
    }
    guessInput.value = '';

    if (guess === targetWord) {
        gameOver = true;
        stats.gamesPlayed++;
        stats.gamesWon++;
        stats.currentStreak++;
        alert("You won!");
    }
    tries++;

    if (!gameOver && tries >= MAX_TRIES) {
        gameOver = true;
        stats.gamesPlayed++;
        stats.currentStreak = 0;
        // Exercise 6
        alert(`You lost! The word was: **${targetWord}**`);
    }

    if (gameOver) {
        guessInput.disabled = true;
        guessButton.disabled = true;
        newGameButton.classList.remove('hidden'); // Exercise 4
        updateStats();
    }
}

window.onload = function () {
    board = document.getElementById('board');
    guessButton = document.getElementById('guessButton');
    guessInput = document.getElementById('guessInput');
    newGameButton = document.getElementById('newGameButton');
    errorMessage = document.getElementById('error-message');

    updateStats();

    resetGame();

    guessButton.addEventListener('click', handleGuess);
    newGameButton.addEventListener('click', resetGame);
    // Exercise 5
    guessInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            handleGuess();
        }
    });

    guessInput.addEventListener('input', function () {
        this.value = this.value.toUpperCase();
    });
}