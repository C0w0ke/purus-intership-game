import { score } from "./score.js";

export let speed = 300;
export let duration = 1000;
export let bombChance = 0;
export let cd = 200;

// Create a message element
const messageElement = document.createElement("div");
messageElement.style.cssText = `
    font-family: Bebas;
    font-size: 60px;
    position: absolute;
    top: 50px;
    left: 50%;
    transform: translateX(-50%) translateY(350%);
    color: red;
    display: none;
    user-select: none;
`;
document.body.appendChild(messageElement);

function showMessage(text) {
    messageElement.textContent = text;
    messageElement.style.display = "block";
    setTimeout(() => {
        messageElement.style.display = "none";
    }, 1500);
}

export function increaseLevel(){
    if(score >= 10 && score < 30){
        speed = 300;
        duration = 1000;
        bombChance = 0.2;
        cd = 100;
        if(score == 10){
            showMessage("AVOID THE BOMB!!!");
        }
    }
    else if(score >= 30 && score < 50){
        speed = 200;
        duration = 1000;
        bombChance = 0.3;
        cd = 80;
        if(score == 30){
            showMessage("Score: 30! Keep Going!");
        }
    }
    else if(score >= 50){
        speed = 10;
        duration = 500;
        bombChance = 0.5;
        cd = 50;
        if(score == 50){
            showMessage("Score: 50! You're a Pro!");
        }
    }
    return { speed, duration, bombChance, cd };
}