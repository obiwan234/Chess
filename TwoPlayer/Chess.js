const playerNames=["White","Black"];
let playerList;
let currPlayer; //number
let board;
let messageSlot;
let again,undo,redo,highlightButton,rotateButton; //buttons
let boardimg;
let ChessImages;
let moveLine;
let hist;
let undid;
let checkMate; //number represents the loser
let deadPieces;
let currPiece;
let promote;
let highlightOn=true;
let rotateOn=true;
let canvas;

function preload() {
	boardimg=loadImage("ChessAssets/chessboard.png");
	ChessImages=[[],[]];
	for(let colorNum=0; colorNum<2; colorNum++) {
		for(let pieceNum=0; pieceNum<6; pieceNum++) {
			let pieceImg=loadImage("ChessAssets/chesspiecec"+colorNum+"p"+pieceNum+".png");
			ChessImages[colorNum].push(pieceImg);
		}
	}
}

function setup() {
	canvas=createCanvas(600,400);
	canvas.position(windowWidth/2-width/2,windowHeight/3-height/2);
	makeDOM();
	initializeVars();
	angleMode(DEGREES);
}

function initializeVars() {
	//rows,cols,boxWidth,boxHeight,canvasWidth,canvasHeight,spacing,statusList,pigment
	board=new Grid(8,8,46,45,400,400,2,color(255));//(8,8,50,50,400,400,0,color(255));//(8,8,46,45,400,400,2,color(255));
	currPiece=false;
	currPlayer=0;
	hist=[];
	undid=[];
	deadPieces=[[],[]];
 	checkMate=-1;
 	promote=false;
	playerList=[];
	playerList.push(new Player(0,-1,board,ChessImages[0]));
	playerList.push(new Player(1,1,board,ChessImages[1]));
	for(let player of playerList) {
		player.initializePieces();
	}
	updateAll();
	messageSlot.html(playerNames[currPlayer]+"'s turn");
	moveLine=false;
}

function draw() {
	background(255);
	image(boardimg,0,0,400,400);
	displayDead();
	//highlight
	if(currPiece) {
		currPiece.position.highlight(color(255,/*255*/0,0,150),false);
		if(highlightOn) {
			currPiece.highlightMoves();
		}
	}
	if(moveLine) {
		let boxWidth=moveLine[0].boxWidth;
		let boxHeight=moveLine[0].boxHeight;
		let loc1=moveLine[0].currLoc();
		let loc2=moveLine[1].currLoc();
		push();
		stroke(255,0,0);
		strokeWeight(6);
		line(loc1.x+boxWidth/2,loc1.y+boxHeight/2,loc2.x+boxWidth/2,loc2.y+boxHeight/2);
		pop();
	}
	board.printGrid();
	if(promote) {
		promoteMessage();
	}
}

function completeMove(piece,location,source) {
	let move=piece.move(location,source);
	hist.push(move);
	moveLine=[move.startLoc,move.endLoc];
	switchPlayer();
	updateAll();
	validateAll();
	playerList[currPlayer].endPassants();
	undid=[];
}

function completeUndo() {
	let move=hist.pop()
	moveLine=false;
	move.undo();
	undid.push(move);
	switchPlayer();
	updateAll();
	validateAll();
	playerList[currPlayer].updateCheck();
	playerList[currPlayer].rePassant();
}

function makeDOM() {
	messageSlot=createElement("h1");
	messageSlot.position(windowWidth/2-width/2,height+10+windowHeight/3-height/2);
	again=createButton("Restart");
	again.position(425+windowWidth/2-width/2,windowHeight/3-height/2);
	again.mousePressed(initializeVars);
	undo=createButton("Undo");
	undo.position(425+windowWidth/2-width/2,90+windowHeight/3-height/2);
	undo.mousePressed(undoMove);
	redo=createButton("Redo");
	redo.position(425+windowWidth/2-width/2,120+windowHeight/3-height/2);
	redo.mousePressed(redoMove);
	highlightButton=createButton("Unhighlight");
	highlightButton.position(425+windowWidth/2-width/2,30+windowHeight/3-height/2);
	highlightButton.mousePressed(toggleHighlight);	
	rotateButton=createButton("Rotate Off");
	rotateButton.position(425+windowWidth/2-width/2,60+windowHeight/3-height/2);
	rotateButton.mousePressed(toggleRotate);	
}

