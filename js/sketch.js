// sketch.js 

let canvasContainer;
let color = 0;

let sliders = [];
let sliderValues = [];

let velocities = [], deltaCtrs = [], deltas = [], frameRateVals = [];
let oldPositions = [], positions = [];
let numDiscs = 1042;
let radius = 3;
let diameter = radius * 1.5;
let timeStep = 0.01;
let wind = 0.0;
let gravity = 0.9;

let windSound;
let rainSound;

let buildings = []; //array for buildings 
let ground;

let xLightning1 = 0;
let xLightning2 = 0;
let yLightning1 = 0;
let yLightning2 = 0;

let strikeThreshold = 90;
let lightningCooldown = 20;

function setupSliders() {
    sliders.push(document.getElementById("slider1")); // 0 = Work Slider
    sliders.push(document.getElementById("slider2")); // 1 = Sleep Slider
    sliders.push(document.getElementById("slider3")); // 2 = Therapy Slider
    sliders.push(document.getElementById("slider4")); // 4 = Medication Slider
    sliders.push(document.getElementById("slider5")); // 5 = Diet Slider
    sliders.push(document.getElementById("slider6")); // 6 = Exercise Slider

    for (let i = 0; i < sliders.length; i++) {
        sliderValues.push(sliders[i].value);
        sliders[i].oninput = function() {
            sliderValues[i] = this.value;
            //console.log("Slider " + (i + 1) + " value: " + sliderValues[i]);
        }
    }
}

function resolveParticleCollisions(idxA, idxB) {
    let xa = positions[idxA].x, xb = positions[idxB].x;
    let ya = positions[idxA].y, yb = positions[idxB].y;
    let normalDirX = xa - xb;
    let normalDirY = ya - yb;
    let dist = sqrt(normalDirX * normalDirX + normalDirY * normalDirY);
    let overlapDistance = 2 * radius - dist;
    
    if (overlapDistance > 0 && dist > 0.001) {
        normalDirX /= dist;
        normalDirY /= dist;
        let moveAmount = overlapDistance / 2;
        positions[idxA].x += normalDirX * moveAmount;
        positions[idxA].y += normalDirY * moveAmount;
        positions[idxB].x -= normalDirX * moveAmount;
        positions[idxB].y -= normalDirY * moveAmount;

        let relativeVelocityX = velocities[idxA].x - velocities[idxB].x;
        let relativeVelocityY = velocities[idxA].y - velocities[idxB].y;
        let dotProduct = relativeVelocityX * normalDirX + relativeVelocityY * normalDirY;
        let impulse = dotProduct / 2;
        velocities[idxA].x -= impulse * normalDirX;
        velocities[idxA].y -= impulse * normalDirY * 1.9;
        velocities[idxB].x += impulse * normalDirX;
        velocities[idxB].y += impulse * normalDirY;
    }
}

function preload() {
    //sound loading
    windSound = loadSound('./assets/wind.mp3');
    rainSound = loadSound('./assets/rain.mp3');
}

function setup() {
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container");
    setupSliders();
    
    // Initialize particles
    let randomX = 0, randomY = 0;
    let ctr = numDiscs;
    while (ctr >= 0) {
        randomX = random(width);
        randomY = random(height, height + 400);
        velocities.push(createVector((-5 + random(10)) * 0.96, (-5 + random(10)) * 0.34));
        deltaCtrs.push(0);
        deltas.push(createVector(0.0, 0.0));
        positions.push(createVector(randomX, randomY));
        oldPositions.push(createVector(0, 0));
        ctr -= 1;
    }
    
    ground = height; // ground line position
    generateBuildings(); // generate buildings only once at startup
    
    windSound.setVolume(.3);
    //windSound.play();
    //windSound.loop(true);
    //rainSound.play();
    //rainSound.loop(true);
}

function generateBuildings() {
    buildings = []; // clear any existing buildings
    let x = 10; // X position for the first building
    
    // generates buildings for entire width
    while (x < width - 50) {
        let w = random(50, 100); // random width for buildings
        let h = random(100, 250); // random height for buildings
        let roofStyle = int(random(3)); // random roof style
        
        // store building data
        buildings.push( new Buildings(
            x,
            ground - h,
            w,
            h,
            roofStyle,
            int(random(2, 4)),
            int(random(3, 6))
            ));
        
        x += w + 10; // new x position: move to the right and adding spacing btwn buildings
    }
}

