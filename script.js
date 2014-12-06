/*Block destroyer game. Copyright Jiri Roznovjak, September 2014.*/
function sketchProc(processing) {
var cWidth = 800;
var cHeight = 600;
processing.size(cWidth,cHeight);
processing.background(100,10,200);

processing.noStroke();
processing.rectMode(processing.CENTER);
var gameState = 0;
var bgColor = processing.color(252, 251, 194);
var data = {};
var lifes = 0;
var pNewBall = 0.01 //probability of new ball appearing after destroying a brick
var bouncerWidth = 160;
var dummy = 1;

var Box = function(x,y,w,h,color) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.color = color;
    this.drawn = false;
};
Box.prototype.checkMouse = function() {
    if (processing.mouseX > this.x-this.width/2 && processing.mouseX < this.x+this.width/2 && processing.mouseY>this.y-this.height/2 && processing.mouseY<this.y+this.height/2) {
        return true;
    }
};

var newGameBox = new Box(cWidth/2,5*cHeight/8,160,55,processing.color(120, 189, 245));
var gameOverBox = new Box(cWidth/2,cHeight/2,500,300,processing.color(0, 94, 255,90));
var pauseBox = new Box(720,560,80,35,processing.color(62, 107, 212));
var resumeBox = new Box(cWidth/4,2*cHeight/3,220,120,processing.color(77, 255, 0,100));
var returnMainMenuBox = new Box(3*cWidth/4,2*cHeight/3,220,120,processing.color(77, 255, 0,100));

var initialScreen = function() {
    if (newGameBox.checkMouse()) {
        newGameBox.color = processing.color(95, 171, 230);
    } else {
        newGameBox.color = processing.color(120, 189, 245);
    }
    processing.background(190, 250, 216);
    processing.fill(255, 115, 0);
    processing.rect(cWidth/2,cHeight/4,3*cWidth/5,cWidth/5);
    processing.fill(0, 0, 0);
    processing.textSize(50);
    processing.text("Brick Destroyer",230,170);
    processing.textSize(27);
    processing.fill(newGameBox.color);
    processing.rect(newGameBox.x,newGameBox.y,newGameBox.width,newGameBox.height); //box with new game
    processing.fill(0, 0, 0);
    processing.text("New Game",335,385);
    processing.textSize(20);
    processing.text("Jiri Roznovjak",335,570);
};

var gameOver = function() {
    if (gameOverBox.drawn === false) {
    processing.fill(gameOverBox.color);
    processing.rect(gameOverBox.x,gameOverBox.y,gameOverBox.width,gameOverBox.height);
    gameOverBox.drawn = true;
    }
    processing.fill(255, 0, 0);
    processing.textSize(55);
    processing.text('Game Over',cWidth/2-135,cHeight/2);
    processing.textSize(22);
    processing.fill(0, 0, 0);
    processing.text('Click to return to Main Menu',cWidth/2-125,cHeight/2+50);
};

var pause = function() {
    if (!resumeBox.drawn) {
        var bg = processing.color(92, 92, 92,50);
        processing.fill(bg);
        processing.rect(cWidth/2,cHeight/2,cWidth,cHeight);
        processing.fill(resumeBox.color);
        processing.rect(resumeBox.x,resumeBox.y,resumeBox.width,resumeBox.height,5);
        processing.fill(returnMainMenuBox.color);
        processing.rect(returnMainMenuBox.x,returnMainMenuBox.y,returnMainMenuBox.width,returnMainMenuBox.height,5);
        processing.fill(0, 0, 0);
        processing.textSize(80);
        processing.text('Pause',300,cHeight/2-50);
		processing.textSize(30);
		processing.text('Resume',resumeBox.x-55,resumeBox.y+15);
		processing.text('Main Menu',returnMainMenuBox.x-72,returnMainMenuBox.y+15);
        resumeBox.drawn = true;
		;}
};

var checkCollision = function(ball,obstacle) {
    if (ball.position.x-ball.radius < obstacle.position.x+obstacle.width/2 && ball.position.x+ball.radius > obstacle.position.x-obstacle.width/2 && ball.position.y+ball.radius>obstacle.position.y-obstacle.height/2 && ball.position.y-ball.radius<obstacle.position.y+obstacle.height/2) {
        return true;
    } else {
        return false;
    }
};

