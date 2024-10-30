import * as pc from "playcanvas";

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

            // Add balls
            const ballEntity = new pc.Entity("Ball");
            holeEntity.addChild(ballEntity);
            ballEntity.addComponent("model", {
                type: "asset",
                asset: assets.ballAsset
            });
            ballEntity.setLocalScale(0.7, 0.7, 0.7);
            ballEntity.setLocalPosition(0, 3, 0);
            ballEntities.push(ballEntity);
        }
    });
}