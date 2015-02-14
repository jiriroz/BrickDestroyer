/*Block destroyer game. Jiri Roznovjak, September 2014.*/
function sketchProc(processing) {
var WIDTH = 800;
var HEIGHT = 600;
document.getElementById("canvas").style.width = WIDTH;
document.getElementById("canvas").style.height = HEIGHT;
processing.size(WIDTH, HEIGHT);

processing.noStroke();
processing.rectMode(processing.CENTER);

var Box = function(x,y,w,h,r,color) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.radius = r;
    this.color = color;
    this.drawn = false;
};

Box.prototype.checkMouse = function() {
    return (processing.mouseX > this.x-this.width/2 &&
        processing.mouseX < this.x+this.width/2 &&
        processing.mouseY > this.y-this.height/2 &&
        processing.mouseY < this.y+this.height/2);
};

Box.prototype.display = function () {
    processing.fill(this.color);
    processing.rect(this.x,this.y,this.width,this.height);
};

var Game = function () {
    this.newGameBox = new Box(WIDTH/2,5*HEIGHT/8,160,55,0,processing.color(120, 189, 245));
    this.gameOverBox = new Box(WIDTH/2,HEIGHT/2,500,300,0,processing.color(0, 94, 255, 90));
    this.pauseBox = new Box(720,560,80,35,5,processing.color(62, 107, 212));
    this.resumeBox = new Box(WIDTH/4,2*HEIGHT/3,220,120,5,processing.color(77, 255, 0, 100));
    this.mainMenuBox = new Box(3*WIDTH/4,2*HEIGHT/3,220,120,5,processing.color(77, 255, 0, 100));
    this.state = 0;
    this.level = 1;
    this.bricks = [];
    this.balls = [];
};

//runs level in the draw function
Game.prototype.runLevel = function() {
    processing.background(252, 251, 194);
    this.pauseBox.display();
    if (this.pauseBox.checkMouse()) {
        var pauseCol = processing.color(163, 59, 137);
    } else {
        var pauseCol = processing.color(255, 255, 255);
    }
    this.displayText('Pause',this.pauseBox.x-27,this.pauseBox.y+7,18,pauseCol);
    this.displayText('Level '+ this.level,20,567,18);
    for (var i=0; i < this.bricks.length; i++) {
        this.bricks[i].run();
        for (var j = 0; j< this.balls.length; j++) {
            if (this.balls[j].checkCollision(this.bricks[i])) {
                if (Math.random() < 0.01) {
                    this.balls.push(new Ball(this.bricks[i].position.x,
                        this.bricks[i].position.y,Math.random()*(-7),-7));
                }
                this.balls[j].collide(this.bricks[i]);
                this.bricks.splice(i,1);
                i--;
                if (i < 0) {
                    break;
                }
            }
        }
    }
    for (var k = 0; k < this.balls.length; k++) {
        this.balls[k].run();
        if (this.balls[k].checkCollision(this.bouncer)) {
            this.balls[k].collideBouncer(this.bouncer);
        }
    }
    processing.fill(255, 0, 0);
    for (var heart = 0; heart < this.lifes; heart++){
        processing.ellipse(115+heart*25,562,15,15);
    }
    this.bouncer.run();
};

//level setup
Game.prototype.newLevel = function() {
    this.bouncer = new Bouncer();
    this.bricks = [];
    this.balls = [];
    this.balls.push(new Ball(WIDTH/2,2*HEIGHT/3,Math.random()*5,-7));
    for (var x = 0; x < 9; x++) {
        for (var y = 0; y < this.level + 2; y++) {
            this.bricks.push(new Brick(75+x*80,40+y*40,70,30));
        }
    }
};

Game.prototype.initialScreen = function() {
    if (this.newGameBox.checkMouse()) {
        this.newGameBox.color = processing.color(95, 171, 230);
    } else {
        this.newGameBox.color = processing.color(120, 189, 245);
    }
    processing.background(190, 250, 216);
    processing.fill(255, 115, 0);
    processing.rect(WIDTH/2,HEIGHT/4,3*WIDTH/5,HEIGHT/5);
    this.displayText("Brick Destroyer",230,170,50);
    this.newGameBox.display();
    this.displayText("New Game",335,385,27);
    this.displayText("Jiri Roznovjak",335,570,20);
};

Game.prototype.gameOver = function() {
    if (this.gameOverBox.drawn === false) {
        this.gameOverBox.display();
        this.gameOverBox.drawn = true;
    }
    var textCol = processing.color(255,0,0);
    this.displayText('Game Over',WIDTH/2-135,HEIGHT/2,55,textCol);
    this.displayText('Click to return to Main Menu',WIDTH/2-125,HEIGHT/2+50,22);
};

//draws the screen just once to make it transparent
Game.prototype.pause = function() {
    if (this.resumeBox.drawn) {return;}
    processing.fill(92, 92, 92, 50);
    processing.rect(WIDTH/2,HEIGHT/2,WIDTH,HEIGHT);
    this.resumeBox.display();
    this.mainMenuBox.display();
    this.displayText('Pause',300,HEIGHT/2-50,80);
    this.displayText('Resume',this.resumeBox.x-55,this.resumeBox.y+15,30);
    this.displayText('Main Menu',this.mainMenuBox.x-72,this.mainMenuBox.y+15,30);
    this.resumeBox.drawn = true;
};

