PIXI.settings.RESOLUTION = 5

PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST

const width = 640
const height = 480

let assets
const manCharacterSheet = {}
const animationSpeed = 0.2
let player 
const playerScale = 4
const manSpeed = 3
const pressedKeys = []

const scenes = {
    'bedroom': {
        'background': 'bedroom',
    }
}

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

    const manWalking = [
        new PIXI.Texture(manSprite, new PIXI.Rectangle(0, 0, w, h)),
        new PIXI.Texture(manSprite, new PIXI.Rectangle(w, 0, w, h)),
        new PIXI.Texture(manSprite, new PIXI.Rectangle(w*2, 0, w, h)),
        new PIXI.Texture(manSprite, new PIXI.Rectangle(w*3, 0, w, h)),
    ]

    manCharacterSheet['walking'] = manWalking
}

function addPlayerToScene() {
    const character = new PIXI.AnimatedSprite(manCharacterSheet['idle'])
    character.anchor.set(0.5, 0)
    character.animationSpeed = animationSpeed
    character.loop = true
    character.play()

    // increase character size 
    character.scale.x = playerScale
    character.scale.y = playerScale

    player = character

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

    // start game loop
    app.ticker.add(update)

    // listen to events
    window.addEventListener('keydown', keysDown)
    window.addEventListener('keyup', keysUp)

    // load bedroom if we are the normal guy 
    loadScene('bedroom')
}

function loadScene(sceneName) {
    // remove all children from stage
    app.stage.removeChildren()

    // load background
    const background = new PIXI.Sprite(assets[scenes[sceneName]['background']])
    background.width = width
    background.height = height
    app.stage.addChild(background)

    // add player to scene
    addPlayerToScene()

    // add lighting
    const light = new PIXI.Sprite(assets['lighting'])
    light.width = width
    light.height = height
    app.stage.addChild(light)
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

function keysUp(e) {
    if (pressedKeys.length != 0) {
        pressedKeys.splice(pressedKeys.indexOf(e.keyCode), 1)
    }
}

function keysDown(e) {
    if (pressedKeys.includes(e.keyCode) == false) {
        pressedKeys.push(e.keyCode)
    }
}

function changeAnimationState(objectToChange, newState) {
    if (objectToChange.textures != newState) {
        objectToChange.textures = newState
        objectToChange.play()
    }
}

function move(deltaTime) {

    const getMovementVector = () => {
        let x = 0
        let y = 0

        if (pressedKeys.includes(87)) {
            y += 1
        } 
        if (pressedKeys.includes(83)) {
            y -= 1
        }
        if (pressedKeys.includes(65)) {
            x -= 1
        }
        if (pressedKeys.includes(68)) {
            x += 1
        }

        const length = Math.sqrt(x**2+y**2)
        //Then divide the x and y by the length.
        // we only wanna do this if x and y arent 0 
        if (x != 0) {
            x = x / length;
        }
        if (y != 0) {
            y = y / length;
        }

        return [x, y]
    }
    
    const [movementX, movementY] = getMovementVector()

    const doAnimations = () => {
        if (movementX == 0 && movementY == 0) {
            changeAnimationState(player, manCharacterSheet['idle'])
        } else {
            changeAnimationState(player, manCharacterSheet['walking'])
        }

        console.log(player.scale.x)
        if (movementX > 0) {
            player.scale.x = playerScale
        } else if (movementX < 0) {
            player.scale.x = -playerScale
        }
    }

    doAnimations()

    const doMoving = () => {
        const speed = manSpeed * deltaTime 

        if (pressedKeys.includes(87)) {
            player.y -= (speed * movementY)
        }

        if (pressedKeys.includes(83)) {
            player.y -= (speed * movementY)
        }

        if (pressedKeys.includes(65)) {
            player.x += (speed * movementX)
        }

        if (pressedKeys.includes(68)) {
            player.x += (speed * movementX)
        }
    }

    doMoving()
}

function update(deltaTime) {
    move(deltaTime)
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

