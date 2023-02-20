PIXI.settings.RESOLUTION = 5

PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST

const width = 854
const height = 480

let assets
let currentScene = ''
const manCharacterSheet = {}
let player 
let tutorialText
const pressedKeys = []

// * CONFIGURATION ------------>
const animationSpeed = 0.2
const playerScale = 4
const manSpeed = 3.2
const horizontalPadding = 30
const topPadding = 30
const doorZoneWidth = 60
const doorZoneHeight = 100
const doorTutorialText = 'Press E to enter'
const showAllColliders = false
const showInteractables = false
// * -------------------------->

// define footstep sound
const footstepSound = new Howl({
    src: ['./sounds/footsteps.mp3'],
    loop: true,
    volume: 1.5,
})

const scenes = {
    bedroom: {
        background: 'bedroom',
        spawnPoints: [
            {x: 236, y: 250},
        ],
        colliders: [
            {x: 0, y: 0, width: 190, height: 350},
            {x: 0, y: 0, width: 850, height: 110},
        ],
        doors: [
            {x: 790, y: 240, scene: 'hallway', spawnPointIndex: 0},
        ]
    }
}

const borderColliders = [
    {x: 0, y: 0, width: 7, height: 480},
    {x: 0, y: 473, width: 854, height: 7},
    {x: 847, y: 0, width: 7, height: 480},
    {x: 0, y: 0, width: 854, height: 7},
]

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
    character.anchor.set(0.5, 1)
    character.animationSpeed = animationSpeed
    character.loop = true
    character.play()

    // increase character size 
    character.scale.x = playerScale
    character.scale.y = playerScale

    player = character

    app.stage.addChild(character)
}

function addTutorialText() {
    const text = new PIXI.Text('', {
        fontFamily : 'VT323', 
        fontSize: 32, 
        fill : 0xFFFFFF, 
    })

    text.x = 30
    text.y = 30
    tutorialText = text
    app.stage.addChild(text)
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
        volume: 0.5,
    });
    sound.play()

    // start game loop
    app.ticker.add(update)

    // listen to events
    window.addEventListener('keydown', keysDown)
    window.addEventListener('keyup', keysUp)

    // load bedroom if we are the normal guy 
    loadScene('bedroom', 0)
}

function loadScene(sceneName, spawnPointIndex) {
    // remove all children from stage
    app.stage.removeChildren()

    // load background
    const background = new PIXI.Sprite(assets[scenes[sceneName]['background']])
    background.width = width
    background.height = height
    app.stage.addChild(background)

    // draw colliders 
    if (showAllColliders == true) {
        const allColliders = [...scenes[sceneName]['colliders'], ...borderColliders]

        for (let col of allColliders) {
            const collider = new PIXI.Graphics()
            collider.beginFill(0x00FF00)
            collider.alpha = 0.5
            collider.drawRect(col.x, col.y, col.width, col.height)
            collider.endFill()
            app.stage.addChild(collider)
        }
    }

    // draw interactables
    if (showInteractables == true) {
        for (let door of scenes[sceneName]['doors']) {
            const collider = new PIXI.Graphics()
            collider.beginFill(0x0000FF)
            collider.alpha = 0.5
            collider.drawRect(door.x, door.y, doorZoneWidth, doorZoneHeight)
            collider.endFill()
            app.stage.addChild(collider)
        }
    }

    // add player to scene
    addPlayerToScene()
    const spawnPoint = scenes[sceneName]['spawnPoints'][spawnPointIndex]
    player.x = spawnPoint.x
    player.y = spawnPoint.y

    // add lighting
    const light = new PIXI.Sprite(assets['lighting'])
    light.width = width
    light.height = height
    app.stage.addChild(light)

    // add tutorial text
    addTutorialText()

    currentScene = sceneName
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

    const doAnimations = () => {
        if (movementX == 0 && movementY == 0) {
            changeAnimationState(player, manCharacterSheet['idle'])
        } else {
            changeAnimationState(player, manCharacterSheet['walking'])
        }

        if (movementX > 0) {
            player.scale.x = playerScale
        } else if (movementX < 0) {
            player.scale.x = -playerScale
        }
    }

    const doMoving = (x, y) => {
        const speed = manSpeed * deltaTime 
        const newPosition = {
            x: player.x,
            y: player.y,
        }

        if (pressedKeys.includes(87)) {
            newPosition.y -= (speed * y)
        }

        if (pressedKeys.includes(83)) {
            newPosition.y -= (speed * y)
        }

        if (pressedKeys.includes(65)) {
            newPosition.x += (speed * x)
        }

        if (pressedKeys.includes(68)) {
            newPosition.x += (speed * x)
        }

        // check if we are colliding with any colliders
        const allColliders = [...scenes[currentScene]['colliders'], ...borderColliders]

        for (let col of allColliders) {
            const xMin = col.x
            const xMax = col.x + col.width
            const yMin = col.y
            const yMax = col.y + col.height

            if (
                (newPosition.x > (xMin - horizontalPadding) && newPosition.x < (xMax + horizontalPadding)) &&
                (newPosition.y > yMin && newPosition.y < (yMax + topPadding))
            ) {
                return
            }
        }

        player.x = newPosition.x
        player.y = newPosition.y
    }

    const playFootsteps = (x, y) => {
        if (movementX != 0 || movementY != 0) {
            if (footstepSound.playing() == false) {
                footstepSound.play()
            }
        } else {
            footstepSound.stop()
        }
    }
    
    const [movementX, movementY] = getMovementVector()
    playFootsteps()
    doAnimations()
    doMoving(movementX, movementY)
}

function checkForInteractables() {
    const playerX = player.x
    const playerY = player.y

    for (let door of scenes[currentScene]['doors']) {
        const xMin = door.x
        const xMax = door.x + doorZoneWidth
        const yMin = door.y
        const yMax = door.y + doorZoneHeight

        if (
            (playerX > xMin && playerX < xMax) &&
            (playerY > yMin && playerY < yMax)
        ) {
            tutorialText.text = doorTutorialText
            // if e is pressed
            if (pressedKeys.includes(69)) {
                loadScene(door.scene, door.spawnPointIndex)
            }

            return 
        }
    }

    tutorialText.text = ''
}

function update(deltaTime) {
    move(deltaTime)
    checkForInteractables()
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