function toggleHighlight() {
	if(/*highlightButton.html()=="Unhighlight"*/highlightOn==true) {
		highlightButton.html("Highlight");
	} else {
		highlightButton.html("Unhighlight");
	}
	highlightOn=!highlightOn;
}

function toggleRotate() {
	if(rotateButton.html()=="Rotate Off") {
		rotateButton.html("Rotate On");
	} else {
		rotateButton.html("Rotate Off");
	}
	rotateOn=!rotateOn;
}

function undoMove() {
	if(hist.length>0) {
		currPiece=false;
		completeUndo();
		playerList[currPlayer].updateCheck();
		playerMessage();
	}
}

function redoMove() {
	if(undid.length>0) {
		currPiece=false;
		let move=undid.pop();
		move.execute("player");
		moveLine=[move.startLoc,move.endLoc];
		hist.push(move);
		switchPlayer();
		updateAll();
		validateAll();
		playerMessage();
	}
}

function switchPlayer() {
	if(checkMate==-1) {
		currPlayer=1-currPlayer;
		messageSlot.html(playerNames[currPlayer]+"'s turn");
	}
}

function updateAll() {
	playerList[1-currPlayer].updateAllMoves();
	playerList[currPlayer].updateAllMoves();
}

function validateAll() {
	playerList[currPlayer].validate();
}

function mousePressed() {
	if(!promote) {
		let loc=board.findLocation(mouseX,mouseY);
		if(loc&&checkMate==-1) {
			if(loc.piece&&loc.piece.player.num==currPlayer) {
				currPiece=loc.piece;
			} else {
				if(currPiece&&currPiece.canMoveTo(loc)) {
					completeMove(currPiece,loc,"player");
					playerList[1-currPlayer].updateAllMoves();
					playerMessage();
				}
				currPiece=false;
			}
		}
	}
}

function DeadPiece(player,value) {
	this.player=player;
	this.value=value;
	let index=0
	// for(let i=0; i<deadPieces[this.player].length; i++) {
	// 	if(this.value<deadPieces[this.player][i].value) {
	// 		index=i;
	// 	}
	// 	if(i=deadPieces[this.player].length-1) {
	// 		index=deadPieces[this.player].length;
	// 	}
	// }
	deadPieces[this.player].splice(index,0,this);
	this.display=function(x,y) {
		image(ChessImages[this.player][this.value],x,y,25,25);
	}
	this.revive=function() {
		for(let i=0; i<deadPieces[this.player].length; i++) {
			let deceased=deadPieces[this.player][i];
			if(deceased.equals(this)) {
				deadPieces[this.player].splice(i,1);
				break;
			}
		}
	}
	this.equals=function(other) {
		return this.value==other.value;
	}
}

function displayDead() {
	i=0;
	j=0;
	for(let deadPlayer of deadPieces) {
		for(let deceased of deadPlayer) {
			deceased.display(415+i*35,150+30*j);
			j++;
			if(j==8) {
				j=0;
				i++;
			}
		}
		j=0;
		i=2;
	}
}

function playerMessage() {
	playerList[1-currPlayer].updateAllMoves();
	if(playerList[currPlayer].updateCheck()) {
		if(playerList[currPlayer].getAllMoves().length==0) {
			messageSlot.html("Checkmate!!   "+playerNames[1-currPlayer]+" Wins!!");
		} else {
			messageSlot.html("Check!   "+playerNames[currPlayer]+"'s turn");
		}
	} else if(playerList[currPlayer].getAllMoves().length==0||(playerList[0].pieces.length==1&&playerList[1].pieces.length==1)) {
		messageSlot.html("Stalemate!!");
	}
}

function promoteMessage() {
	push();
	fill(40);
	rect(50,50,300,300);
	fill(255);
	textSize(20);
	text("What Would You Like To",90,90);
	text("Promote Your Pawn To?",90,120);
	textSize(18);
	text("Press 1: Bishop",65,210);
	text("Press 2: Knight",205,210);
	text("Press 3: Rook",65,280);
	text("Press 4: Queen",205,280);
	pop();
}

function keyTyped() {
	key=parseInt(key);
	if(promote&&key>0&&key<5) {
		promotePawn(key);
	}
}

function promotePawn(val) {
	promote.become=Pieces[val];
	promote.become(promote.row,promote.col);
	promote.img=promote.player.pieceImageList[val];
	promote=false;
	updateAll();
	validateAll();
	playerMessage();
	
}

function shouldRotate() {
	return currPlayer==1&&rotateOn;
}
