import * as pc from "./node_modules/playcanvas";

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
        holeYellowAsset: new pc.Asset("hole_model", "model", { url: "../assets/models/hoop_teamYellow.gltf.glb"}),
        holeRedAsset: new pc.Asset("hole_model", "model", { url: "../assets/models/hoop_teamRed.gltf.glb"}),
        ballAsset: new pc.Asset("ball_model", "model", { url: "../assets/models/ball_teamYellow.gltf.glb"}),
        bombAsset: new pc.Asset("bomb_model", "model", { url: "../assets/models/bomb_teamRed.gltf.glb"}),
        specialBallAsset: new pc.Asset("bomb_model", "model", { url: "../assets/models/ball_teamBlue.gltf.glb"})
    }
    const assetListLoader = new pc.AssetListLoader(Object.values(assets), app.assets);
    const ballEntities = [];
    const bombEntities = [];
    const redHoleEntities = [];
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
            const holeEntity = new pc.Entity("YellowHole");
            app.root.addChild(holeEntity);
            holeEntity.addComponent("model", {
                type: "asset",
                asset: assets.holeYellowAsset
            });
            const scale = 0.2;
            holeEntity.setLocalScale(scale, scale, scale);
            holeEntity.setLocalPosition(holePosition[i].x, holePosition[i].y, holePosition[i].z);

            // Add red holes
            const redHole = new pc.Entity("RedHole");
            holeEntity.addChild(redHole);
            redHole.addComponent("model", {
                type: "asset",
                asset: assets.holeRedAsset
            });
            const scale2 = 1;
            redHole.setLocalScale(scale2, scale2, scale2);
            redHole.setLocalPosition(0, 0, 0);
            redHoleEntities.push(redHole);

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

        // console.log(poppedBalls);
        // console.log(cooldowns);

    }

    const startPosition = new pc.Vec3(0, 2, 0);
    const endPosition = new pc.Vec3(0, 3, 0);
    const duration = 100;
    let canHit = false;

    function animateUp(e){
        let elapsedUp = 0;
        const popUpInterval = setInterval(() => {
            elapsedUp += 16;
            const tUp = Math.min(elapsedUp/duration, 1);
            const upY = lerp(startPosition.y, endPosition.y, tUp);
            e.setLocalPosition(0, upY, 0);
            if(tUp >= 1){
                clearInterval(popUpInterval);
                return canHit = true;
            }
        }, 16);
    }

    const timeouts = [];
    function animateDown(e, index){
        let elapsedDown = 0;
        timeouts[index] = setTimeout(() => {
            const downInterval = setInterval(() => {
                elapsedDown += 16;
                const tDown = Math.min(elapsedDown/duration, 1);
                const downY = lerp(endPosition.y, startPosition.y, tDown);
                e.setLocalPosition(0, downY, 0);
                if(tDown >= 1){
                    clearInterval(downInterval);
                    poppedBalls.splice(poppedBalls.indexOf(index), 1);
                    setTimeout(() => {
                        cooldowns.delete(index);
                    }, 1000);
                }
            }, 16);
        }, 600);
    }

    function hitBall(e){
        window.addEventListener('keydown', (event) => {
            const holeIndex = keyMapping[event.key.toUpperCase()];
            if(holeIndex !== undefined && poppedBalls.includes(holeIndex) && canHit){
                console.log(`Ball at ${holeIndex} hit!`);
                window.location.href = "./gameplay/index.html";
            }
        });
    }

    function lerp(start, end, t){
        return start + (end - start) * t;
    }

    setInterval(popUpBall, 600);
    
}