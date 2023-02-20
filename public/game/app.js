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

document.body.appendChild(app.view)

