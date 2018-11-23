/*NOTES:
	MAJOR:
		1)name created games
		2)home page!

	MINOR:
		1)sort killed pieces by rank
		2)improve page asthetics
		3)when empty gameList, simply state no available games
		4)make gamelist button also clickable(not just hover) - mainly for ios

  	CLEANING:
  		1)remove all undo and redo code
  		2)organize comments
*/

let debug;
const playerNames=["White","Black"];
let connection={};
connection.gameID="Game"+Math.floor(100*Math.random());
let playerNum=0;
let playerList;
let currPlayer; //number
let board;
let messageSlot;
let moveLine;
let again,undo,redo,highlightButton,quit; //buttons
let boardimg;
let ChessImages;
let hist;
let undid;
let checkMate; //number represents the loser
let deadPieces;
let currPiece;
let promote;//reference to the pawn
let highlightOn=true;
let pause=false;
let canvas;

function preload() {
	var config = {
	    apiKey: "AIzaSyCqtL0Qgf7HIeNDFQd2x0qaWfdRXcR5HGI",
	    authDomain: "chess-2-53e11.firebaseapp.com",
	    databaseURL: "https://chess-2-53e11.firebaseio.com",
	    projectId: "chess-2-53e11",
	    storageBucket: "chess-2-53e11.appspot.com",
	    messagingSenderId: "405103054020"
	};
	firebase.initializeApp(config);
	connection.database = firebase.database();
	if(window.name) {
		connection.gameID=window.name;
	}

	boardimg=loadImage("ChessAssets/chessboard.png");
	ChessImages=[[],[]];
	for(let colorNum=0; colorNum<2; colorNum++) {
		for(let pieceNum=0; pieceNum<6; pieceNum++) {
			let pieceImg=loadImage("ChessAssets/chesspiecec"+colorNum+"p"+pieceNum+".png");
			ChessImages[colorNum].push(pieceImg);
		}
	}
	window.addEventListener("beforeunload", function(event) {
	    unloadGame();
	    return null;
	});
}

function setup() {
	canvas=createCanvas(600,400);
	canvas.position(windowWidth/2-width/2,windowHeight/3-height/2);
	makeDOM();
	initializeVars();
	angleMode(DEGREES);
	connection.fireGame={
		gameID:connection.gameID,
		moveList:[],
		white:false,
		black:false,
		update:null
	}
	loadGame();
	connection.currGame=connection.database.ref("gameList/"+connection.gameID);
	if(!window.name) {
		connection.currGame.set(connection.fireGame);
	}
}

function initializeVars() {
	//rows,cols,boxWidth,boxHeight,canvasWidth,canvasHeight,spacing,statusList,pigment
	board=new Grid(8,8,46,45,400,400,2,color(255));//(8,8,50,50,400,400,0,color(255));//(8,8,46,45,400,400,2,color(255));
	currPiece=false;
	currPlayer=0;
	moveLine=false;
	hist=[];
	undid=[];
	deadPieces=[[],[]];
 	checkMate=-1;
	playerList=[];
	playerList.push(new Player(0,-1,board,ChessImages[0]));
	playerList.push(new Player(1,1,board,ChessImages[1]));
	for(let player of playerList) {
		player.initializePieces();
	}
	updateAll();
	messageSlot.html(playerNames[currPlayer]+"'s turn");
}

function joinGame() {
	console.log(this.html());
	connection.gameID=this.html();
	loadGame(this.html());
	connection.currGame=connection.database.ref("gameList/"+connection.gameID);
}

function loadGame() {
	//if moveList has stuff, loop through it
	if(connection.currGame) {
		unloadGame();
	}
	connection.gameList=connection.database.ref("gameList");
	connection.gameList.on("value",function(games){
		//clear list
		let elts=selectAll(".listing");
		for(let elt of elts) {
			elt.remove();
		}
		games.forEach(function(game){
			if(game.val().gameID!=connection.gameID&&(!game.val().white||!game.val().black)) {
				let ahref=createA("#", game.val().gameID);
				ahref.class("listing");
				ahref.mousePressed(joinGame);
				ahref.parent("#myDropdown");
			}
		})
	});
	connection.moveList=connection.database.ref("gameList/"+connection.gameID+"/moveList");
	connection.moveList.on("child_added",processMove);
	connection.update=connection.database.ref("gameList/"+connection.gameID+"/update");
	connection.update.on("value",processUpdate);
	connection.white=connection.database.ref("gameList/"+connection.gameID+"/white");
	connection.white.on("value",function(data){connection.player0=data.val()});
	connection.black=connection.database.ref("gameList/"+connection.gameID+"/black");
	connection.black.on("value",function(data){connection.player1=data.val()});
	//uses once because event not triggered immediatley
	connection.white.once("value",function(data) {
		connection.player0=data.val();
		if(connection.player0&&!connection.player1) {//if white player but no black
			playerNum=1;
			connection.black.set(true);
		} else if(!connection.player0){//no white player
			connection.player0=true;
			connection.white.set(true);
		}
	});
	initializeVars();
	connection.moveList.once("value",function(data){
		if(data.val()) {
			moveList=Object.values(data.val());
			for(let moveData of moveList) {
				if(!moveData.promote) {
					let piece=playerList[currPlayer].pieces[moveData.piece];
					let location=board.get(moveData.row,moveData.col);
					completeMove(piece,location,"computer");//as if play computer moved
					playerList[1-currPlayer].updateAllMoves();
				} else {
					promoteRecieved(moveData);
				}
			}
		}
	});
}

