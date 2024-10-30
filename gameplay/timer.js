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
    timerElement.style.cssText = `
        font-family: Bebas;
        font-size: 70px;
        position: absolute;
        top: 50px;
        left: 50%;
        transform: translateX(-50%) translateY(100%);
        color: red;
        user-select: none;
    `;
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

export function stopTimer(){
    clearInterval(timerInterval);
}