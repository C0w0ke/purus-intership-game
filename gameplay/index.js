import * as pc from "playcanvas";
import TWEEN from '@tweenjs/tween.js';
import { timer, addTimer, subTimer } from "./timer";
import { addScore, score } from "./score";
import { GameOver } from "./gameOver";
import { AmmoDebugDrawer } from "./debugDrawer.js";
import { random } from "playcanvas/build/playcanvas/src/core/math/random.js";

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
            ballEntity.setLocalPosition(0, 2, 0);
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

    const keyMapping = {
        'S': 0,
        'A': 1,
        'D': 2,
        'W': 3,
        'Z': 4,
        'C': 5,
        'X': 6,
        'Q': 7,
        'E': 8
    };

    let poppedBalls = [];
    const cooldowns = new Set();
    function popUpBall(){
        let random;
        let attempts = 0;
        const maxAttempts = ballEntities.length;
        while(true){
            random = Math.floor(Math.random() * ballEntities.length);
            if(!poppedBalls.includes(random) && !cooldowns.has(random)){
                break;
            }
            attempts++;   
            if(attempts > maxAttempts){
                //console.error("Failed to find a free ball entity after", maxAttempts, "attempts.");
                return;
            }
        }
        cooldowns.add(random);
        const ballEntity = ballEntities[random];
        poppedBalls.push(random);

        animateUp(ballEntity);
        hitBall(ballEntity);
        animateDown(ballEntity, random);

        console.log(poppedBalls);
        console.log(cooldowns);

    }

    function animateUp(e){
        const startPosition = new pc.Vec3(0, 2, 0);
        const endPosition = new pc.Vec3(0, 3, 0);
        const duration = 100;
        let elapsedUp = 0;
        const popUpInterval = setInterval(() => {
            elapsedUp += 16;
            const tUp = Math.min(elapsedUp/duration, 1);
            const upY = lerp(startPosition.y, endPosition.y, tUp);
            e.setLocalPosition(0, upY, 0);
            if(tUp >= 1){
                clearInterval(popUpInterval);
            }
        }, 16);
    }

    let t;
    function animateDown(e, index){
        const startPosition = new pc.Vec3(0, 2, 0);
        const endPosition = new pc.Vec3(0, 3, 0);
        const duration = 100;
        let elapsedDown = 0;
        t = setTimeout(() => {
            const downInterval = setInterval(() => {
                elapsedDown += 16;
                const tDown = Math.min(elapsedDown/duration, 1);
                const downY = lerp(endPosition.y, startPosition.y, tDown);
                e.setLocalPosition(0, downY, 0);
                if(tDown >= 1){
                    subTimer();
                    clearInterval(downInterval);
                    poppedBalls.splice(poppedBalls.indexOf(index), 1);
                    setTimeout(() => {
                        cooldowns.delete(index);
                    }, 1000);
                }
            }, 16);
        }, 2000);
    }

    function hitBall(e){
        window.addEventListener('keydown', (event) => {
            const holeIndex = keyMapping[event.key.toUpperCase()];
            if(holeIndex !== undefined && poppedBalls.includes(holeIndex)){
                e = ballEntities[holeIndex];
                e.setLocalPosition(0, 2, 0);
                addScore();
                poppedBalls.splice(poppedBalls.indexOf(holeIndex), 1);
                setTimeout(() => {
                    cooldowns.delete(holeIndex);
                }, 1000);
                console.log(`delete ${holeIndex}`);
                clearTimeout(t);
            }
        });
    }

    function lerp(start, end, t){
        return start + (end - start) * t;
    }

    let s = setInterval(() => {
        if(timer <= 0){
            app.destroy();
            GameOver(score);
            clearInterval(s);
        } else {
            popUpBall();
        }
    }, 450);
    
}