// Walk height for set positions correctly in both CSS and JS
let walkImageHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--imgsize'));

// Footsteps
let walkReverb = new Tone.Reverb().toDestination();
walkReverb.wet.value = .2;
walkReverb.decay.value = 1.5;
let walkStepSounds = [
	"s01-01",
	"s01-02",
	"s01-03",
	"s01-04",
	"s01-05",
	"s01-06",
	"s01-07",
	"s01-08",
	"s01-09",
	"s01-10",
	"s01-11",
	"s02-01",
	"s02-02",
	"s02-03",
	"s02-04",
	"s02-05",
	"s02-06",
	"s02-07",
	"s02-08",
	"s02-09",
	"s03-01",
	"s03-02",
	"s03-03",
	"s03-04",
	"s03-05",
	"s03-06",
	"s03-07",
	"s03-08",
	"s03-09",
	"s03-10",
	"s03-11",
	"s03-12",
	"s04-01",
	"s04-02",
	"s04-03",
	"s04-04",
	"s04-05",
	"s04-06",
	"s05-01",
	"s05-02",
	"s05-03",
	"s05-04",
	"s05-05",
	"s05-06",
	"s05-07",
	"s05-08",
	"s05-09",
	"s05-10",
	"s05-11",
	"s05-12"
];
let walkStepSamplers = {}
for (let sound of walkStepSounds) {
	walkStepSamplers[sound] = new Tone.Sampler({
		urls: {
			C3: `${sound}.mp3`
		},
		baseUrl: "sound/",
		volume: -10,
	}).toDestination();
}
function walkPlayStep(sound) {
	let pitch = Math.random()*50+110;
	if (sound == "random") {
		sound = walkStepSounds[Math.floor(Math.random()*walkStepSounds.length)];
	} else if (sound == 's01') {
		sound = walkStepSounds[Math.floor(Math.random()*11)];
	} else if (sound == 's02') {
		sound = walkStepSounds[Math.floor(Math.random()*9+11)];
	} else if (sound == 's03') {
		sound = walkStepSounds[Math.floor(Math.random()*12+20)];
	} else if (sound == 's04') {
		sound = walkStepSounds[Math.floor(Math.random()*6+32)];
	} else if (sound == 's05') {
		sound = walkStepSounds[Math.floor(Math.random()*12+38)];
	}
	walkStepSamplers[sound].triggerAttackRelease(pitch, 1);
}

// Image selection
const imgGroundRanges = {
	boardwalk2: 223,
	grass1: 117,
	pier2: 214,
	beach3: 150,
	alley2: 132,
	carpet1: 123,
	garage2: 260,
	wood1: 45,
	stones1: 149,
	stones2: 93,
	stones3: 124,
	sidewalk1: 221,
	sidewalk2: 172,
	sidewalk3: 345,
	sidewalk4: 190,
	sidewalk5: 147,
	sidewalk6: 110,
	sidewalk7: 131,
	sidewalk8: 85,
	sidewalk9: 244,
}
let activePath = "trail1";
let activeGround = "boardwalk2";
let stepPath = 0;
let stepGround = 0;
let walkSound = Math.floor(Math.random()*5+1);
function pickImage() {
	stepGround += Math.floor(Math.random()*5+1);
	if (stepGround >= imgGroundRanges[activeGround] || Math.random() > .95) {
		activeGround = Object.keys(imgGroundRanges)[Math.floor(Math.random()*Object.keys(imgGroundRanges).length)];
		stepGround = 0;
		walkSound = Math.floor(Math.random()*5+1);
	}
	return `imgs/${activeGround}/${activeGround}-${stepGround}.jpg`;
}

