import { increaseLevel } from "./level.js";

export let score = 0;

let scoreElement;

updateScore(score);

function createScoreElement(){
    scoreElement = document.createElement("div");
    scoreElement.style.fontFamily = "Arial";
    scoreElement.style.fontSize = "50px";
    scoreElement.style.position = "absolute";
    scoreElement.style.top = "0";
    scoreElement.style.left = "0";
    scoreElement.style.color = "purple";
    scoreElement.style.margin = "50px";
    scoreElement.style.userSelect = "none";
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
    //console.log("Score added!");
    increaseLevel();
}

export const sounds = {
    hit: new Audio('../assets/smash.mp3'),
    miss: new Audio('../assets/pop.mp3'),
    lose: new Audio('../assets/fart.mp3')
};