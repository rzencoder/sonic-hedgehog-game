// =============================================================================
// Sprites
// =============================================================================

//Hero

function Hero(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'hero');
    this.invincible = false;
    this.hurt = false;    
    this.anchor.set(0.5, 0.5);
    // physics properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    // animations
    this.animations.add('stop', [0]);
    this.animations.add('run-right', [1, 2], 8, true);
    this.animations.add('run-left', [1, 2], 8, true);
    this.animations.add('jump', [4, 5, 6, 7], 12, true);
    this.animations.add('die', [8]);
    this.animations.add('hurt', [9]);// 12fps no loop
    this.animations.play('stop');
}

// inherit from Phaser.Sprite
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.move = function (direction) {
    // guard
    if (this.isFrozen) { return; }   
    if(this.hurt){
       if(this.body.velocity.x > 0){
            this.body.velocity.x = 100;
            this.body.velocity.y = -100;
       } 
       else {
            this.body.velocity.x = -100;
            this.body.velocity.y = -100;
       }              
    }
    this.body.velocity.x = direction * 200;
    // update image flipping & animations
    if (this.body.velocity.x < 0) {
        this.scale.x = -1;
    }
    else if (this.body.velocity.x > 0) {
        this.scale.x = 1;
    }
};

Hero.prototype.jump = function (springSpeed) {
    let canJump = this.body.touching.down && this.alive && !this.isFrozen && !this.hurt;
    const JUMP_SPEED = 550;
    if (canJump || this.isBoosting) {
        this.body.velocity.y = -springSpeed || -JUMP_SPEED;
        this.isBoosting = true;
    }
    return canJump;
};

Hero.prototype.stopJumpBoost = function () {
    this.isBoosting = false;
};

Hero.prototype.bounce = function () {
    this.body.velocity.y = -200;
};

Hero.prototype.injure = function () {
    this.invincible = true;
    this.hurt = true;
    setTimeout(()=>{
        this.hurt = false;        
    }, 500)
    setTimeout(()=>{
        this.invincible = false;
    }, 2000)
};

Hero.prototype.update = function () {
    // update sprite animation, if it needs changing
    let animationName = this._getAnimationName();
    if (this.animations.name !== animationName) {
        this.animations.play(animationName);
    }
};

Hero.prototype.freeze = function () {
    this.body.enable = false;
    this.isFrozen = true;
};

Hero.prototype.die = function () {
    this.alive = false;
    this.body.enable = false;
    this.animations.play('die').onComplete.addOnce(()=>{ setTimeout(()=>{this.kill()}, 750) });
};

Hero.prototype._getAnimationName = function () {
    let name = 'stop'; // default animation
    if (!this.alive) {
        name = 'die';
    }
    else if (this.isFrozen) {
        name = 'stop';
    }
    else if(this.hurt){
        name = 'hurt';
    }
    else if (this.body.velocity.y < 0 || this.body.velocity.y > 0) {
        name = 'jump';
    }
    else if (this.body.velocity.x > 0 && this.body.touching.down) {
        name = 'run-right';
    }
    else if (this.body.velocity.x < 0 && this.body.touching.down) {
        name = 'run-left';
    }   
    return name;
};

//Enemy

function Enemy(game, x, y, image, gravity) {
    Phaser.Sprite.call(this, game, x, y, image);
    this.anchor.set(0.5);
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.allowGravity = gravity;
    this.body.velocity.x = 100;
    //animations
    this.animations.add('move', [0, 1, 2], 8, true);
    this.animations.add('die', [3,3], 6);
    this.animations.play('move');
}

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;
Enemy.prototype.update = function () {
    // check against walls and reverse direction if necessary
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -100; // turn left
        this.scale.x = -1;
    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = 100; // turn right
        this.scale.x = 1;
    }    
};

Enemy.prototype.die = function () {
    this.body.enable = false;
    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};

//Moving Block
function Block(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'block');
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;   
    this.body.allowGravity = false;
    this.body.immovable = true;
    this.body.velocity.x = 100;
}