// Take step forward and add new step to DOM
let walkSteps = document.querySelector(".walk-steps");
let walkStepCount = 0; // total steps taken so far
let stepRotation = 0;
let stepPosition = 0;
let rotation = Math.floor(Math.random()*360);
function walkStepNext() {
	walkPlayStep('s0'+walkSound);
	walkStepCount++;

	// Create nodes for new step image
	let imgContainer = document.createElement("div");
	imgContainer.classList = "walk-steps-child";
	let img = new Image();
	img.classList = "walk-steps-child-img";

	// Add image to the container
	imgContainer.appendChild(img);

	// Set initial properties for new step image/container
	imgContainer.style.opacity = 0;
	imgContainer.style.transform = `translateY(${-walkImageHeight*2}vh)`;
	imgContainer.style.zIndex = 9;
	imgContainer.dataset.pos = 0;
	let newImg = pickImage();
	img.src = newImg;
	stepRotation += Math.round(Math.random()*10-5);
	stepPosition += stepRotation*2;
	if (stepPosition > 75) {
		stepRotation -= 10;
		stepPosition = 75;
	} else if (stepPosition < -75) {
		stepRotation += 10;
		stepPosition = -75;
	}
	img.style.transform = `rotate(${stepRotation}deg) translate(${-50+stepPosition}%, -50%)`;

	// Add finished node to live div
	walkSteps.appendChild(imgContainer);

	// Animate transform by adding delay
	setTimeout(() => {
		imgContainer.style.opacity = 1;
		imgContainer.style.transform = `translateY(0vh)`;
	}, 50)

	// Style and position previous steps
	for (let step of walkSteps.childNodes) {
		if (step != imgContainer && parseInt(step.dataset.pos) < 1) {
			step.style.filter = `brightness(${100+(step.dataset.pos-1)*10}%) grayscale(${(step.dataset.pos-1)*-30}%)`;
			step.style.zIndex = `0`;

			// Adjust step position and set transform
			step.dataset.pos = parseInt(step.dataset.pos) - 1;
			step.style.transform = `translateY(${-walkImageHeight*step.dataset.pos*.8}vh)`;

			// Remove step if over 25 steps ago
			if (parseInt(step.dataset.pos) <= -25) {
				step.remove();
			}
		}
	}

	rotation += 1;
	walkSteps.style.transform = `rotate(${rotation}deg)`;
}

// Take step backward and remove previous step from DOM
function walkStepPrev() {
	// Base edge case
	if (!walkSteps.querySelector("[data-pos='0']")) {
		return
	}

	walkPlayStep('s0'+walkSound);
	walkStepCount++;

	// Remove most recently added node
	let lastAdded = walkSteps.querySelector("[data-pos='0']");
	walkStepRemove(lastAdded);

	// Style and position steps
	for (let step of walkSteps.childNodes) {
		if (step != lastAdded) {
			step.style.filter = `brightness(30%) grayscale(100%)`;
			step.style.zIndex = `0`;
	
			// Adjust step position and set transform
			step.dataset.pos = parseInt(step.dataset.pos) + 1;
			step.style.transform = `translateY(${-walkImageHeight*step.dataset.pos*.8}vh)`;
		}
	}

	// Highlight new featured step
	let newHighlight = walkSteps.querySelector("[data-pos='0']");
	if (newHighlight != null) {
		newHighlight.style.filter = "brightness(100%) grayscale(0%)";
		newHighlight.style.zIndex = 9;
	}

	rotation--;
	walkSteps.style.transform = `rotate(${rotation}deg)`;
}

// Remove step from stack
function walkStepRemove(step) {
	step.dataset.pos = 1;
	step.style.transform = step.style.transform + `translateY(${-walkImageHeight}vh) rotate(${Math.random()*90-45}deg) scale(0.8)`;
	step.style.filter = "brightness(30%) grayscale(100%) blur(10px)";
	step.style.opacity = 0;
	step.style.zIndex = 0;
	setTimeout(() => {
		step.remove();
	}, 650);
}

let body = document.querySelector("body");
body.addEventListener("keydown", checkKey);
function checkKey(e) {
    if (e.keyCode == '38') { // up arrow
		walkStepNext();
    }
    else if (e.keyCode == '40') { // down arrow
		walkStepPrev();
    }
    else if (e.keyCode == '37') { // left arrow
    }
    else if (e.keyCode == '39') { // right arrow
    }
}

let speed = Math.random()*3000+50
setInterval(() => {
	walkStepNext();
}, 500)