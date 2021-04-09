import * as PIXI from 'pixi.js'
import {TweenMax} from "gsap/TweenMax";
import pixi_app from '../base/pixi/app'
import {mapRange, backgroundSize, getWindowSize} from '../base/utils/helpers'
import appState from '../base/state.js';
import {analyser, dataArray } from '../base/audio/audioInit';

export default class PhotoJam extends PIXI.Sprite {
  constructor(texture, blendMode = 0, callback) {
    super();
    this.callback = callback;
    this.blendMode = blendMode;
    this.tex = texture;
    this.sprite_array = [];
    this.rotation_factor = 0.00005;
    this.rotation_factor_reverse = -0.0005;
    this.interactive = true;
    this.whitewash = new PIXI.Graphics();
    this.on('mousemove', this.handleMove)
    .on('touchmove', this.handleMove)
  }

  transitionOut(){
    this.callback();
    this.removeChildren()   
  }

  transitionIn() {
    console.log(this.tex.baseTexture.width)
    const whitewash = new PIXI.Graphics();
    whitewash.beginFill(0xffffff);
    whitewash.drawRect(0,0,pixi_app.renderer.width, pixi_app.renderer.height)
    whitewash.endFill();
    
    let sprite_size = backgroundSize(pixi_app.renderer.width, pixi_app.renderer.height, this.tex.baseTexture.width, this.tex.baseTexture.height)
   // const sprite = new PIXI.Sprite(this.tex);


    for (let index = 0; index < 6; index++) {
      const sprite = new PIXI.Sprite(this.tex);
    
      sprite.scale.x = sprite_size.scale;
      sprite.scale.y = sprite_size.scale;
      
      sprite.x = pixi_app.renderer.width / 2;
      sprite.y = pixi_app.renderer.height / 2 + (index * 10);
      
      sprite.anchor.x = 0.5;
      sprite.anchor.y = 0.5;
      sprite.alpha = 0.6;
      sprite.blendMode = this.blendMode;
      // if(index % 2 == 0) {
      //   sprite.scale.y = -sprite_size.scale;
      //   sprite.scale.x = -sprite_size.scale;
      // } 

      this.sprite_array.push(sprite)
      this.addChild(sprite);
    }
    
    this.sprite_array[0].blendMode = 0;
    //this.addChild(whitewash);
    whitewash.alpha = 0;
    pixi_app.ticker.add(() => {  
      if (appState.audioKicking) {
        analyser.getByteFrequencyData(dataArray); 
        //analyser.getByteTimeDomainData(dataArray); 

         
        for (let i = 0; i < this.sprite_array.length; i++) {

          const sprite = this.sprite_array[i];
          let r = mapRange(dataArray[(i * 5) + 3], 0, 255, sprite_size.scale * 0.95, sprite_size.scale * 1.5);
          TweenMax.to(sprite.scale, 1, {x:r, y:r});      
          sprite.rotation += this.rotation_factor * (i + 1);
          // if(i % 2 == 0) {
          //   sprite.rotation += this.rotation_factor_reverse * (i + 1);
          // } 
        }
      }      
    });
    window.addEventListener("resize",(e) => {
      const size = getWindowSize();
      const w = size.width;
      const h = size.height;
            
      console.log(this.tex.baseTexture.width, this.tex.baseTexture.height)
      sprite_size = backgroundSize(w, h, this.tex.baseTexture.width, this.tex.baseTexture.height)
      TweenMax.staggerTo(this.sprite_array, 0.1, {x: w / 2, y: h / 2}, -0.05);



      // this.width = w;
      // this.height = h;
  
   
      // for (let i = 0; i < this.sprite_array.length; i++) {
      //   const sprite = this.sprite_array[i];
      //   sprite.x = w / 2;
      //   sprite.y = h / 2 + (i * 10);        
      // }
      // this.x = pixi_app.renderer.width / 2;
      // this.y = pixi_app.renderer.height / 2;
    });
  }
  fadeToWhite(time) {
    TweenMax.to(whitewash, time, {alpha: 1})
  }
  handleMove(e) {
    var rotation_const = 0.0005;
    var move_const = 100;
    var x = e.data.global.x;
    var y = e.data.global.y;
  
    this.rotation_factor =  mapRange(x, 0, pixi_app.renderer.width, -rotation_const, rotation_const);
    this.rotation_factor_reverse =  mapRange(x, 0, pixi_app.renderer.width, rotation_const, -rotation_const);
    var moveFactorX = mapRange(x, 0, pixi_app.renderer.width, (pixi_app.renderer.width/2) - move_const, (pixi_app.renderer.width/2) + move_const)
    var moveFactorY = mapRange(y, 0, pixi_app.renderer.height, (pixi_app.renderer.height/2) - move_const, (pixi_app.renderer.height/2) + move_const)
    TweenMax.staggerTo(this.sprite_array, 10, {x: moveFactorX, y: moveFactorY}, -0.3);
  }
  
  handleClick(e) {
    // for (let i = 0; i < this.sprite_array.length; i++) {
    //   const sprite = this.sprite_array[i];
    //   setTimeout(() => {
    //     sprite.texture = (sprite.texture == resources.dp_1.texture) ? resources.dp_4.texture : resources.dp_1.texture;
    //   }, i * 60);
    // }
  }  
  resize() {

  }

}