Block.prototype = Object.create(Phaser.Sprite.prototype);
Block.prototype.constructor = Block;
Block.prototype.update = function () {
    // check against walls and reverse direction if necessary
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -100; // turn left
    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = 100; // turn right
    }
};

//Fireball
function Fireball(game, x, y, height, velocity) {
    Phaser.Sprite.call(this, game, x, y, 'fireball');
    this.anchor.set(0.5);   
    this.maxHeight = y;
    this.minHeight = y - height;
    this.startVelocity = velocity;
    this.game.physics.enable(this);
    this.body.allowGravity = false;
    this.body.immovable = true;
    this.body.collideWorldBounds = true;
    this.body.velocity.y = velocity;
    //animations
    this.animations.add('fire', [0]);
    this.animations.play('fire');
}

Fireball.prototype = Object.create(Phaser.Sprite.prototype);
Fireball.prototype.constructor = Fireball;
Fireball.prototype.update = function () {
    if (this.y < this.minHeight ) {
         this.body.velocity.y = Math.abs(this.startVelocity);
         this.scale.y = -1;       
    }
    else if (this.y > this.maxHeight) {      
        this.body.velocity.y = -this.startVelocity;
        this.scale.y = 1;   
    }
};

//Spike

function Spike(game, x, y, image) {
    Phaser.Sprite.call(this, game, x, y, image);
    this.anchor.set(0.5);
    this.spikeUp = true;
    this.game.physics.enable(this);
    this.body.allowGravity = false;
    this.body.immovable = true;
    this.game.time.events.loop(1500, updateSpike, this);
}

Spike.prototype = Object.create(Phaser.Sprite.prototype);
Spike.prototype.constructor = Spike;

function updateSpike(){
  if(this.spikeUp){
      this.position.y -= 30; 
      this.spikeUp = false;
  } 
  else {
      this.position.y += 30; 
      this.spikeUp = true;
  }    
}

// =============================================================================
// Loading state
// =============================================================================

let LoadingState = {};

LoadingState.init = function () {
    // keep crispy-looking pixels
    this.game.renderer.renderSession.roundPixels = true;
};

LoadingState.preload = function () {
    //json
    this.game.load.json('level:0', 'data/level00.json');
    this.game.load.json('level:1', 'data/level01.json');
    this.game.load.json('level:2', 'data/level02.json');
    //images
    this.game.load.image('font:numbers', 'images/numbers.png');
    this.game.load.image('font:letters', 'images/letters.png');
    this.game.load.image('background', 'images/background.png');
    this.game.load.image('invisible-wall', 'images/invisible_wall.png');
    this.game.load.image('stone:16x1', 'images/stone16x1.png');
    this.game.load.image('stone:8x1', 'images/stone8x1.png');
    this.game.load.image('stone:4x1', 'images/stone4x1.png');
    this.game.load.image('stone:2x1', 'images/stone2x1.png');
    this.game.load.image('stone:1x1', 'images/stone1x1.png');  
    this.game.load.image('block', 'images/block.png');
    this.game.load.image('finish-static', 'images/finish-static.png');
    this.game.load.image('spike', 'images/spike1.png');
    this.game.load.image('spike3', 'images/spike3.png'); 
    this.game.load.image('fireball', 'images/fireball.png', 15, 32);
    //animations
    this.game.load.spritesheet('hero', 'images/hero.png', 32, 42);  
    this.game.load.spritesheet('bug', 'images/bug.png', 40, 30);
    this.game.load.spritesheet('bat', 'images/bat.png', 30, 30);
    this.game.load.spritesheet('ring', 'images/ring.png', 16, 16);
    this.game.load.spritesheet('finish', 'images/finish.png', 45, 64);
    this.game.load.spritesheet('spring', 'images/spring.png', 28, 16);
    this.game.load.spritesheet('lava', 'images/lava.png', 42, 42);
    
    //audio
    this.game.load.audio('sfx:jump', 'audio/jump.wav');
    this.game.load.audio('sfx:spring', 'audio/spring.wav');
    this.game.load.audio('sfx:ring', 'audio/ring.wav');
    this.game.load.audio('sfx:pop', 'audio/pop.wav');
    this.game.load.audio('sfx:finish', 'audio/finish.wav');
    this.game.load.audio('sfx:dead', 'audio/dead.wav');
    this.game.load.audio('bgm', 'audio/bck.mp3');
    this.game.load.audio('sfx:hurt', 'audio/hurt.wav');
};

