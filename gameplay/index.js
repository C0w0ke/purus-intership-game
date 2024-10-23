import * as pc from "playcanvas";
import TWEEN from '@tweenjs/tween.js';
import { timer, addTimer, subTimer } from "./timer";
import { addScore } from "./score";
import { GameOver } from "./gameOver";
import { AmmoDebugDrawer } from "./debugDrawer.js";

window.onload = () => {

    // Setup application
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    
    const app = new pc.Application(canvas);
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);

    window.addEventListener("resize", () => app.resizeCanvas());

    app.start();

    // Setup a third person camera
    const cameraEntity = new pc.Entity("MainCamera");
    app.root.addChild(cameraEntity);
    cameraEntity.addComponent("camera", {
        clearColor: new pc.Color(200 / 255, 200 / 255, 245 / 255)
    });
    const cameraOffset = new pc.Vec3(0, 1, -3);
    cameraEntity.setPosition(cameraOffset);
    cameraEntity.setEulerAngles(-10, 180, 0);

    // Setup debug
    const renderer = new AmmoDebugDrawer({
        limit: {
            entity: cameraEntity,
            distance: 50
        }
    });
    renderer.enabled = true;

    // Add light
    const light = new pc.Entity("DirectionalLight");
    app.root.addChild(light);
    light.addComponent("light", {
        type: pc.LIGHTTYPE_DIRECTIONAL, // set the light type to directional, can try other light types: point, spot
        color: new pc.Color(1, 1, 1),   // color of the light: white
        intensity: 1                    // how strong the light is
    });
    light.setEulerAngles(-90, 0, 0);

    // Load assets
    const assets = {
        holeAsset: new pc.Asset("hole_model", "model", { url: "../assets/models/hoop_teamYellow.gltf.glb"}),
        ballAsset: new pc.Asset("ball_model", "model", { url: "../assets/models/ball_teamYellow.gltf.glb"})
    }
    const assetListLoader = new pc.AssetListLoader(Object.values(assets), app.assets);
    const ballEntities = [];
    assetListLoader.load(() => {

        // Create a plane
        const planeEntity = new pc.Entity("Plane");
        app.root.addChild(planeEntity);
        planeEntity.addComponent("model", { type: "plane" });
        planeEntity.setLocalScale(6, 1, 20);
        const matPlane = new pc.StandardMaterial();
        matPlane.emissive = new pc.Color(31 / 255, 43 / 255, 45 / 255);
        planeEntity.model.meshInstances[0].material = matPlane;
        matPlane.update();

        // Create holes
        const holePosition = [
            { x: 0, y: -0.57, z: 0 },
            { x: 0.8, y: -0.57, z: 0 },
            { x: -0.8, y: -0.57, z: 0 },
            { x: 0, y: -0.57, z: 1 },
            { x: 0.8, y: -0.57, z: -1 },
            { x: -0.8, y: -0.57, z: -1 },
            { x: 0, y: -0.57, z: -1 },
            { x: 0.8, y: -0.57, z: 1 },
            { x: -0.8, y: -0.57, z: 1 }
        ];
        
        for (let i = 0; i < holePosition.length; i++){
            const holeEntity = new pc.Entity("Hole");
            app.root.addChild(holeEntity);
            holeEntity.addComponent("model", {
                type: "asset",
                asset: assets.holeAsset
            });
            const scale = 0.2;
            holeEntity.setLocalScale(scale, scale, scale);
            holeEntity.setLocalPosition(holePosition[i].x, holePosition[i].y, holePosition[i].z);

            // Add balls
            const ballEntity = new pc.Entity("Ball");
            holeEntity.addChild(ballEntity);
            ballEntity.addComponent("model", {
                type: "asset",
                asset: assets.ballAsset
            });
            ballEntity.setLocalScale(0.7, 0.7, 0.7);
            ballEntity.setLocalPosition(0, 1, 0);
            ballEntities.push(ballEntity);

            ballEntity.addComponent("collision", {
                type: "sphere",
                radius: 0.35
            });
            ballEntity.addComponent("rigidbody", {
                type: "dynamic"
            });
        }
    });

    let poppedBalls = [];
    function popUpBall(){
        let random;
        let attempts = 0;
        const maxAttempts = ballEntities.length; 
        while(true){
            random = Math.floor(Math.random() * ballEntities.length);
            if(!poppedBalls.includes(random)){
                break;
            }
            attempts++;   
            if(attempts > maxAttempts){
                // console.error("Failed to find a free ball entity after", maxAttempts, "attempts.");
                return;
            }
        }

        const ballEntity = ballEntities[random];
        const ballPosition = ballEntity.getLocalPosition();
        poppedBalls.push(random);
        animate(ballEntity);

    }

    function animate(e){
        let currentY = e.getLocalPosition().y;
        let endY = 1.4;
        let isMovingUp = true;
        let hasReachedTarget = false;
        app.on("update", (dt) => {
            if(hasReachedTarget){
                setTimeout(() => {
                    hasReachedTarget = false;
                    isMovingUp = false;
                }, 2000);
                return;
            }

            const distanceToMove = 1 * dt;
            let newY;
            if(isMovingUp){
                newY = currentY + distanceToMove;
                if(newY >= endY){
                    newY = endY;
                    hasReachedTarget = true;
                }
            } else {
                newY = currentY - distanceToMove;
                if(newY <= 1){
                    newY = 1;
                    isMovingUp = true;
                    app.off("update", animate);
                }
            }
            e.translate(0, newY - currentY, 0);
            currentY = newY;
        });
    }

    let s = setInterval(() => {
        if(timer <= 0){
            app.timeScale = 0;
            GameOver();
            clearInterval(s);
        } else {
            popUpBall();
        }
    }, 450);
    
}
    
    // let poppedBalls = [];
    // const cooldowns = new Set();
    // function popUpBall(){
    //     let random;
    //     let attempts = 0;
    //     const maxAttempts = ballEntities.length;
    //     while(true){
    //         random = Math.floor(Math.random() * ballEntities.length);
    //         if(!poppedBalls.includes(random) && !cooldowns.has(random)){
    //             break;
    //         }
    //         attempts++;   
    //         if(attempts > maxAttempts){
    //             console.error("Failed to find a free ball entity after", maxAttempts, "attempts.");
    //             return;
    //         }
    //     }
    //     cooldowns.add(random);
    //     const ballEntity = ballEntities[random];
    //     poppedBalls.push(random);
    //     ballEntity.setLocalPosition(0, 3, 0);
    //     setTimeout(() => {
    //         ballEntity.setLocalPosition(0, 1, 0);
    //         poppedBalls.splice(poppedBalls.indexOf(random), 1);
    //         setTimeout(() => {
    //             cooldowns.delete(random);
    //         }, 1000);
    //     }, 2000);
    // }

    // setInterval(popUpBall, 450);



        // function popUpBall(){
        //     let random = Math.floor(Math.random() * ballEntities.length);
        //     const ballEntity = ballEntities[random];
        //     ballEntity.setLocalPosition(0, 3, 0);
        //     setTimeout(() => {
        //         ballEntity.setLocalPosition(0, 1, 0);
        //     }, 2000);
        // }
        // setInterval(popUpBall, 450);


        // let poppedBalls = [];
        // const cooldowns = new Set();
        // function popUpBall(){
        //     let random;
        //     let attempts = 0;
        //     const maxAttempts = ballEntities.length;
        //     while(true){
        //         random = Math.floor(Math.random() * ballEntities.length);
        //         if(!poppedBalls.includes(random) && !cooldowns.has(random)){
        //             break;
        //         }
        //         attempts++;   
        //         if(attempts > maxAttempts){
        //             console.error("Failed to find a free ball entity after", maxAttempts, "attempts.");
        //             return;
        //         }
        //     }
        //     cooldowns.add(random);
        //     const ballEntity = ballEntities[random];
        //     poppedBalls.push(random);

        //     let startY = ballEntity.getLocalPosition().y;
        //     let endY = 3;
        //     let duration = 400;
        //     let startTime = Date.now();

        //     function update(){
        //         let currentTime = Date.now();
        //         let progress = (currentTime - startTime) / duration;
        //         let newY = startY + (endY - startY) * progress;

        //         ballEntity.translateLocal(0, newY - ballEntity.getLocalPosition().y, 0);

        //         if(progress < 1){
        //             requestAnimationFrame(update);
        //         } else {
        //             setTimeout(() => {
        //                 startY = ballEntity.getLocalPosition().y;
        //                 endY = 1;
        //                 startTime = Date.now();
        //                 poppedBalls.splice(poppedBalls.indexOf(random), 1);  
        //                 setTimeout(() => {
        //                     cooldowns.delete(random);
        //                 }, 1000);
        //                 update();
        //             }, 2000);
        //         }

        //     }

        //     update();
        
        // }

        // setInterval(popUpBall, 450);




        // let poppedBalls = [];
        // function popUpBall(){
        //     let random;
        //     let attempts = 0;
        //     const maxAttempts = ballEntities.length; 
        //     while(true){
        //         random = Math.floor(Math.random() * ballEntities.length);
        //         if(!poppedBalls.includes(random)){
        //             break;
        //         }
        //         attempts++;   
        //         if(attempts > maxAttempts){
        //             // console.error("Failed to find a free ball entity after", maxAttempts, "attempts.");
        //             return;
        //         }
        //     }
    
        //     const ballEntity = ballEntities[random];
        //     poppedBalls.push(random);
        //     animate(ballEntity);
        //     console.log(poppedBalls);
        // }
    
        // function animate(e){
        //     let currentY = e.getLocalPosition().y;
        //     let endY = 1.4;
        //     let isMovingUp = true;
        //     let hasReachedTarget = false;
        //     app.on("update", (dt) => {
        //         if(hasReachedTarget){
        //             setTimeout(() => {
        //                 hasReachedTarget = false;
        //                 isMovingUp = false;
        //             }, 2000);
        //             return;
        //         }
    
        //         const distanceToMove = 1 * dt;
        //         let newY;
        //         if(isMovingUp){
        //             newY = currentY + distanceToMove;
        //             if(newY >= endY){
        //                 newY = endY;
        //                 hasReachedTarget = true;
        //             }
        //         } else {
        //             newY = currentY - distanceToMove;
        //             if(newY <= 1){
        //                 newY = 1;
        //                 isMovingUp = true;
        //                 app.off("update", popUpBall);
        //             }
        //         }
        //         e.translate(0, newY - currentY, 0);
        //         currentY = newY;
        //     });
        // }