var Bouncer = function(y,w) {
    this.position = new processing.PVector(cWidth/2,y);
    this.width = w;
    this.height = 13;
};
Bouncer.prototype.update = function () {
    if (processing.mouseX>this.width/2 && processing.mouseX<cWidth-this.width/2) {
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

var Ball = function(x,y,velx,vely,radius,color) {
    this.position = new processing.PVector(x,y);
    this.velocity = new processing.PVector(velx,vely);
    this.radius = radius;
    this.color = color;
};
Ball.prototype.update = function() {
    this.position.add(this.velocity);
};
Ball.prototype.checkEdges = function(){
    if (this.position.x<this.radius || this.position.x > cWidth-this.radius) {
        this.velocity.x *= -1;
    }
    if (this.position.y < this.radius) {
        this.velocity.y *= -1;
    }
    if (this.position.y>cHeight+this.radius) {
        lifes--;
        this.position.y = -500;
        this.velocity.y = 0;
		if (Math.random()>0.5) {
			dummy = -1;
			}
		else {
		dummy = 1;
		}
        data.balls.push(new Ball(cWidth/2,cHeight/2,Math.random()*(-8)*dummy,-7,12,processing.color(Math.random()*255, Math.random()*255, Math.random()*255)));
        if (lifes<0) {
            gameState = 10;
        }
    
    }
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
Ball.prototype.collide = function (obstacle) {
    if (this.position.x>obstacle.position.x+obstacle.width/2 || this.position.x<obstacle.position.x-obstacle.width/2) {
        this.velocity.x *= -1;
    } else {
		this.velocity.y *=-1;
	}
};
Ball.prototype.collideBouncer = function(bouncer) {
    this.velocity.y *=-1;
    var relativeDist = (this.position.x-bouncer.position.x)/bouncer.width;
    this.velocity.x +=relativeDist*5;
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

var newLevel = function(level) {
    //basic level setup
    var bouncer1 = new Bouncer(7*cHeight/8,bouncerWidth);
    var bricks = [];
    var balls = [];
    balls.push(new Ball(cWidth/2,2*cHeight/3,Math.random()*5,-7,12,processing.color(2, 189, 18)));
    for (var x=0;x<9;x++) {
        for (var y=0;y<gameState+2;y++) {
            bricks.push(new Brick(75+x*80,40+y*40,70,30));
    }
}           
    return {'bouncer1':bouncer1,'balls':balls,'bricks':bricks};
};

var runLevel = function(data) {
    //runs level in the draw function
    processing.background(bgColor);
    processing.fill(pauseBox.color);
    processing.rect(pauseBox.x,pauseBox.y,pauseBox.width,pauseBox.height,5);
    if (pauseBox.checkMouse()) {
        processing.fill(163, 59, 137);
    } else {
    processing.fill(255, 255, 255);}
    processing.textSize(18);
    processing.text('Pause',pauseBox.x-27,pauseBox.y+7);
    processing.fill(0, 0, 0);
    var nLevel = gameState.toString();
    processing.text('Level '+nLevel,20,567);
    for (var i=0;i<data.bricks.length;i++) {
        data.bricks[i].run();
            for (var j=0;j<data.balls.length;j++) {
                if (checkCollision(data.balls[j],data.bricks[i])) {
                    if (Math.random() < pNewBall) {
                        data.balls.push(new Ball(data.bricks[i].position.x,data.bricks[i].position.y,Math.random()*(-7),-7,12,processing.color(Math.random()*255, Math.random()*255, Math.random()*255)));
                        }
                    data.balls[j].collide(data.bricks[i]);
                    data.bricks.splice(i,1);
                    i--;
                    if (i<0) {
                        break;
                    }
                }
            }
        }
    for (var k=0;k<data.balls.length;k++) {
        data.balls[k].run();
        if (checkCollision(data.balls[k],data.bouncer1)) {
            data.balls[k].collideBouncer(data.bouncer1);
        }
    }
    processing.fill(255, 0, 0);
    for (var heart=0;heart<lifes;heart++){
        processing.ellipse(115+heart*25,562,15,15); //should be a heart
    }
    data.bouncer1.run();
};

processing.mouseClicked = function() {
    if (gameState === 10) {
        if (gameOverBox.checkMouse()) {
            gameState = 0;
            gameOverBox.drawn = false;
        }
    } else if (gameState === 0) {
        if (newGameBox.checkMouse()) {
            lifes = 3;
            gameState ++;
            data = newLevel(1);
        }
    } else if (gameState<0) { //pause
        if (resumeBox.checkMouse()) {
            resumeBox.drawn = false;
            gameState *= -1;}
        if (returnMainMenuBox.checkMouse()) {
            resumeBox.drawn = false;
            gameState = 0;
        }
    } else {
        if (pauseBox.checkMouse()) {
            gameState *=-1;
        }
    }
};

processing.draw = function() {
    if (gameState === 10) { //game over
        gameOver();
    } else if (gameState === 0) { //initial screen
        initialScreen();
    } else if (gameState < 0) { //pause
        pause();
    }
    else {
        if (data.bricks.length === 0) { //game
            gameState++;
            data = newLevel(gameState);
        }
        runLevel(data);
    }
};


}
var canvas = document.getElementById("canvas1");
var p = new Processing(canvas, sketchProc);