LoadingState.create = function () {
    this.game.state.start('play', true, false, {level: 0});
};

// =============================================================================
// Play state
// =============================================================================

let PlayState = {};
const LEVEL_COUNT = 3;

PlayState.init = function (data) {
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP
    });
    this.ringCount = 0;
    this.score = 0;
    this.level = (data.level || 0) % LEVEL_COUNT;
    this.timeCount = 0;
    this.bgm = this.game.add.audio('bgm');
    this.bgm.loopFull();
};

PlayState.create = function () {
    // fade in (from black)
    this.camera.flash('#000000');
    // create sound entities
    this.sfx = {
        jump: this.game.add.audio('sfx:jump'),
        spring: this.game.add.audio('sfx:spring'),
        ring: this.game.add.audio('sfx:ring'),
        pop: this.game.add.audio('sfx:pop'),
        finish: this.game.add.audio('sfx:finish'),
        hurt: this.game.add.audio('sfx:hurt'),
        dead: this.game.add.audio('sfx:dead')
    };
    
    // create level entities and decoration
    this.game.add.image(0, 0, 'background');
    this._loadLevel(this.game.cache.getJSON(`level:${this.level}`));
    //Start time
    this.game.time.events.loop(Phaser.Timer.SECOND, this._updateTime, this);
    // create UI score boards
    this._createHud();
};

PlayState._updateTime = function (){
    this.timeCount++;
}

PlayState._formatTime = function (){
   let mins = Math.floor(this.timeCount / 60); 
   let secs = this.timeCount % 60;
   if(secs < 10){
       secs = '0' + secs;
   }
   let formatted = mins + ':' + secs;
   return formatted
}

PlayState.update = function () {
    this._handleCollisions();
    this._handleInput();
    // update scoreboards
    this.scoreNumber.text = `${this.score}`;
    this.ringNumber.text = `${this.ringCount}`; 
    this.timeNumber.text = `${this._formatTime()}`;
};

PlayState.shutdown = function () {
    this.bgm.stop();
};

PlayState._handleCollisions = function () {
    this.game.physics.arcade.collide(this.enemies, this.platforms);
    this.game.physics.arcade.collide(this.enemies, this.enemyWalls);
    this.game.physics.arcade.collide(this.hero, this.platforms);
    this.game.physics.arcade.collide(this.hero, this.movingBlocks);   
    this.game.physics.arcade.collide(this.movingBlocks, this.platforms);
    this.game.physics.arcade.collide(this.movingBlocks, this.movingBlocks);
        
    // collision: hero vs enemies (kill or die)
    this.game.physics.arcade.overlap(this.hero, this.enemies,
        this._onHeroVsEnemy, null, this);
    // collision: lava
    this.game.physics.arcade.collide(this.hero, this.lava,
        this._handleDamage, null, this);
    // collision: spring
    this.game.physics.arcade.overlap(this.hero, this.spring,
        this._onHeroVsSpring, null, this);   
    // collision: fireball
    this.game.physics.arcade.overlap(this.hero, this.fireball,
        this._handleDamage, null, this);
    //collision: spikes
    this.game.physics.arcade.overlap(this.hero, this.spike,
        this._handleDamage, null, this);
    //collision: rings
    this.game.physics.arcade.overlap(this.hero, this.rings, this._onHeroVsRing,
        null, this);
    // collision: finish
    this.game.physics.arcade.overlap(this.hero, this.finish, this._onHeroVsFinish,
        // ignore if there is no key or the player is on air
       function (hero, finish) { return hero.body.touching.down }, this);
};

PlayState._handleInput = function () {
    if (this.keys.left.isDown) { // move hero left
        this.hero.move(-1);
    }
    else if (this.keys.right.isDown) { // move hero right
        this.hero.move(1);
    }
    else { // stop
        this.hero.move(0);
    }
    // handle jump
    if (this.keys.up.downDuration(200)) {
        let didJump = this.hero.jump();
        didJump ? this.sfx.jump.play() : this.hero.stopJumpBoost();
    }
};

