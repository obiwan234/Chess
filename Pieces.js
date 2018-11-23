function Pawn(startRow,startCol) {
	this.value=0;
 	this.row=startRow;
 	this.col=startCol;
 	this.doubleFrontedLife=0;
 	this.updateMoves=function() {
 		this.validMoves=[];
 		let front=this.position.getRelative(this.direction,0);
 		if(front&&!front.piece) {
 			let frontMove=new Move(this.position,front);
 			this.validMoves.push(frontMove);
 			if(this.totalMoves==0) {
 				let doubleFront=this.position.getRelative(this.direction*2,0);
				if(!doubleFront.piece) {
					let doubleMove=new Move(this.position,doubleFront);
					doubleMove.extraSteps=function() {
						this.movedPiece.doubleFrontedLife=1;
					}
					doubleMove.extraUndo=function() {
						this.movedPiece.doubleFrontedLife=0;
					}
 					this.validMoves.push(doubleMove);
 				}
 			}
 		}
 		let diagLeft=this.position.getRelative(this.direction,-1);
 		let diagRight=this.position.getRelative(this.direction,1);
 		let diagonalList=[diagLeft,diagRight];
 		for(let diag of diagonalList) {
 			if(diag&&diag.piece&&diag.piece.player!=this.player) {//if enemy
				let diagMove=new Move(this.position,diag)
				this.validMoves.push(diagMove);
			}	
 		}
		//en passant move
		let leftSide=this.position.getRelative(0,-1);
		let rightSide=this.position.getRelative(0,1);
		let sideList=[leftSide,rightSide];
		for(let side of sideList) {
			if(side&&side.piece&&side.piece.doubleFrontedLife==1&&side.piece.player!=this.player) {
				let sideMove=new Move(this.position,diagonalList[sideList.indexOf(side)],side.piece);
				this.validMoves.push(sideMove);
			}
		}
		if(this.row==7-this.player.startRow-this.direction) {
			for(let move of this.validMoves) {
				move.extraSteps=function(source) {
					if(source=="player") {
						promote=this.movedPiece;
					} else {
						this.movedPiece.become=Pieces[4];
						this.movedPiece.become(this.endLoc.row,this.endLoc.col);
						this.movedPiece.img=this.movedPiece.player.pieceImageList[4];
					}
				}
				move.extraUndo=function(source) {
					this.movedPiece.become=Pieces[0];
					this.movedPiece.become(this.endLoc.row,this.endLoc.col);
					this.movedPiece.img=this.movedPiece.player.pieceImageList[0];
				}
			}
		}
 	}
}
function Bishop(startRow,startCol) {
	this.value=1;
	this.row=startRow;
	this.col=startCol;
	this.updateMoves=function() {
		this.validMoves=[];
		let diagUp=board.getDiagonal(this.row,this.col,1);
		let diagDown=board.getDiagonal(this.row,this.col,-1);
		let diagList=[diagUp,diagDown];
		for(let currList of diagList) {
			let selfIndex=this.findLocationIndex(currList)
			for(let i=selfIndex-1; i>=0; i--) {
				if(!currList[i].piece) {
					this.validMoves.push(new Move(this.position,currList[i]));
				}else {
					if(currList[i].piece.player!=this.player) {
						this.validMoves.push(new Move(this.position,currList[i]));
					}
					break;
				}
			}
			for(let i=selfIndex+1; i<currList.length; i++) {
				if(!currList[i].piece) {
					this.validMoves.push(new Move(this.position,currList[i]));
				}else {
					if(currList[i].piece.player!=this.player) {
						this.validMoves.push(new Move(this.position,currList[i]));
					}
					break;
				}
			}
		}
	}
}
function Knight(startRow,startCol) {
	this.value=2;
	this.row=startRow;
	this.col=startCol;
	this.updateMoves=function() {
		this.validMoves=[];
		let knightMoves=[this.position.getRelative(2,1),
					this.position.getRelative(2,-1),
					this.position.getRelative(1,2),
					this.position.getRelative(1,-2),
					this.position.getRelative(-1,2),
					this.position.getRelative(-1,-2),
					this.position.getRelative(-2,1),
					this.position.getRelative(-2,-1)];
		for(let move of knightMoves) {
			if(move&&(!move.piece||move.piece.player!=this.player)) {
				this.validMoves.push(new Move(this.position,move));
			}
		}
	}
}
function Rook(startRow,startCol) {
	this.value=3;
	this.row=startRow;
	this.col=startCol;
	this.updateMoves=function() {
		this.validMoves=[];
		let horizontal=board.getHorizontal(this.row);
		let vertical=board.getVertical(this.col);
		let straightList=[horizontal,vertical];
		for(let currList of straightList) {
			let selfIndex=this.findLocationIndex(currList);
			for(let i=selfIndex-1; i>=0; i--) {
				if(!currList[i].piece) {
					this.validMoves.push(new Move(this.position,currList[i]));
				}else {
					if(currList[i].piece.player!=this.player) {
						this.validMoves.push(new Move(this.position,currList[i]));
					}
					break;
				}
			}
			for(let i=selfIndex+1; i<currList.length; i++) {
				if(!currList[i].piece) {
					this.validMoves.push(new Move(this.position,currList[i]));
				}else {
					if(currList[i].piece.player!=this.player) {
						this.validMoves.push(new Move(this.position,currList[i]));
					}
					break;
				}
			}
		}
	}
}
function Queen(startRow,startCol) {
	this.value=4;
	this.row=startRow;
	this.col=startCol;
	this.updateMoves=function() {
		this.validMoves=[];
		let diagUp=board.getDiagonal(this.row,this.col,1);
		let diagDown=board.getDiagonal(this.row,this.col,-1);
		let horizontal=board.getHorizontal(this.row);
		let vertical=board.getVertical(this.col);
		let directionList=[diagUp,diagDown,horizontal,vertical];
		for(let currList of directionList) {
			let selfIndex=this.findLocationIndex(currList)
			for(let i=selfIndex-1; i>=0; i--) {
				if(!currList[i].piece) {
					this.validMoves.push(new Move(this.position,currList[i]));
				}else {
					if(currList[i].piece.player!=this.player) {
						this.validMoves.push(new Move(this.position,currList[i]));
					}
					break;
				}
			}
			for(let i=selfIndex+1; i<currList.length; i++) {
				if(!currList[i].piece) {
					this.validMoves.push(new Move(this.position,currList[i]));
				}else {
					if(currList[i].piece.player!=this.player) {
						this.validMoves.push(new Move(this.position,currList[i]));
					}
					break;
				}
			}
		}
	}
}
function King(startRow,startCol) {
	this.value=5;
	this.row=startRow;
	this.col=startCol;
	this.updateMoves=function() {
		this.validMoves=[];
		let kingMoves=[this.position.getRelative(-1,-1),
					this.position.getRelative(-1,0),
					this.position.getRelative(-1,1),
					this.position.getRelative(0,-1),
					this.position.getRelative(0,1),
					this.position.getRelative(1,-1),
					this.position.getRelative(1,0),
					this.position.getRelative(1,1)];
		for(let kingSide of kingMoves) {
			if(kingSide&&(!kingSide.piece||kingSide.piece.player!=this.player)) {
				this.validMoves.push(new Move(this.position,kingSide));
			}
		}
		//castling
		if(this.totalMoves==0&&!this.player.updateCheck()) {
			let kingRow=this.board.grid[this.row];
			let blocked=[false,false];
			let side=0;
			for(let i=1; i<7; i++) {
				let piece=kingRow[i].piece;
				if(piece&&piece.value!=5) {
					blocked[side]=true;
				}
				if(piece&&piece.value==5) {
					side=1;
				}
			}
			let rooks=[kingRow[0].piece,kingRow[7].piece];
			for(let i=0; i<2; i++) {
				if(rooks[i]&&rooks[i].value==3&&rooks[i].totalMoves==0&&!blocked[i]) {
					let dir=(i-.5)*2;//swap from 0 and 1 to -1 and 1
					let passedPos=this.position.getRelative(0,dir);
					let testMove=new Move(this.position,passedPos);
					testMove.execute("computer");
					//playerList[1-this.player.num].updateAllMoves();
					let permission=!this.player.updateCheck();
					testMove.undo();
					if(permission) {
						this.addCastle(rooks[i],dir);
					}
				}
			}
		}
	}
	this.addCastle=function(rook,dir) {
		let rookMove=new Move(rook.position,this.position.getRelative(0,dir));
		let kingMove=new Move(this.position,this.position.getRelative(0,2*dir),false,rookMove);
		kingMove.extraSteps=function(source) {
			this.extra.execute(source);
		}
		kingMove.extraUndo=function() {
			this.extra.undo();
		}
		this.validMoves.push(kingMove);
	}
}
function Move(startLoc,endLoc,attackedPiece,extra) {
	this.startLoc=startLoc;
	this.endLoc=endLoc;
	this.movedPiece=startLoc.piece;
	this.killedPiece=endLoc.piece;
	if(attackedPiece) {
		this.killedPiece=attackedPiece;
		this.origEndPiece=endLoc.piece;
	}
	this.extra=extra;
	this.execute=function(source) {
		if(this.killedPiece) {
			this.killedPiece.die();
		}
		this.movedPiece.position=this.endLoc;
		this.endLoc.piece=this.movedPiece;
		this.startLoc.piece=false;
		this.movedPiece.row=this.endLoc.row;
		this.movedPiece.col=this.endLoc.col;
		this.movedPiece.totalMoves++;
		if(this.extraSteps) {
			this.extraSteps(source);
		}
	}
	this.undo=function() {
		if(this.extraUndo) {
			this.extraUndo();
		}
		this.movedPiece.row=this.startLoc.row;
		this.movedPiece.col=this.startLoc.col;
		this.startLoc.piece=this.movedPiece;
		this.movedPiece.position=this.startLoc;
		if(this.killedPiece) {
			this.killedPiece.deathCertificate.revive();
			this.killedPiece.deathCertificate=false;
			this.killedPiece.player.pieces.splice(0,0,this.killedPiece);
			this.killedPiece.position.piece=this.killedPiece;
			if(attackedPiece) {
				this.endLoc.piece=this.origEndPiece;
			}
		} else {
			this.endLoc.piece=false;
		}
		this.movedPiece.totalMoves--;
	}
	this.equals=function(start, end) {
		return this.startLoc==start&&this.endLoc==end;
	}
}
function initialize(board,player) {
	this.totalMoves=0;
	this.board=board;
	this.player=player;
	this.direction=this.player.direction;//white is negative;
	this.position=this.board.get(this.row,this.col);
	this.position.piece=this;
	this.position.player=this.player.num;
	this.position.status=0;
	this.validMoves=[];
	this.img=this.player.pieceImageList[this.value];
}
function display(loc) { 
	loc=loc.currLoc();
	let x=loc.x;
	let y=loc.y;
	let w=loc.boxWidth;
	let h=loc.boxHeight;
	image(this.img,x,y,w,h);	
}
function move(loc,source) {
	if(source&&source=="computer") {
		source="computer";
	} else {
		source="player";
	}
	let couldMove=this.canMoveTo(loc);
	if(couldMove){
		couldMove.execute(source);
		return couldMove;
	}
}
function highlightMoves() {
	for(let move of this.validMoves) {
		move.endLoc.highlight(color(255,255,0,150),0);
	}
}
function canMoveTo(loc) {
	for(let move of this.validMoves) {
		if(move.equals(this.position,loc)) {
			return move;
		}
	}
	return false;
}
function findLocationIndex(list) {
	for(let i=0; i<list.length; i++) {
		if(board.get(this.row,this.col).equals(list[i])) {
			return i;
		}
	}
}
function die() {
	for(let i=0; i<this.player.pieces.length; i++) {
		if(this.player.pieces[i]==this) {
			this.player.pieces.splice(i,1);
		}
		this.position.piece=false;
	}
	this.deathCertificate=new DeadPiece(this.player.num,this.value);
}
function validateMoves() {
	for(let i=this.validMoves.length-1; i>=0; i--) {
		let move=this.validMoves[i];
		move.execute("computer");
		playerList[1-this.player.num].updateAllMoves();
		if(this.player.updateCheck()) {
			this.validMoves.splice(i,1);
		}
		move.undo();
	}
	this.player.updateCheck();
}
function getValue() {
	let valueList=[1,3,3,5,7,20];
 	return valueList[this.value];
}
let PieceNames=["Pawn","Bishop","Knight","Rook","Queen","King"]
let Pieces=[Pawn,Bishop,Knight,Rook,Queen,King];
for(let piece of Pieces) {
	piece.prototype.initialize=initialize;
	piece.prototype.display=display;
	piece.prototype.move=move;
	piece.prototype.highlightMoves=highlightMoves;
	piece.prototype.canMoveTo=canMoveTo;
	piece.prototype.findLocationIndex=findLocationIndex;
	piece.prototype.die=die;
	piece.prototype.validateMoves=validateMoves;
	piece.prototype.getValue=getValue;
}
