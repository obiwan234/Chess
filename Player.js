function Player(num,direction,board,pieceImageList) {
	this.board=board;
	this.num=num;
	this.direction=direction;
	this.startRow=(this.direction-1)*-3.5;
	this.pieceImageList=pieceImageList;
	this.isInCheck=false;
	this.initializePieces=function() {
		this.pieces=[];
		for(let i=0; i<8; i++) {
			this.pieces.push(new Pawn(this.startRow+this.direction,i));
		}
		this.pieces.push(new Rook(this.startRow,0));
		this.pieces.push(new Rook(this.startRow,7));
		this.pieces.push(new Knight(this.startRow,1));
		this.pieces.push(new Knight(this.startRow,6));
		this.pieces.push(new Bishop(this.startRow,2));
		this.pieces.push(new Bishop(this.startRow,5));
		this.pieces.push(new Queen(this.startRow,3));
		this.king=new King(this.startRow,4);
		this.pieces.push(this.king);
		for(piece of this.pieces) {
			piece.initialize(this.board,this);
		}
	}
	this.updateAllMoves=function() {
		for(let piece of this.pieces) {
			piece.updateMoves();
		}
		this.updateCheck();
	}
	this.validate=function() {
		for(let piece of this.pieces) {
			piece.validateMoves();
		}
	}
	this.updateCheck=function() {
		this.isInCheck=false;
		let enemy=playerList[1-this.num];
		for(let enemyPiece of enemy.pieces) {
			if(enemyPiece.canMoveTo(this.king.position)) {
				this.isInCheck=true;
			}
		}
		return this.isInCheck;
	}
	this.getAllMoves=function() {
		let total=[];
		for(let piece of this.pieces) {
			for(let move of piece.validMoves) {
				total.push(move);
			}
		}
		return total;
	}
	this.endPassants=function() {
		for(let piece of this.pieces) {
			if(piece instanceof Pawn&&piece.doubleFrontedLife) {
				piece.doubleFrontedLife++;
			}
		}
	}
	this.rePassant=function() {
		for(let piece of this.pieces) {
			if(piece instanceof Pawn) {
				piece.doubleFrontedLife--;
			}
		}	
	}
	this.getScore=function() {
		sum=0;
		for(let piece of this.pieces) {
			sum+=piece.getValue();
		}
		if(checkMate==this.num) {
			sum=-100;
		}
		if(checkMate==1-this.num) {
			sum=100;
		}
		return sum;
	}
}