PlayState._onHeroVsRing = function (hero, ring) {
    this.sfx.ring.play();
    ring.kill();
    this.ringCount++;
};

PlayState._handleDamage = function (hero) {
    if(this.ringCount === 0 && !hero.invincible){
        hero.die();
        this.sfx.dead.play();
        hero.events.onKilled.addOnce( () => {
            this.game.state.restart(true, false, {level: this.level})});
    }
    else if(hero.invincible){
        return;
    }
    else {
        this.ringCount = 0;
        hero.injure();
        this.sfx.hurt.play();
    }
};

PlayState._onHeroVsEnemy = function (hero, enemy) {
    // the hero can kill enemies when is falling (after a jump, or a fall)
    if (hero.body.velocity.y !== 0) {
        enemy.die();
        hero.bounce();
        this.sfx.pop.play();
        this.score += 100;
    }
    else { 
        this._handleDamage(hero);
        // NOTE: bug in phaser in which it modifies 'touching' when
        // checking for overlaps. This undoes that change so enemies don't
        // 'bounce' agains the hero
        enemy.body.touching = enemy.body.wasTouching;
    }
};

PlayState._onHeroVsSpring = function (hero, spring) {
    if (hero.body.velocity.y > 0) {
        spring.animations.play('jump');
        let didJump = this.hero.jump(900);
        if (didJump) { this.sfx.spring.play(); }
    }   
};

PlayState._onHeroVsFinish = function (hero, finish) {
    this.sfx.finish.play();
    finish.animations.play('open');
    // play animation and change to the next level when it ends
    hero.freeze();
    this.game.add.tween(hero)
        .to({x: 940, alpha: 0}, 500, null, true)
        .onComplete.addOnce(this._goToNextLevel, this);
};

PlayState._goToNextLevel = function () {
    this.camera.fade('#000000');
    this.camera.onFadeComplete.addOnce(function () {
        // change to next level
        this.game.state.restart(true, false, {
            level: this.level + 1,
            score: this.score + 1000
        });
    }, this);
};

PlayState._loadLevel = function (data) {
    // create all the groups/layers that we need
    this.bgDecoration = this.game.add.group();
    this.rings = this.game.add.group();
    this.enemies = this.game.add.group();
    this.enemyWalls = this.game.add.group();
    this.enemyWalls.visible = false;
    this.movingBlocks = this.game.add.group();
    this.fireball = this.game.add.group();
    this.lava = this.game.add.group();
    this.spring = this.game.add.group(); 
    this.spike = this.game.add.group();
    this.platforms = this.game.add.group();
    this.finish = this.game.add.group();
    // spawn
    this._spawnCharacters({hero: data.hero, enemies: data.enemies});
    data.platforms.forEach(this._spawnPlatform, this);
    data.movingBlocks.forEach(this._spawnMovingBlocks, this);
    data.lava.forEach(this._spawnLava, this);
    data.spring.forEach(this._spawnSpring, this);
    data.rings.forEach(this._spawnRings, this);
    this._spawnSpike({spike: data.spike});
    this._spawnFireball({fireball: data.fireball}); 
    this._spawnFinish({finish: data.finish});
    data.decoration.forEach(function (deco) {
        this.bgDecoration.add(
            this.game.add.image(deco.x, deco.y, 'decoration', deco.frame));
    }, this);
    
    // enable gravity
    this.game.physics.arcade.gravity.y = 1200;
};

PlayState._spawnCharacters = function (data) {
    // spawn enemies
    data.enemies.forEach(function (enemy) {
        let sprite = new Enemy(this.game, enemy.x, enemy.y, enemy.image, enemy.gravity);
        this.enemies.add(sprite);
    }, this);
    // spawn hero
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);
};

PlayState._spawnPlatform = function (platform) {
    let sprite = this.platforms.create( platform.x, platform.y, platform.image);
    // physics for platform sprites
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;     
    // spawn invisible walls at each side, only detectable by enemies
    this._spawnEnemyWall(platform.x, platform.y, 'left');
    this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
};

