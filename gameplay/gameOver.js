export function GameOver(finalScore){

    const previousScore = localStorage.getItem('highScore') || 0;
    let scoreMessage = `Final Score: ${finalScore}`;
    if(finalScore > previousScore){
        localStorage.setItem('highScore', finalScore);
        scoreMessage = `New High Score: ${finalScore}`;
    }

    const gameOver = document.createElement("div");
    gameOver.style.cssText = `
        font-family: Uni-sans;
        font-size: 85px;
        color: white;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        user-select: none;
    `;
    gameOver.innerHTML = `
        <div>Game Over</div>
        <div>${scoreMessage}</div>
        <button id="retry-button">RETRY</button>
        <button id="home-button">EXIT</button>
        <style>
            #retry-button, #home-button {
                font-family: Uni-sans-thin;
                margin-top: 30px;
                font-size: 24px;
                padding: 10px 20px;
                border: none;
                border-radius: 10px;
                background-color: #c2c45a;
                cursor: pointer;
            }
            #retry-button:hover, #home-button:hover {
                background-color: #e5e755;
            }
        </style>
    `;
    document.body.appendChild(gameOver);
    document.getElementById("retry-button").addEventListener("click", () => {
        window.location.href = "./index.html";
    });
    document.getElementById("home-button").addEventListener("click", () => {
        window.location.href = "../index.html";
    });
}