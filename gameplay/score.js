import { increaseLevel } from "./level.js";

export let score = 0;

let scoreElement;

updateScore(score);

function createScoreElement(){
    scoreElement = document.createElement("div");
    scoreElement.style.cssText = `
        font-family: Bebas;
        font-size: 70px;
        position: absolute;
        top: 50px;
        left: 50%;
        transform: translateX(-50%) translateY(200%);
        color: purple;
        user-select: none;
    `;
    document.body.appendChild(scoreElement);

}

function updateScore(s){
    if(!scoreElement){
        createScoreElement();
    }
    scoreElement.innerHTML = `Score: ${s}`;
}

export function addScore(){
    score++;
    updateScore(score);
    console.log("Score added!");
    increaseLevel();
}

export const sounds = {
    hit: new Audio('../assets/audio/smash.mp3'),
    miss: new Audio('../assets/audio/pop.mp3'),
    lose: new Audio('../assets/audio/fart.mp3')
};