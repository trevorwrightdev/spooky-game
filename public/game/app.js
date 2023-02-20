PIXI.settings.RESOLUTION = 5

const width = 640
const height = 480

// var sound = new Howl({
//     src: ['./sounds/crickets.mp3'],
//     loop: true,
// });

// sound.play()

const app = new PIXI.Application({
    width: width,
    height: height,
    backgroundColor: 0xFFFFFF,
})

let assets
async function loadAllAssets() {
    await PIXI.Assets.init({manifest: "./manifest.json"})
    assets = await PIXI.Assets.loadBundle("assets")
}

// this function runs on start.
async function startGame() {
    
    // load all of our assets before we do anything 
    await loadAllAssets()
    document.body.appendChild(app.view)
}

startGame()

