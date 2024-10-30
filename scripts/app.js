const generateRandomNumber = () => Math.ceil(Math.random() * 6);

const container = document.querySelector("[data-container]");
const gameInfo = document.querySelector("[data-game-info]");
const actionBtn = document.querySelector("[data-action-btn]");

// Кнопки выбора игрока
const selectPlayerButtons = document.querySelectorAll("[data-select-player]");

// Получаем элементы для отображения очков игроков
const player1ScoreEl = document.getElementById("player1-score");
const player2ScoreEl = document.getElementById("player2-score");

let currentPlayer = 0;  // Текущий игрок по умолчанию
let playerScores = [0, 0];  // Счёт игроков
let roundCount = 0;  // Счётчик раундов
let throwCount = 0;  // Счётчик бросков для текущего игрока
let hasSpecialRoll = false;  // Проверка на льготный бросок

// Функция для отображения кубиков
const renderDice = (diceValues) => {
    container.innerHTML = "";  // Очищаем контейнер перед каждым броском
    diceValues.forEach((value) => {
        container.insertAdjacentHTML("beforeend", `
            <svg class="dice ${currentPlayer === 0 ? 'dice-red' : 'dice-blue'}">
                <use href="sprites.svg#dice-${value}-icon"></use>
            </svg>
        `);
    });
};

// Функция обновления очков игроков
const updateScoresDisplay = () => {
    player1ScoreEl.textContent = `Игрок 1: ${playerScores[0]} очков`;
    player2ScoreEl.textContent = `Игрок 2: ${playerScores[1]} очков`;
};

// Функция для обновления выделения текущего игрока
const highlightCurrentPlayer = () => {
    if (currentPlayer === 0) {
        player1ScoreEl.classList.add("active-player");
        player2ScoreEl.classList.remove("active-player");
    } else {
        player1ScoreEl.classList.remove("active-player");
        player2ScoreEl.classList.add("active-player");
    }
};

// Функция для обработки выбора игрока
selectPlayerButtons.forEach(button => {
    button.addEventListener("click", (event) => {
        // Получаем выбранного игрока (0 или 1)
        currentPlayer = parseInt(event.target.getAttribute("data-select-player"));
        gameInfo.textContent = `Вы выбрали Игрока ${currentPlayer + 1}. Начинаем игру!`;
        
        // Отключаем кнопки выбора игрока, активируем кнопку броска
        selectPlayerButtons.forEach(btn => btn.disabled = true);
        actionBtn.disabled = false;

        // Выделяем текущего игрока
        highlightCurrentPlayer();
    });
});

// Подсчёт очков за бросок
const calculateScore = (diceValues) => {
    let score = 0;
    let specialRoll = false;

    diceValues.forEach(value => {
        if (value === 3) score += 2;
        else if (value === 5) score += 4;
        else if (value === 1) score += 1;
    });

    // Проверка на льготный бросок (все кости одного четного числа)
    if (diceValues[0] === diceValues[1] && diceValues[1] === diceValues[2] && diceValues[0] % 2 === 0) {
        specialRoll = true;
    }

    return { score, specialRoll };
};

// Основной ход одного игрока
const playTurn = () => {
    const diceValues = [generateRandomNumber(), generateRandomNumber(), generateRandomNumber()];
    const { score, specialRoll } = calculateScore(diceValues);
    
    renderDice(diceValues);  // Отображаем текущий бросок
    playerScores[currentPlayer] += score;
    throwCount++;

    // Обновляем отображение очков игроков
    updateScoresDisplay();

    if (specialRoll) {
        hasSpecialRoll = true;
        gameInfo.textContent = `Игрок ${currentPlayer + 1} получил льготный бросок!`;
    } else {
        gameInfo.textContent = `Игрок ${currentPlayer + 1} набрал ${score} очков за этот бросок. Всего: ${playerScores[currentPlayer]} очков`;
    }

    // Проверка на завершение бросков или льготный бросок
    if (throwCount >= 3 && !hasSpecialRoll) {
        endTurn();  // Заканчиваем ход текущего игрока
    }
};

// Функция завершения хода
const endTurn = () => {
    throwCount = 0;
    hasSpecialRoll = false;
    currentPlayer = currentPlayer === 0 ? 1 : 0;  // Смена игрока

    if (currentPlayer === 0) {  // Переход к следующему раунду
        roundCount++;
    }

    // Обновляем выделение текущего игрока
    highlightCurrentPlayer();

    // Проверка на конец игры после 4 раундов
    if (roundCount >= 4) {
        const winner = playerScores[0] === playerScores[1] ? "НИЧЬЯ!" :
            (playerScores[0] > playerScores[1] ? "Победил игрок 1" : "Победил игрок 2");
        gameInfo.textContent = `Игра окончена! ${winner}`;
        actionBtn.disabled = true;  // Отключаем кнопку
        return;
    }

    gameInfo.textContent = `Ход игрока ${currentPlayer + 1}`;
};

// Обработчик кнопки "Играть"
actionBtn.addEventListener("click", () => {
    if (hasSpecialRoll) {
        // Льготный бросок не увеличивает счетчик бросков
        hasSpecialRoll = false;
        playTurn();
    } else {
        playTurn();
    }
});
