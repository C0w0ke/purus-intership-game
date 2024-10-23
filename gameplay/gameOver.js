export function GameOver(){
    const gameOver = document.createElement("div");
    gameOver.style.fontFamily = "Arial";
    gameOver.style.fontSize = "50px";
    gameOver.style.position = "absolute";
    gameOver.style.top = "0";
    gameOver.style.left = "0";
    gameOver.style.width = "100%";
    gameOver.style.height = "100%";
    gameOver.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    gameOver.style.color = "white";
    gameOver.style.display = "flex";
    gameOver.style.flexDirection = "column";
    gameOver.style.alignItems = "center";
    gameOver.style.justifyContent = "center";
    gameOver.style.userSelect = "none";
    gameOver.innerHTML = `
        <div>Game Over</div>
        <button id="retry-button">RETRY</button>
        <button id="home-button">EXIT</button>
        <style>
            #retry-button, #home-button {
                margin-top: 30px;
                font-size: 24px;
                padding: 10px 20px;
                border: none;
                border-radius: 10px;
                background-color: #c2c45a;
                color: #ffffff;
                cursor: pointer;
            }
            #retry-button:hover, #home-button:hover {
                background-color: #e5e755;
            }
        </style>
    `;
    document.body.appendChild(gameOver);
    document.getElementById("retry-button").addEventListener("click", () => {
        window.location.href = "index.html";
    });
    document.getElementById("home-button").addEventListener("click", () => {
        window.location.href = "./index.html";
    });
}