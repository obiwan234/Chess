let onlineButton,oneButton,twoButton;
let canvas;

function setup() {
	canvas=createCanvas(windowWidth, windowHeight);
	canvas.position(0,0);
	onlineButton=createButton("Play Online");
	onlineButton.position(windowWidth/2-60,5*windowHeight/10-15);
	let onlineLink=createA("Online/index.html","");
	onlineButton.parent(onlineLink);
	oneButton=createButton("One Player");
	oneButton.position(windowWidth/2-60,6*windowHeight/10-15);
	let oneLink=createA("OnePlayer/index.html","");
	oneButton.parent(oneLink);
	twoButton=createButton("Two Player");
	twoButton.position(windowWidth/2-60,7*windowHeight/10-15);
	let twoLink=createA("TwoPlayer/index.html","");
	twoButton.parent(twoLink);
}

function draw() {
	background(255);
	fill(0);
	textSize(75);
	text("Chess!",width/2-120,height/5);
}