PlayState._spawnMovingBlocks = function (block) {
    let sprite = new Block(this.game, block.x, block.y)
    this.movingBlocks.add(sprite);
};

PlayState._spawnLava = function (lava) {
    let sprite = this.lava.create(lava.x, lava.y, lava.image);
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;
    //animations
    sprite.animations.add('flow', [0, 1, 2], 6, true);
    sprite.animations.play('flow');
};

PlayState._spawnFireball = function (data) {
    data.fireball.forEach(function (ball) {
        let sprite = new Fireball(this.game, ball.x, ball.y, ball.height, ball.velocity);
        this.fireball.add(sprite);
    }, this);    
};

PlayState._spawnSpike = function (data) {
    data.spike.forEach(function (s) {
        let sprite = new Spike(this.game, s.x, s.y, s.image);
        this.spike.add(sprite);
    }, this);    
};

PlayState._spawnEnemyWall = function (x, y, side) {
    let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    // anchor and y displacement
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
};

PlayState._spawnRings = function (ring) {
    let sprite = this.rings.create(ring.x, ring.y, 'ring');
    sprite.anchor.set(0.5, 0.5);
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    // animations
    sprite.animations.add('rotate', [0, 1, 2, 1], 6, true);
    sprite.animations.play('rotate');
};

PlayState._spawnFinish = function (data) {
    let sprite = this.finish.create(data.finish.x, data.finish.y, 'finish');
    this.game.physics.enable(sprite);
    sprite.anchor.setTo(0.5, 1);  
    sprite.body.allowGravity = false;
    sprite.animations.add('open', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
};

PlayState._spawnSpring = function (spring) {
    let sprite = this.spring.create(spring.x, spring.y, 'spring');
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.animations.add('jump', [0, 1, 0], 12);  
};

PlayState._createHud = function () {
    const NUMBERS_STR = '0123456789:';
    const LETTERS_STR = 'SCORINGTME';  
    this.scoreText = this.game.add.retroFont('font:letters', 14, 17, LETTERS_STR, 10);
    this.timeText = this.game.add.retroFont('font:letters', 14, 17, LETTERS_STR, 10);
    this.ringText = this.game.add.retroFont('font:letters', 14, 17, LETTERS_STR, 10);
    this.scoreNumber = this.game.add.retroFont('font:numbers', 14, 17, NUMBERS_STR, 11);
    this.timeNumber = this.game.add.retroFont('font:numbers', 14, 17, NUMBERS_STR, 11);
    this.ringNumber = this.game.add.retroFont('font:numbers', 14, 17, NUMBERS_STR, 11);
    
    this.scoreText.text = `SCORE`;
    this.timeText.text = `TIME`;
    this.ringText.text = `RINGS`;
    
    let scoreTextImage = this.game.make.image(50, 25, this.scoreText);
    let timeTextImage = this.game.make.image(50, 25, this.timeText);
    let ringsTextImage = this.game.make.image(50, 25, this.ringText);
    let scoreNumberImage = this.game.make.image(50, 25, this.scoreNumber);
    let timeNumberImage = this.game.make.image(50, 25, this.timeNumber);
    let ringsNumberImage = this.game.make.image(50, 25, this.ringNumber)
    
    this.hud = this.game.add.group();
    this.hud.add(scoreTextImage);
    this.hud.add(timeTextImage);
    this.hud.add(ringsTextImage);
    this.hud.add(scoreNumberImage);
    this.hud.add(timeNumberImage);
    this.hud.add(ringsNumberImage);
    
    this.hud.position.set(10, 10);
    this.hud.children[0].position.set(20, 20);
    this.hud.children[1].position.set(20, 50);
    this.hud.children[2].position.set(20, 80);
    this.hud.children[3].position.set(140, 20);
    this.hud.children[4].position.set(100, 50);
    this.hud.children[5].position.set(140, 80);
    console.log(this.hud.children[3])
};

// =============================================================================
// entry point
// =============================================================================

window.onload = function () {
    let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
    game.state.add('play', PlayState);
    game.state.add('loading', LoadingState);
    game.state.start('loading');
};