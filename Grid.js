function Location(grid,row,col,x,y,boxWidth,boxHeight,spacing) {
	this.grid=grid;
	this.row=row;
	this.col=col;
	this.boxWidth=boxWidth;
	this.boxHeight=boxHeight;
	this.x=x;
	this.y=y;
	this.spacing=spacing;
	this.midpointX=this.x+(this.boxWidth/2);
	this.midpointY=this.y+(this.boxHeight/2);
	this.piece=false;
	this.currLoc=function() {
		if(/*currPlayer==1&&rotateOn*/shouldRotate()) {
			return this.grid.get(7-this.row,7-this.col);
		}
		return this;
	}
	this.isEmpty=function() {
		return this.status==-1&&this.player==-1;
	}
	this.printLocation=function() {
		if(this.piece) {
			this.piece.display(this);
		}
	}
	this.highlight=function(fillColor, strokeWeight) {
		fill(255);
		noStroke();
		if(fillColor) {
			fill(fillColor);
		}
		if(strokeWeight) {
			strokeWeight(strokeWeight);
		}
		let loc=this.currLoc();
		rect(loc.x,loc.y,loc.boxWidth-loc.spacing,loc.boxHeight-loc.spacing);
	}
	this.contains=function(xPoint,yPoint) {
		let loc=this.currLoc();	
		if(xPoint>loc.x&&yPoint>loc.y&&xPoint<loc.x+loc.boxWidth-loc.spacing
			&&yPoint<loc.y+loc.boxHeight-loc.spacing) {
			return true;
		}
		return false;
	}
	this.equals=function(other) {
		let loc=this;
		if(loc.x==other.x&&loc.y==other.y) {
			return true;
		}
		return false;
	}
	
	this.getRelative=function(rowAdd,colAdd) {
		return grid.get(this.row+rowAdd,this.col+colAdd);
	}
}

function Grid(rows,cols,boxWidth,boxHeight,canvasWidth,canvasHeight,spacing) {
	this.rows=rows;
	this.cols=cols;
	this.boxWidth=boxWidth;
	this.boxHeight=boxHeight;
	this.width=canvasWidth;
	this.height=canvasHeight;
	this.paddingX=(this.width-(this.boxWidth*this.cols))/2;
	this.paddingY=(this.height-(this.boxHeight*this.rows))/2;
	this.grid=[];
	noStroke();
	for(let i=0; i<this.rows; i++) {
		this.grid[i]=[];
		for(let j=0; j<this.cols; j++) {
			let x=this.paddingX+(j*this.boxWidth);
			let y=this.paddingY+(i*this.boxHeight);
			this.grid[i][j]=new Location(this,i,j,x,y,this.boxWidth,this.boxHeight,spacing);
		}
	}
	this.get=function(row,col) {
		if(!this.isValidLocation(row,col)) {
			return false;
		}
		return this.grid[row][col];
	}
	this.printGrid=function() {
		for(let i=0; i<this.rows; i++) {
			for(let j=0; j<this.cols; j++) {
				this.get(i,j).printLocation();
			}
		}
	}
	this.findLocation=function(x,y) {
		for(let i=0; i<rows; i++) {
			for(let j=0; j<cols; j++) {
				if(this.get(i,j).contains(x,y)) {
					return this.get(i,j);
				}
			}
		}
		return false;
	}
	this.isValidLocation=function(row,col) {
		if(row>=rows||col>=cols||row<0||col<0)
		{
			return false;
		}
		return true;
	}
	this.getBaseCase=function(row,col,direction) {
		while(this.isValidLocation(row+1,col-direction))
		{
			row++;
			col-=direction;
		}
		return [row,col];
	}
	this.getVertical=function(col) {
		let vertCoord=[];
		for(let i=0; i<rows; i++) {
			vertCoord[i]=this.get(i,col);
		}
		return vertCoord;
	}
	this.getHorizontal=function(row) {
		let horCoord=[];
		for(let j=0; j<cols; j++) {
			horCoord[j]=this.get(row,j);
		}
		return horCoord;
	}
	this.getDiagonal=function(row,col,direction) {
		let baseCoord=this.getBaseCase(row,col,direction);
		let baseRow=baseCoord[0];
		let baseCol=baseCoord[1];
		let diagCoord=[];
		while(this.isValidLocation(baseRow,baseCol)) {
			diagCoord[diagCoord.length]=this.get(baseRow,baseCol);
			baseRow--;
			baseCol+=direction
		}
		return diagCoord;
	}
}