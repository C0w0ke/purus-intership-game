export let timer = 30;

let timerInterval;
let timerElement;

updateTimer(timer);
timerInterval = setInterval(() => {
    timer--; 
    updateTimer(timer);
    // console.log(`Time left: ${timer} seconds`);
    if(timer <= 0){
        clearInterval(timerInterval);
    }
}, 1000);

function createTimerElement(){
    timerElement = document.createElement("div");
    timerElement.style.fontFamily = "Arial";
    timerElement.style.fontSize = "50px";
    timerElement.style.position = "absolute";
    timerElement.style.top = "0";
    timerElement.style.right = "0";
    timerElement.style.color = "red";
    timerElement.style.margin = "50px";
    timerElement.style.userSelect = "none";
    document.body.appendChild(timerElement);
}

function updateTimer(t){
    if(!timerElement){
        createTimerElement();
    }
    timerElement.innerHTML = `Timer: ${t}`;
}

export function addTimer(){
    timer++;
    updateTimer(timer);
}

export function subTimer(){
    if(timer > 1){
        timer--;
        updateTimer(timer);
    } else if(timer == 0){
        timer = 0;
        updateTimer(timer);
    } else {
        return;
    }
}