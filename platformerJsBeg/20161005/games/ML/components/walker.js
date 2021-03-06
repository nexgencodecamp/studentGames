// Define a sprite-map component
var walkerSprite = { 'sprites': { 'img/006.png': { tile: 64, tileh: 64, map: { walker_first: [0, 1] } } } };
var fire_blastSprite = { 'sprites': { 'img/fireBlast.png': { tile: 195, tileh: 198, map: { fire_left: [0, 0]} } } };
Crafty.load(walkerSprite);
Crafty.load(fire_blastSprite);

Crafty.c('Walker', {
  // These components will be added to any entity with the "Square" component before it is initialized
  required: '2D, DOM, walker_first, SpriteAnimation, Gravity, Collision, Motion, Tween',
  init: function (obj) {
    this.z = 8;
    var entryPos = Crafty.math.randomInt(1,3);
    if(entryPos === 1){
        this.x = Crafty.viewport._width - Crafty.viewport._x;
        this.y = 504;
    }
    if(entryPos === 2){
        this.x = Crafty.viewport._width - Crafty.viewport._x;
        this.y = -50;
    }
    if(entryPos === 3){
        this.x = -Crafty.viewport._x - 40;
        this.y = 504;
    }
    this.reel('walkLeft', 600, [[0, 1], [1, 1], [2, 1], [3, 1]]);
    this.reel('walkRight', 600, [[0, 2], [1, 2], [2, 2], [3, 2]]);
    this.reel('walkFall', 600, [[0, 1], [1, 1], [2, 1], [3, 1]]);
    this.reel('dieLeft', 100, [[3, 0]]);
    this.reel('dieRight', 100, [[3, 1]]);
    this.reel('dieFall', 100, [[3, 2]]);
    if(entryPos === 1){
        this.animate('walkLeft', -1);
        this.velocity().x = WALKER_VELOCITY;
    }
    else if(entryPos === 2){
        /* Find a drop point */
        var lowX = Crafty.viewport._width + Crafty.viewport._x;
        var highX = Crafty.viewport._width + Crafty.viewport._x + 800;
        var dropX = Crafty.math.randomInt(lowX, highX);

        /* Walk towards the player */
        if(dropX > _player.x){
          this.animate('walkFall', -1);
          this.velocity().x = -WALKER_VELOCITY;
        }
        else{
          this.animate('walkFall', -1);
          this.velocity().x = WALKER_VELOCITY;
        }
    }
    else if(entryPos === 3){
        this.animate('walkRight', -1);
        this.velocity().x = -WALKER_VELOCITY;
    }
    this.gravity('FloorTile');
    this.onHit('Bullet', function(){
        Crafty.audio.play('kill',1,1); 
      pauseAndResetAnimation(this);
      var replacementReel = this.getReel().id.replace ('walk', 'die');
      this.animate(replacementReel, 1);
      this.velocity().x = 0;
      this.tween({alpha: 0}, 750);
      this.bind('TweenEnd', function(){
        this.destroy();
      })
    })
    this.onHit('Player', function(hitData) {
      var playerObj = hitData[0].obj;
      if(playerObj.isJumping){
        Crafty.audio.play('kill',1,1);
        if(this.velocity().x !== 0){
          pauseAndResetAnimation(this);
          var replacementReel = this.getReel().id.replace ('walk', 'die');
          this.animate(replacementReel, 1);
          this.velocity().x = 0;
          this.tween({alpha: 0}, 750);
          this.bind('TweenEnd', function(){
            this.destroy();
          })
          Crafty.trigger(EVENT_PLAYER_HIT_WALKER);
            Crafty.audio.play('kill',1,1);
        }
      }
      else{
        /* We need to check this is a genuine collision */
        if(this.getReel().id.match(/dieLeft|dieRight|dieFall/) !== null) return;
        this.velocity().x = 0;
        //this.x += 5;
        pauseAndResetAnimation(this);
        this.reelPosition(1);
        Crafty.trigger(EVENT_PLAYER_DIE);
      }
    });
    this.bind('EnterFrame', function(){
      if(this.y > 700){
        this.destroy();
      }
      if(Math.ceil(Math.random() * 300) == 5)
      {
        console.log("dew")
        var bulletX = this.x-50;
        var bulletY = this.y-50;
        Crafty.audio.play('shoot',1,1);
          if(this.velocity().x > 0){
            Crafty.e("eBullet, DOM, 2D, fire_left, Collision, Tween")
              .attr({x: bulletX, y: bulletY})
              //.color("#FF0000")
              //.image('img/shadowball.png')
              .tween({x: this.x + 3000}, 15000)
              .bind("EnterFrame", function(){
                if(this.x > 3000){
                  this.destroy()
                }
              })
              .onHit('Player', function(hitData){
                // Kill robot
                //hitData[0].destroy();
                // Kill bullet
                this.destroy();
              })
            }
            else{
              Crafty.e("eBullet, DOM, 2D, fire_left, Collision, Tween")
                .attr({x: bulletX, y: bulletY})
                //.color("#FF0000")
                //.image('img/shadowball.png')
                .tween({x: this.x - 3000}, 15000)
                .bind("EnterFrame", function(){
                  if(this.x < -50){
                    this.destroy()
                  }
                })
                .onHit('Player', function(hitData){

                  // Kill robot
                  //hitData[0].destroy();
                  // Kill bullet
                  this.destroy();
                })
            }
      }
    })
  }
});
