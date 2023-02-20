PIXI.settings.RESOLUTION = 5

PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST

const width = 640
const height = 480

let assets
const manCharacterSheet = {}
const animationSpeed = 0.2

const app = new PIXI.Application({
    width: width,
    height: height,
    backgroundColor: 0xFFFFFF,
})

async function loadAllAssets() {
    await PIXI.Assets.init({manifest: "./manifest.json"})
    assets = await PIXI.Assets.loadBundle("assets")
}

function cutSpriteSheets() {
    const manSprite = assets['man']
    const w = 32
    const h = 32

    const manIdle = [
        new PIXI.Texture(manSprite, new PIXI.Rectangle(w, 0, w, h))
    ]

    manCharacterSheet['idle'] = manIdle
}

function addPlayerToScene() {
    const character = new PIXI.AnimatedSprite(manCharacterSheet['idle'])
    character.anchor.set(0.5, 0)
    character.animationSpeed = animationSpeed
    character.loop = true
    character.play()
    app.stage.addChild(character)
}

function play() {
    // remove all children from body
    document.body.innerHTML = ''
    // add stage to body
    document.body.appendChild(app.view)

    // play bg ambience
    let sound = new Howl({
        src: ['./sounds/crickets.mp3'],
        loop: true,
    });
    sound.play()

    // load bedroom if we are the normal guy 
    loadBedroom()
}

function loadBedroom() {
    // load background
    const background = new PIXI.Sprite(assets['bedroom'])
    background.width = width
    background.height = height
    app.stage.addChild(background)

    // add player to scene
    addPlayerToScene()
}

function loadMainMenu() {
    const playButton = document.createElement('button')
    playButton.innerText = 'PLAY'

    playButton.style.border = 'none'
    playButton.style.background = 'none'
    playButton.style.color = 'white'
    playButton.style.fontSize = '50px'
    playButton.style.fontFamily = 'VT323'
    playButton.style.cursor = 'pointer'

    playButton.addEventListener('click', play)

    document.body.appendChild(playButton)
}

// this function runs on page load
async function setUpGame() {
    // load all of our assets before we do anything 
    await loadAllAssets()
    // cut up sprite sheets
    cutSpriteSheets()
    // set up our main menu
    loadMainMenu()
}

setUpGame()

