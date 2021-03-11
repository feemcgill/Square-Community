import * as PIXI from 'pixi.js'

//Create the renderer
const pixi_app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor : 0xFFFFFF,
  // forceCanvas : true
});
export default pixi_app;

document.body.appendChild(pixi_app.view);
