import * as PIXI from 'pixi.js'

import { Linear, TweenMax } from 'gsap/TweenMax'

import pixi_app from './base/pixi/app'
import { debounce, getWindowSize, mapRange, backgroundSize } from './base/utils/helpers'
import { initAudio, audioContext, analyser, dataArray } from './base/audio/audioInit'
import { trackSource, playTrack } from './base/audio/playTrack.js'
import appState from './base/state.js'

import ShootinSkip from './scenes/shootin-skip.js'
import DawnPatrol from './scenes/dawn-patrol.js'
import Apparatus from './scenes/apparatus'
import DownOnAllFives from './scenes/down-on-all-fives.js'
import HitTheSheets from './scenes/hit-the-sheets.js'
import NewJersey from './scenes/new-jersey'
import WolfTickles from './scenes/wolf-tickles'
import SleepyHead from './scenes/sleepy-head'

import config from './config.js'
import Vizzies from './vibes/vizziesweep.js'

var currentScene = null
var currentTrack = null
var interface_timeout = null

var curtain = new PIXI.Graphics()
curtain.beginFill(0xffffff)
curtain.drawRect(pixi_app.renderer.width, pixi_app.renderer.height)

var stageContainer = new PIXI.Container()
var fgContainer = new PIXI.Container()
pixi_app.stage.addChild(stageContainer)
pixi_app.stage.addChild(fgContainer)

const vizzies = new Vizzies()
//fgContainer.addChild(vizzies);
vizzies.zIndex = 1000

function playScene(track) {
  console.log('playscene', track)
  //Clear the table
  if (!appState.audioInitiated) {
    initAudio()
    vizzies.init()
  }
  if (interface_timeout) {
    clearTimeout(interface_timeout)
  }
  if (currentScene) {
    currentScene.parent.alpha = 0
    currentScene.destroy()
    stageContainer.removeChildren()
    currentScene = null
  }
  stageContainer.removeChildren()
  appState.audioKicking = false

  // Find the scene
  switch (track) {
    case 0:
      currentScene = new ShootinSkip()
      break
    case 1:
      currentScene = new DawnPatrol()
      break
    case 2:
      currentScene = new Apparatus()
      break
    case 3:
      currentScene = new WolfTickles()
      break
    case 4:
      currentScene = new DownOnAllFives()
      break
    case 5:
      currentScene = new NewJersey()
      break
    case 6:
      console.log('not yet')
      break
    case 7:
      console.log('not yet')
      break
    case 8:
      currentScene = new SleepyHead()
      break
    case 9:
      currentScene = new HitTheSheets()
      break
  }

  // Play the scene
  stageContainer.addChild(currentScene)
  currentScene.parent.alpha = 0

  if (config.tracks[track].loaded) {
    currentScene.run()
  } else {
    currentScene.load()
    config.tracks[track].loaded = true
  }

  // Play the track
  playTrack(config.asset_url + '/' + config.tracks[track].mp3, endScene)
  TweenMax.to(currentScene.parent, 2.5, { alpha: 1 })

  currentTrack = track

  // Update dom interface
  document.getElementById('now-playing').innerHTML = config.tracks[track].name
  document.getElementById('nowplaying').classList.add('show')
  document.getElementById('interface').classList.remove('hide')
  interface_timeout = setTimeout(() => {
    document.getElementById('interface').classList.add('hide')
    interface_timeout = null
  }, 5000)

  console.log('----------------------------')
  console.log('----------------------------')
  console.log('----------------------------')
  console.log('----------------------------')
  console.log('--------PLAYSCENE(' + track + ')--------')
  console.log(track, currentScene, pixi_app, currentTrack)
  console.log('----------------------------')
  console.log('----------------------------')
  console.log('----------------------------')
  console.log('----------------------------')
}

function endScene() {
  if (!appState.userStopped) {
    TweenMax.to(currentScene.parent, 0.5, {
      alpha: 0,
      onComplete: function () {
        document.getElementById('now-playing').innerHTML = ''
        if (currentTrack + 1 == config.tracks.length) {
          playScene(0)
        } else {
          playScene(currentTrack + 1)
        }
      },
    })
  }
}

/** Dom Interface Stuff **/
var interface_button = document.getElementById('button')
interface_button.addEventListener('click', function (event) {
  document.getElementById('interface').classList.toggle('hide')
})

var tracklist_element = document.getElementById('tracklist')
tracklist_element.innerHTML = ''
for (let i = 0; i < config.tracks.length; i++) {
  const track = config.tracks[i]
  var a = document.createElement('a')
  var linkText = document.createTextNode(track.name)
  a.appendChild(linkText)
  a.href = '#'
  a.addEventListener('click', function (event) {
    playScene(i)
  })
  tracklist_element.appendChild(a)
}

/** RESIZE **/
window.addEventListener('resize', function (e) {
  const size = getWindowSize()
  const w = size.width
  const h = size.height

  // Scale renderer
  pixi_app.renderer.view.style.width = w + 'px'
  pixi_app.renderer.view.style.height = h + 'px'
  pixi_app.renderer.resize(w, h)
})

if (process.env.WORKING_ON) {
  console.log(process.env.WORKING_ON, typeof process.env.WORKING_ON)
  setTimeout(() => {
    playScene(parseInt(process.env.WORKING_ON))
    document.getElementById('interface').classList.add('hide')
  }, 100)
}