function unloadGame() {
	//only turn off game if game is empty
	if(playerNum==0) {
		connection.white.set(false);
		connection.player0=false;
	} else {
		connection.black.set(false);
		connection.player1=false;
	}
	connection.gameList.off("value");
	connection.moveList.off("child_added");
	connection.update.off("value");
	connection.white.off("value");
	connection.black.off("value");
	if(!connection.player0&&!connection.player1) {
		connection.currGame.remove();
	}
	connection.player0=false;
	connection.player1=false;
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
	if(moveLine&&moveLine[1].piece.player.num!=playerNum) {
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
		pause=false;
		promoteMessage();
	}
}

function processUpdate(change) {
	pause=false;
	action=change.val();
	if(action=="restart") {
		initializeVars();
		connection.moveList.set([]);
		connection.update.set(null);
	} else if(action=="pause") {
		pause=true;
	}
}

function processMove(moveData) {
	moveData=moveData.val();
	if(!moveData.promote&&moveData.player!=playerNum) {
		currPiece=false;
		let piece=playerList[currPlayer].pieces[moveData.piece];
		let location=board.get(moveData.row,moveData.col);
		completeMove(piece,location,"computer");//as if play computer moved
		playerList[1-currPlayer].updateAllMoves();
		playerMessage();
	} else if(moveData.promote) {
		promoteRecieved(moveData);
	}
}

function completeMove(piece,location,source) {
	window.name=connection.gameID;
	let move=piece.move(location,source);
	if(move) {
		hist.push(move);
		moveLine=[move.startLoc,move.endLoc];
		switchPlayer();
		updateAll();
		validateAll();
		playerList[currPlayer].endPassants();
		undid=[];
	}	
}

function completeUndo() {
	let move=hist.pop()
	move.undo();
	moveLine=false;
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
	again.position(425+windowWidth/2-width/2,10+windowHeight/3-height/2);
	again.mousePressed(restartCall);
	quit=createButton("Leave Game");
	quit.position(425+windowWidth/2-width/2,70+windowHeight/3-height/2);
	quit.mousePressed(quitCall);
	// undo=createButton("Undo");
	// undo.position(425,70);
	// undo.mousePressed(undoCall);
	// redo=createButton("Redo");
	// redo.position(425,100);
	// redo.mousePressed(redoCall);
	highlightButton=createButton("Unhighlight");
	highlightButton.position(425+windowWidth/2-width/2,40+windowHeight/3-height/2);
	highlightButton.mousePressed(toggleHighlight);

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

function undoCall() {
	if(!pause) {
		connection.update.set("undo");
	}
}

function redoCall() {
	if(!pause) {
		connection.update.set("redo");
	}
}

function restartCall() {
	connection.update.set("restart");
}

function quitCall() {
	window.name="";
	window.location.reload();
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
	if(!promote&&currPlayer==playerNum&&!pause) {
		let loc=board.findLocation(mouseX,mouseY);
		if(loc&&checkMate==-1) {
			if(loc.piece&&loc.piece.player.num==currPlayer) {
				currPiece=loc.piece;
			} else {
				if(currPiece&&currPiece.canMoveTo(loc)) {

					let moveData={
						piece:playerList[currPlayer].pieces.indexOf(currPiece),
						row:loc.row,
						col:loc.col,
						player:playerNum
					};
					connection.moveList.push(moveData);					

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
	let index=0;
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
	connection.update.set("pause");
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
		let promoteData={
			val:key,
			row:promote.row,
			col:promote.col,
			player:playerNum,
			promote:true
		};
		connection.moveList.push(promoteData);
		// promotePawn(key);
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

function promoteRecieved(promoteData) {
	pause=false;
	connection.update.set(null);
	promote=board.get(promoteData.row,promoteData.col).piece;
	promotePawn(promoteData.val);
}

function shouldRotate() {
	return playerNum==1;
}