Game.prototype.displayText = function (text,x,y,size,color) {
    if (typeof(color) === 'undefined') {
        processing.fill(0,0,0);
    } else {
        processing.fill(color);
    }
    processing.textSize(size);
    processing.text(text,x,y);
};

var Bouncer = function() {
    this.position = new processing.PVector(WIDTH/2,7*HEIGHT/8);
    this.width = 160;
    this.height = 13;
};

Bouncer.prototype.update = function () {
    if (processing.mouseX>this.width/2 && processing.mouseX<WIDTH-this.width/2) {
        this.position.x = processing.mouseX;
    }
};

Bouncer.prototype.display = function() {
    processing.noStroke();
    processing.fill(0, 26, 255);
    processing.rect(this.position.x,this.position.y,this.width,this.height,15);
};

Bouncer.prototype.run = function(){
    this.update();
    this.display();
};

var Ball = function(x,y,velx,vely) {
    this.position = new processing.PVector(x,y);
    this.velocity = new processing.PVector(velx,vely);
    this.radius = 12;
    this.color = processing.color(Math.random()*150,
                                  Math.random()*150,
                                  Math.random()*150);
};

Ball.prototype.update = function() {
    this.position.add(this.velocity);
};

Ball.prototype.checkEdges = function(){
    if (this.position.x<this.radius || this.position.x > WIDTH-this.radius) {
        this.velocity.x *= -1;
    }
    if (this.position.y < this.radius) {
        this.velocity.y *= -1;
    }
    if (this.position.y>HEIGHT+this.radius) {
        game.lifes--;
        this.position.y = -500;
        this.velocity.y = 0;
        if (Math.random() > 0.5) {var direction = 1;} else {var direction = 0;}
        game.balls.push(new Ball(WIDTH/2,HEIGHT/2,Math.random() * 8 * direction,-7));
        if (game.lifes < 0) {
            game.state = 3;
        }
    }
};

Ball.prototype.checkCollision = function(obstacle) {
    return (this.position.x-this.radius < obstacle.position.x+obstacle.width/2 &&
        this.position.x+this.radius > obstacle.position.x-obstacle.width/2 &&
        this.position.y+this.radius>obstacle.position.y-obstacle.height/2 &&
        this.position.y-this.radius<obstacle.position.y+obstacle.height/2);
};

Ball.prototype.display = function() {
    processing.noStroke();
    processing.fill(this.color);
    processing.ellipse(this.position.x,this.position.y,this.radius*2,this.radius*2);
};

Ball.prototype.run = function () {
    this.update();
    this.checkEdges();
    this.display();
};

Ball.prototype.collide = function (brick) {
    if (this.position.x>brick.position.x+brick.width/2 ||
        this.position.x<brick.position.x-brick.width/2) {
        this.velocity.x *= -1;
    } else {
        this.velocity.y *= -1;
    }
};

Ball.prototype.collideBouncer = function(bouncer) {
    this.velocity.y *= -1;
    var relativeDist = (this.position.x-bouncer.position.x)/bouncer.width;
    this.velocity.x += relativeDist*5;
};

var Brick = function(x,y,w,h) {
    this.position = new processing.PVector(x,y);
    this.width = w;
    this.height = h;
    this.color = processing.color(255, 115, 0);
};

Brick.prototype.display = function() {
    processing.fill(this.color);
    processing.rect(this.position.x,this.position.y,this.width,this.height);
};

Brick.prototype.run = function () {
    this.display();
};

var game = new Game();

processing.mouseClicked = function() {
    //initial screen
    if (game.state === 0) {
        if (game.newGameBox.checkMouse()) {
            game.lifes = 3;
            game.state = 1;
            game.newLevel();
        }
    }
    //game
    else if (game.state === 1) {
        if (game.pauseBox.checkMouse()) {
        game.state = 2;
        }
    }
    //pause
    else if (game.state === 2) {
        if (game.resumeBox.checkMouse()) {
            game.resumeBox.drawn = false;
            game.state = 1;}
        if (game.mainMenuBox.checkMouse()) {
            game.resumeBox.drawn = false;
            game.state = 0;
        }
    }
    //game over
    else if (game.state === 3) {
        if (game.gameOverBox.checkMouse()) {
            game.state = 0;
            game.gameOverBox.drawn = false;
        }
    }
};

processing.draw = function() {
    //initial screen
    if (game.state === 0) {
        game.initialScreen();
    }
    //game
    else if (game.state === 1) {
        if (game.bricks.length === 0) { //game
            game.level++;
            game.newLevel();
        }
        game.runLevel();
    }
    //pause
    else if (game.state === 2) {
        game.pause();
    }
    //game over
    else if (game.state === 3) {
        game.gameOver();
    }
};

}
var canvas = document.getElementById("canvas");
var p = new Processing(canvas, sketchProc);