function mousePressed(){
    if(!rainSound.isPlaying()){
        //rainSound.play();
        rainSound.loop(true);
    }
    if(!windSound.isPlaying()){
        //windSound.play();
        windSound.loop(true);
    }
}

function draw() {
    clear();
    if (strikeChance() > strikeThreshold) {
        if (lightningCooldown == 0) {
            lightningFlash();
            lightningCooldown = int(random(5, 20));
        } else {
            lightningCooldown--;
            background(0);
        }
    } else background(0);

    stroke(0); // building outline = black
    strokeWeight(3); 
    for (let building of buildings) {
        building.draw();
    }
    
    wind = map(sliderValues[3], 0, 100, -2, 2); // Medication slider controls wind
    gravity = map(sliderValues[2], 0, 50, 9.8, 0.5); // Therapy slider controls intensity (inverted scale for more therapy = less intensity)
    gravity = max(gravity, 0.5);
    
    windPan = map(sliderValues[3], 0, 100, .8, -.8); // Medication slider controls wind, affect pan of wind
    rainVolume = map(sliderValues[2], 0, 100, 1, 0); // Therapy slider controls intensity, affects volume of rain
    
    let allowRespawning = gravity > 1;
    
    // Update and draw particles
    for (let i = 0; i < numDiscs; i++) {
        oldPositions[i].x = positions[i].x;
        oldPositions[i].y = positions[i].y;

        positions[i].x = oldPositions[i].x + timeStep * velocities[i].x + timeStep * wind;
        positions[i].y = oldPositions[i].y + timeStep * velocities[i].y + gravity * timeStep;
        
        velocities[i].x *= 0.97;
        velocities[i].y *= 0.96;
        velocities[i].x = constrain(velocities[i].x, -1000, 1000);
        //velocities[i].y = constrain(velocities[i].y, -100, 100);


        deltas[i].x = 0.0;
        deltas[i].y = 0.0;
        deltaCtrs[i] = 0;

        for (let j = 0; j < numDiscs; j++) {
            if (i !== j) {
                resolveParticleCollisions(i, j);
            }
        }
        
        if (deltaCtrs[i] > 0) {
            positions[i].x += 1.2 * deltas[i].x / deltaCtrs[i];
            positions[i].y += 1.2 * deltas[i].y / deltaCtrs[i];
        }

        velocities[i].x = 0.9999 * (positions[i].x - oldPositions[i].x) / timeStep;
        velocities[i].y = 0.9999 * (positions[i].y - oldPositions[i].y) / timeStep;
        stroke(0);
        strokeWeight(0.25);
        fill(110, 150, 255);
        ellipse(positions[i].x, positions[i].y, diameter, diameter);

        if (positions[i].y > height + 200) {
            if (allowRespawning) {
                
                positions[i].y = random(-200, -50);
                positions[i].x = random(width);
                velocities[i].y = random(1, 3);
            }
        }

        if (positions[i].x < -10) {
            positions[i].x = width + 10;
        } else if (positions[i].x > width + 10) {
            positions[i].x = -10;
        }
    }
    stroke(0);
    
    // draw ground line
    line(0, ground, width, ground);

    windSound.pan(windPan,.5);
    rainSound.setVolume(rainVolume,.5);

}

function strikeChance() {
    let workWeight = int(random(0, sliderValues[0])) / 6;
    let sleepWeight = int(random(100 - sliderValues[1], 100)) / 6;
    let therapyWeight = int(random(100 - sliderValues[2], 100)) / 6;
    let medWeight = int(random(100 - sliderValues[3], 100)) / 6;
    let dietWeight = int(random(100 - sliderValues[4], 100)) / 6;
    let exerciseWeight = int(random(100 - sliderValues[5], 100)) / 6;
    return workWeight + sleepWeight + therapyWeight + medWeight + dietWeight + exerciseWeight;
}

function lightningFlash() {
    background(100);
    xLightning2 = int(random(0, width));
    yLightning2 = 0;

    stroke(255, 255, random(0, 255));
    for (let i = 0; i < 50; i++) {
        xLightning1 = xLightning2;
        yLightning1 = yLightning2;
        xLightning2 += int(random(-20, 20));
        yLightning2 += int(random(5, 20));
        line(xLightning1, yLightning1, xLightning2, yLightning2);
    }
}

function windowResized() {
    resizeCanvas(canvasContainer.width(), canvasContainer.height());
    ground = height; // update ground position
    generateBuildings(); // regenerate buildings when window resized
}