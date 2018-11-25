let onlineButton,oneButton,twoButton;
let creditButton,settingsButton;
let canvas;
let credit=false;
let settings=false;

function setup() {
	rectMode(CENTER);
	noStroke();
	canvas=createCanvas(windowWidth, windowHeight);
	canvas.position(0,0);
	onlineButton=createButton("Play Online");
	onlineButton.position(.4609*width,0.4*height);
	let onlineLink=createA("Online/index.html","");
	onlineButton.parent(onlineLink);
	oneButton=createButton("One Player");
	oneButton.position(.4609*width,0.5*height);
	let oneLink=createA("OnePlayer/index.html","");
	oneButton.parent(oneLink);
	twoButton=createButton("Two Player");
	twoButton.position(.4609*width,0.6*height);
	let twoLink=createA("TwoPlayer/index.html","");
	twoButton.parent(twoLink);
	creditButton=createButton("Credits");
	creditButton.position(0.77*width,0.1*height);
	creditButton.mousePressed(function(){credit=!credit;});
	settingsButton=createButton("Settings");
	settingsButton.position(0.16*width,0.1*height);
	settingsButton.mousePressed(function(){settings=!settings;});
	let buttons=[onlineButton,oneButton,twoButton,creditButton,settingsButton];
	for(let button of buttons) {
		button.style("border: none");
		button.style("padding: 20px");
		button.style("font-size: 16px");
		button.style("border-radius: 70%");
	}
}

function draw() {
	background(0,191,255);
	fill(0);
	textSize(75);
	text("Chess!",0.4219*width,0.233*height);
	if(settings) {
		fill(255);
		rect(0.2*width,0.5*height,0.28*width,.6*height);
		fill(0);
		textSize(0.025*width);
		text("Settings coming soon!",0.08*width,0.5*height);
	}
	if(credit) {
		fill(255);
		rect(0.8*width,0.5*height,0.28*width,.6*height);
		fill(0);
		textSize(0.02*width);
		text("Coding by Moshe Goldberg",0.68*width,0.4*height);
		text("Graphics handled by p5.js",0.684*width,0.5*height);
		text("Assets from assorted places",0.679*width,0.6*height);
	}
}
