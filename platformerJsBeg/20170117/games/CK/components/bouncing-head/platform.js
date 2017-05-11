const PLATFORM_WIDTH = 160;
const PLATFORM_HEIGHT = 32;

/* Create and load assets */
var coinSprite = { 'sprites': { 'img/coinSprite.png': { tile: 30, tileh: 30, map: { coin_first: [0, 0], coin_last: [5, 0] } } } };
Crafty.load(coinSprite);

Crafty.c('Platform', {
  // These components will be added to any entity with the "Square" component before it is initialized
  required: '2D, DOM, Image, Collision',
  init: function () {
    this.w = PLATFORM_WIDTH;
    this.h = PLATFORM_HEIGHT;
    this.x = 0;
    this.y = 0;
    this.scaleWidth = 1;
  },
  setPlatform: function (x, y, scaleWidth) {
    this.x = x;
    this.y = y;
    this.z = 9;
    this.scaleWidth = scaleWidth;
    this.attr({ x: this.x, y: this.y, w: this.w * scaleWidth, h: this.h });
    this._addGravityCushion();
    return this;
  },
  setImage: function (img) {
    this.image(Crafty.assets[img].src);
    return this;
  },
  addCoin: function () {
    Crafty.audio.play('coin',1,1);
    updateScore(1);
    //console.log('numCoinsToCollect=', __STATE.numCoinsToCollect);
    __STATE.numCoinsToCollect--;
    if(__STATE.numCoinsToCollect === 0){
      Crafty.trigger(EVENT_LEVEL_COMPLETE);
    }
    this.destroy();
  },
  addCoins: function (shouldAddCoins) {
    //if (shouldAddCoins) {
    if (true) {
      var numCoins = 0;
      for (var i = 0; i < Crafty.math.randomInt(1, 1 * this.scaleWidth); i++) {
        Crafty.e('2D, DOM, coin_first, SpriteAnimation, Collision')
          .attr({x: this.x + (i * 32) - 1, y: this.y - 80, z: 10})
          .reel('spin', 300, [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]])
          .animate('spin', -1)
          .onHit('Player', this.addCoin);
        /* Add a coin to the total */
        numCoins++;
      }
      __STATE.numCoinsToCollect += numCoins;
    }
    return this;
  },
  addJumpy: function (shouldAddJumpy) {
    var that = this;
    if(shouldAddJumpy){
      var jumpy = Crafty.e('Jumpy, 2D, DOM, Color, Motion, SpriteAnimation, Collision')
        .attr({x:this.x+100, y:this.y-39, w:40, h:40})
        .color('#FF0000')
        .bind('Moved', function(){
          if(this.y < (that.y-200)){
            console.log('Jumpy reached top - changing direction...');
            this.vy = -this.vy;
          }
          else if(this.y >(that.y - 38)){
            console.log('Jumpy reached bottom - changing direction...');
            this.vy = -this.vy;
          }
        })
        .velocity().y = -120;

    }
  },

  /* Private methods */
  _addGravityCushion: function () {
    Crafty.e('PlatformCushion, FloorTile, 2D, DOM, Color')
      .attr({x: this.x + 20, y: this.y - 1, w: this.w - 40, h: 1})
      .color('#3BB9FF');
  }
});
