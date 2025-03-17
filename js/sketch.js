// sketch.js 

let canvasContainer;
let color = 0;

let sliders = [];
let sliderValues = [];

let buttons = [];

const sliderIncrease = 5;
const sliderDecay = 20;
let sliderDecayTimer = sliderDecay;

let emojisActive = [];

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
let fireSound;
let thunderSound;
let emojiSound = [4];
let emojiPan;
let firePan;

let buildings = []; //array for buildings 
let totalWindows = 0;
let windowsOff = 0;
let windowsProjectedOff = 0; //The amount of windows that should be off depending on the sleep slider value
let ground;
let puddles = [];

let xLightning1 = 0;
let xLightning2 = 0;
let yLightning1 = 0;
let yLightning2 = 0;

let strikeThreshold = 90;
let lightningCooldown = 20;

let walkSprites;
let umbrellaOpeningSprites;
let umbrellaWalkSprites;
const SPRITE_COLUMNS = 4; // Adjust based on your sprite sheet
const SPRITE_ROWS = 4; // Adjust if needed
let frameTimer = 0;
let frameIndex = 0;
let spriteWidth, spriteHeight;
let walkers = [];
let walkerSpeedMultiplier = 1;
let minimumWalkerSpeed = 0.4;

let burningSprites = [];
const MAX_BURNING_SPRITES = 1;
const BURNING_SPRITE_COLUMNS = 2;
const BURNING_SPRITE_SCALE = 0.7;
let burningFrameTimer = 0;
let burningFrameIndex = 0;

let fires = [];
let noiseOffset = 0;

let activeRaindrops = 0;
let activationTimes = [];

let boundaryCrossings = new Array(numDiscs).fill(0); // Add this line to initialize the boundary crossings counter

let lastWorkCount = 0;
let lastSleepCount = 0;
let lastTherapyCount = 0;
let lastMedicationCount = 0;

let noRainTimer = 0; // Timer to track duration without rain
let rainCheckTimer = 0;

const medicineThreshold = 75;
const colorIncrement = 0.2;
const maxOverlayAlpha = 200;
let overlayAlpha = 0;

function setupSliders() {
    // sliders.push(document.getElementById("slider1")); // 0 = Work Slider
    // sliders.push(document.getElementById("slider2")); // 1 = Sleep Slider
    // sliders.push(document.getElementById("slider3")); // 2 = Therapy Slider
    // sliders.push(document.getElementById("slider4")); // 4 = Medication Slider

    for (let i = 0; i < 4; i++) {
        // sliderValues.push(sliders[i].value);
        // sliders[i].oninput = function() {
        //     sliderValues[i] = this.value;
        //     //console.log("Slider " + (i + 1) + " value: " + sliderValues[i]);
        // }
        sliderValues[i] = 50;
    }
}

function setupButtons() {
    buttons.push(document.getElementById("button1"));
    buttons.push(document.getElementById("button2"));
    buttons.push(document.getElementById("button3"));
    buttons.push(document.getElementById("button4"));

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", () => {
            //sliders[i].value = int(sliders[i].value) + sliderIncrease;

            sliderValues[i] = int(sliderValues[i]) + sliderIncrease;
            if (sliderValues[i] > 100) sliderValues[i] = 100;
            emojisActive.push(new Emojis(i));
            if(!emojiSound[i].isPlaying()){
                emojiPan = map(emojisActive[emojisActive.length-1].pos, 0, width, -.8, .8)
                emojiSound[i].pan(emojiPan);
                emojiSound[i].play();
            }
            console.log(sliderValues[i]);
        })
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
    fireSound = loadSound('./assets/fireSound.mp3');
    thunderSound = loadSound('./assets/thunderSound.mp3');
    emojiSound[0] = loadSound('./assets/workSound.mp3');
    emojiSound[1] = loadSound('./assets/sleepSound.mp3');
    emojiSound[2] = loadSound('./assets/therapySound.mp3');
    emojiSound[3] = loadSound('./assets/medSound.mp3');
    walkSprites = loadImage('./assets/walkSprites.png');
    umbrellaOpeningSprites = loadImage('./assets/umbrellaspritesopening.png');
    umbrellaWalkSprites = loadImage('./assets/umbrellasprites.png');
    burningSpriteImage = loadImage('./assets/burningSprite.png');
}

function setup() {
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container");
    setupSliders();
    setupButtons();
    // Initialize particles
    let randomX = 0, randomY = 0;
    let ctr = numDiscs;
    let noiseOffset = 0;
    while (ctr >= 0) {
        randomX = random(width);
        randomY = random(height, height + 400);
        velocities.push(createVector((-5 + random(10)) * 0.96, (-5 + random(10)) * 0.34));
        deltaCtrs.push(0);
        deltas.push(createVector(0.0, 0.0));
        positions.push(createVector(randomX, randomY));
        oldPositions.push(createVector(0, 0));
        activationTimes.push(noise(noiseOffset) * 1000); // Perlin noise for activation time
        noiseOffset += 0.1;
        ctr -= 1;
    }
    
    spriteWidth = walkSprites.width / SPRITE_COLUMNS;
    spriteHeight = walkSprites.height / SPRITE_ROWS;
    generateWalkers();

    ground = height - 60; // ground line position
    generateBuildings(); // generate buildings only once at startup
    
    windSound.setVolume(.3);
    
    for (let i = 0; i < 10; i++) {
        let puddle = {
            x: random(width),
            width: random(20, 100),
        };
        puddles.push(puddle);
    }
}

function generateWalkers() {
    walkers = walkers.filter(walker => walker.x >= -20 && walker.x <= width + 20); // Keep only onscreen walkers

    let totalWalkers = 8;
    let totalSliderValue = sliderValues.reduce((a, b) => a + b, 0);

    // Calculate the required number of walkers for each slider
    let requiredWorkCount = totalSliderValue > 0 ? floor((sliderValues[0] / totalSliderValue) * totalWalkers) : lastWorkCount;
    let requiredSleepCount = totalSliderValue > 0 ? floor((sliderValues[1] / totalSliderValue) * totalWalkers) : lastSleepCount;
    let requiredTherapyCount = totalSliderValue > 0 ? floor((sliderValues[2] / totalSliderValue) * totalWalkers) : lastTherapyCount;
    let requiredMedicationCount = totalSliderValue > 0 ? totalWalkers - requiredWorkCount - requiredSleepCount - requiredTherapyCount : lastMedicationCount;

    // Update the last counts
    if (totalSliderValue > 0) {
        lastWorkCount = requiredWorkCount;
        lastSleepCount = requiredSleepCount;
        lastTherapyCount = requiredTherapyCount;
        lastMedicationCount = requiredMedicationCount;
    }

    // Count the current number of walkers for each slider
    let currentWorkCount = walkers.filter(walker => walker.colorIndex === 0).length;
    let currentSleepCount = walkers.filter(walker => walker.colorIndex === 1).length;
    let currentTherapyCount = walkers.filter(walker => walker.colorIndex === 2).length;
    let currentMedicationCount = walkers.filter(walker => walker.colorIndex === 3).length;

    // Helper function to create a walker
    function createWalker(colorIndex) {
        let direction = random() > 0.5 ? 1 : -1;
        let walker = {
            x: random() > 0.5 ? random(-10, -20) : random(width + 20, width+10),
            y: height - 40,
            speed: random(1, 2) * direction,
            flipped: direction === -1,
            colorIndex: colorIndex,
            alive: true,
            respawnTimer: 0,
            hasUmbrella: false,
            umbrellaOpening: false,
            umbrellaFrameIndex: 0,
            umbrellaFrameTimer: 0,
        };
        walkers.push(walker);
    }

    // Adjust the number of walkers for each slider
    while (currentWorkCount < requiredWorkCount && walkers.length < totalWalkers) {
        createWalker(0); // Work Slider (first row)
        currentWorkCount++;
    }
    while (currentSleepCount < requiredSleepCount && walkers.length < totalWalkers) {
        createWalker(1); // Sleep Slider (second row)
        currentSleepCount++;
    }
    while (currentTherapyCount < requiredTherapyCount && walkers.length < totalWalkers) {
        createWalker(2); // Therapy Slider (third row)
        currentTherapyCount++;
    }
    while (currentMedicationCount < requiredMedicationCount && walkers.length < totalWalkers) {
        createWalker(3); // Medication Slider (fourth row)
        currentMedicationCount++;
    }

    // Remove excess walkers if necessary
    walkers = walkers.filter(walker => {
        if (!walker.alive) {
            if (walker.colorIndex === 0 && currentWorkCount > requiredWorkCount) {
                currentWorkCount--;
                return false;
            }
            if (walker.colorIndex === 1 && currentSleepCount > requiredSleepCount) {
                currentSleepCount--;
                return false;
            }
            if (walker.colorIndex === 2 && currentTherapyCount > requiredTherapyCount) {
                currentTherapyCount--;
                return false;
            }
            if (walker.colorIndex === 3 && currentMedicationCount > requiredMedicationCount) {
                currentMedicationCount--;
                return false;
            }
        }
        return true;
    });
}

function spawnBurningSprites() {
    // Remove dead burning sprites
    burningSprites = burningSprites.filter(sprite => sprite.alive);

    // Check if we need to spawn new burning sprites
    if (fires.length > 2 && burningSprites.length < MAX_BURNING_SPRITES) {
        if (random() < 0.5) { // 50% chance to spawn
            let direction = random() > 0.5 ? 1 : -1;
            let burningSprite = {
                x: random() > 0.5 ? random(-15, -20) : random(width + 20, width + 15),
                y: height - 55,
                speed: random(5, 8) * direction,
                flipped: direction === -1,
                alive: true
            };
            burningSprites.push(burningSprite);
        }
    }
}

function generateBuildings() {
    buildings = []; // clear any existing buildings
    let x = 10; // X position for the first building
    
    // generates buildings for entire width
    while (x < width - 50) {
        let w = random(40, 120); // random width for buildings
        let h = random(80, 300); // random height for buildings
        let roofStyle = int(random(6)); // random roof style
        
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
    for (let building of buildings) {
        totalWindows += building.windows.length;
    }
    windowsProjectedOff = int((sliderValues[1] / 100) * totalWindows);
    while (windowsOff != windowsProjectedOff) {
        handleLights();
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
    let rainOnScreen = false;

    if (strikeChance() > strikeThreshold) {
        if (lightningCooldown == 0) {
            lightningFlash();
            //thunderSound.setPitch(random(.1, .9));
            thunderSound.play();
            lightningCooldown = int(random(5, 20));
        } else {
            lightningCooldown--;
            setGloomyBackground();
        }
    } else {
        setGloomyBackground();
    }

    for (let fire of fires) {
        fire.update();
        fire.draw();
    }
    
    fires = fires.filter(f => f.lifeSpan > 0);

    stroke(0); // building outline = black
    strokeWeight(3); 

    handleLights(); // handle building lights

    for (let building of buildings) {
        if (sliderValues[3] > medicineThreshold)
            reduceColor(building);
        else
            replenishColor(building);
        building.draw();
    }
    
    wind = map(sliderValues[3], 0, 100, -2, 2); // Medication slider controls wind
    gravity = map(sliderValues[2], 0, 50, 9.8, 0.5); // Therapy slider controls intensity (inverted scale for more therapy = less intensity)
    gravity = max(gravity, 0.5);
    
    windPan = map(sliderValues[3], 0, 100, .8, -.8); // Medication slider controls wind, affect pan of wind
    rainVolume = map(sliderValues[2], 0, 100, 1, 0); // Therapy slider controls intensity, affects volume of rain
    
    if (rainCheckTimer % 60 == 0) { // Check for rain only once every second (assuming 60 FPS)
        rainOnScreen = drawRainParticles();
    }
    else
    {
        drawRainParticles();
    }
    rainCheckTimer++;

    stroke(0);
    
    // draw ground line
    fill(20, 25, 30);
    rect(0, ground, width, height - ground);
    noStroke();
    // Add puddle reflections
    for (let i = 0; i < puddles.length; i++) {
        let puddle = puddles[i];
        fill(100, 120, 150, 40);
        //fill(50, 50, 255, 20);
        ellipse(puddle.x, ground + 15, puddle.width, puddle.width / 4);
    }
    stroke(0);
    // Draw emojis
    for (let i = 0; i < emojisActive.length; i++) {
        emojisActive[i].update();
        emojisActive[i].draw();
        if (!emojisActive[i].active) {
            emojisActive.splice(i, 1); // remove emoji if not active
            i--;
        }
    }

    // Spawn and draw burning sprites
    spawnBurningSprites();
    for (let burningSprite of burningSprites) {
        if (!burningSprite.alive) continue;
        burningSprite.x += burningSprite.speed;
        if (burningSprite.x < -25 || burningSprite.x > width + 25) burningSprite.alive = false;
        drawBurningSprite(burningSprite);
    }

    walkerSpeedMultiplier = map(sliderValues[0], 0, 100, minimumWalkerSpeed, 2); // Work slider controls speed of walkers

    drawWalkers(rainOnScreen);
    generateWalkers();
    windSound.pan(windPan,.5);
    rainSound.setVolume(rainVolume,.5);

    sliderDecayTimer--;
    if (sliderDecayTimer == 0) {
        for (let i = 0; i < sliderValues.length; i++) {
            //sliders[i].value = int(sliders[i].value) - 1;
            if (sliderValues[i] > 0)
                sliderValues[i] = int(sliderValues[i]) - 1;
        }
        sliderDecayTimer = sliderDecay;
    }

    // Gradually activate raindrops
    if (activeRaindrops < numDiscs) {
        activeRaindrops += 1;
    }

    if (sliderValues[3] > 75)
        increaseOverlay();
    else
        reduceOverlay();
}

function handleLights() {
    windowsProjectedOff = int((sliderValues[1] / 100) * totalWindows);
    if (windowsProjectedOff > totalWindows) windowsProjectedOff = totalWindows; // Clamp to total windows
    if (windowsOff < windowsProjectedOff) {
        windowsOff++;
        let tempBuilding = random(buildings);
        while (tempBuilding.windowsOff >= tempBuilding.windows.length) {
            tempBuilding = random(buildings);
        }
        tempBuilding.disableWindow();
    }
    else if (windowsOff > windowsProjectedOff) {
        windowsOff--;
        let tempBuilding = random(buildings);
        while (tempBuilding.windowsOff <= 0) {
            tempBuilding = random(buildings);
        }
        tempBuilding.enableWindow();
    }
}

function setGloomyBackground() {
    drawingContext.fillStyle = 'rgb(30, 30, 50)';  // Dark gray with a bit of blue for mood
    rect(0, 0, width, height);

    // Calculate brightness based on sleep slider value
    let brightness = map(sliderValues[1], 0, 100, 130, 30);

    // gradient for the sky 
    let gradient = drawingContext.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgb(30, 30, 50)');  // Top of the sky
    gradient.addColorStop(1, `rgb(${brightness}, ${brightness}, ${brightness + 20})`);  // Bottom of the sky, closer to the horizon
    drawingContext.fillStyle = gradient;
    rect(0, 0, width, height);
}

function drawPuddles() {
    for (let i = 0; i < puddles.length; i++) {
        let puddle = puddles[i];
        fill(100, 120, 150, 20); // Light blue color with transparency for reflections
        ellipse(puddle.x, ground + 5, puddle.width, puddle.width / 4);
    }
}

function drawRainParticles() {
    let allowRespawning = gravity > 1;
    let rainOnScreen = false;

    // Randomly select a % of the raindrops for collision resolution
    let selectedRaindrops = [];
    for (let i = 0; i < activeRaindrops; i++) {
        if (Math.random() < 0.7) {
            selectedRaindrops.push(i);
        }
    }

    for (let i = 0; i < activeRaindrops; i++) {
        if (frameCount < activationTimes[i]) continue; // Skip raindrop if not yet activated

        oldPositions[i].x = positions[i].x;
        oldPositions[i].y = positions[i].y;

        if (positions[i].y <= height + 200) {
            positions[i].x = oldPositions[i].x + timeStep * velocities[i].x + timeStep * wind;
            positions[i].y = oldPositions[i].y + timeStep * velocities[i].y + gravity * timeStep;
        }

        velocities[i].x *= 0.97;
        velocities[i].y *= 0.96;
        velocities[i].x = constrain(velocities[i].x, -1000, 1000);
        velocities[i].y = constrain(velocities[i].y, 0, 1000);

        deltas[i].x = 0.0;
        deltas[i].y = 0.0;
        deltaCtrs[i] = 0;

        // Only resolve collisions for selected raindrops
        if (selectedRaindrops.includes(i)) {
            for (let j = 0; j < numDiscs; j++) {
                if (i !== j) {
                    if (positions[i].y < height) {
                        resolveParticleCollisions(i, j);
                    }
                }
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

        // Check for collision with walkers
        for (let walker of walkers) {
            if (!walker.hasUmbrella && dist(positions[i].x, positions[i].y, walker.x, walker.y) < radius + spriteWidth / 2) {
                walker.umbrellaOpening = true;
            }
        }

        if (positions[i].y > height + 200) {
            if (allowRespawning) {
                positions[i].y = random(-200, -50);
                positions[i].x = random(width);
                velocities[i].y = random(1, 3);
                boundaryCrossings[i] = 0; // Reset boundary crossings counter on respawn
            } else {
                activationTimes[i] = (noise(noiseOffset) * 1000)+ frameCount;
                noiseOffset += random(0.1,-0.1);
            }
        }

        if (positions[i].x < -10 || positions[i].x > width + 10) {
            boundaryCrossings[i]++;
            if (boundaryCrossings[i] > 3) {
                positions[i].y = random(height + 100, height + 190);
                positions[i].x = random(width);
                velocities[i].y = 0;
                velocities[i].x = 0;
                boundaryCrossings[i] = 0; // Reset boundary crossings counter on respawn
            } else {
                if (positions[i].x < -10) {
                    positions[i].x = width + 10;
                } else if (positions[i].x > width + 10) {
                    positions[i].x = -10;
                }
            }
        }

        if (positions[i].y > height) {
            velocities[i].y = max(velocities[i].y, 0);
        }

        // Check if any raindrop is on screen
        if (positions[i].y > 0 && positions[i].y < height) {
            rainOnScreen = true;
        }
    }

    return rainOnScreen;
}

function strikeChance() {
    let workWeight = int(random(0, sliderValues[0])) / 4;
    let sleepWeight = int(random(100 - sliderValues[1], 100)) / 4;
    let therapyWeight = int(random(100 - sliderValues[2], 100)) / 4;
    let medWeight = int(random(100 - sliderValues[3], 100)) / 4;

    return workWeight + sleepWeight + therapyWeight + medWeight;
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
        strokeWeight(random(2, 6));
        line(xLightning1, yLightning1, xLightning2, yLightning2);
    }
    noStroke();
    // Check if lightning strikes a building
    for (let building of buildings) {
        if (xLightning2 > building.x && xLightning2 < building.x + building.w) {
            if (random() < 0.5) { // 50% chance to spawn fire
                fires.push(new Fire(xLightning2, building.y));
                firePan = map(xLightning2, 0, width, -.8, .8);
                fireSound.pan(firePan);
                fireSound.play();
            }
        }
    }
}

function drawWalkers(rainOnScreen) {
    frameTimer++;
    if (frameTimer > 10) { // Adjust for animation speed
        frameIndex = (frameIndex + 1) % SPRITE_COLUMNS;
        frameTimer = 0;
    }

    if (!rainOnScreen) {
        noRainTimer++;
    } else {
        noRainTimer = 0;
    }

    for (let walker of walkers) {
        if (!walker.alive) continue;
        walker.x += walker.speed * walkerSpeedMultiplier;
        if (walker.x < -20) walker.alive= false; 
        if (walker.x > width + 20) walker.alive= false;

        let spriteX, spriteY;

        if (walker.umbrellaOpening) {
            walker.umbrellaFrameTimer++;
            if (walker.umbrellaFrameTimer > 10) { // Adjust for animation speed
                walker.umbrellaFrameIndex++;
                walker.umbrellaFrameTimer = 0;
            }
            if (walker.umbrellaFrameIndex >= SPRITE_COLUMNS) {
                walker.umbrellaOpening = false;
                walker.hasUmbrella = true;
                walker.umbrellaFrameIndex = SPRITE_COLUMNS - 1; // Set to last frame for closing animation
            }
            spriteX = walker.umbrellaFrameIndex * spriteWidth;
            spriteY = walker.colorIndex * spriteHeight;
            drawSprite(walker, umbrellaOpeningSprites, spriteX, spriteY);
        } else if (walker.hasUmbrella) {
            if (noRainTimer > 120) { // 2 seconds without rain (assuming 60 FPS)
                walker.umbrellaFrameTimer++;
                if (walker.umbrellaFrameTimer > 10) { // Adjust for animation speed
                    walker.umbrellaFrameIndex--;
                    walker.umbrellaFrameTimer = 0;
                }
                if (walker.umbrellaFrameIndex < 0) {
                    walker.hasUmbrella = false;
                    walker.umbrellaFrameIndex = 0;
                }
                spriteX = walker.umbrellaFrameIndex * spriteWidth;
                spriteY = walker.colorIndex * spriteHeight;
                drawSprite(walker, umbrellaOpeningSprites, spriteX, spriteY);
            } else {
                spriteX = frameIndex * spriteWidth;
                spriteY = walker.colorIndex * spriteHeight;
                drawSprite(walker, umbrellaWalkSprites, spriteX, spriteY);
            }
        } else {
            spriteX = frameIndex * spriteWidth;
            spriteY = walker.colorIndex * spriteHeight;
            drawSprite(walker, walkSprites, spriteX, spriteY);
        }
    }
}

function drawSprite(walker, spriteSheet, spriteX, spriteY) {
    push();
    translate(walker.x, walker.y);
    if (walker.flipped) {
        scale(-1, 1);
        image(spriteSheet, -spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight, spriteX, spriteY, spriteWidth, spriteHeight);
    } else {
        image(spriteSheet, -spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight, spriteX, spriteY, spriteWidth, spriteHeight);
    }
    pop();
}

function drawBurningSprite(burningSprite) {
    burningFrameTimer++;
    if (burningFrameTimer > 2) { // Adjust for animation speed
        burningFrameIndex = (burningFrameIndex + 1) % BURNING_SPRITE_COLUMNS;
        burningFrameTimer = 0;
    }

    let spriteX = burningFrameIndex * spriteWidth;
    let spriteY = 0; // Only one row

    push();
    translate(burningSprite.x, burningSprite.y);
    scale(BURNING_SPRITE_SCALE);
    if (burningSprite.flipped) {
        scale(-1, 1);
        image(burningSpriteImage, -spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight, spriteX, spriteY, spriteWidth, spriteHeight);
    } else {
        image(burningSpriteImage, -spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight, spriteX, spriteY, spriteWidth, spriteHeight);
    }
    pop();
}

function reduceColor(building) {
    let buildingColor = building.bldgColor;
    for (let i = 0; i < buildingColor.length; i++) {
        if (buildingColor[i] < 120) buildingColor[i] += colorIncrement;
        else if (buildingColor[i] > 120) buildingColor[i] -= colorIncrement;
    }
    building.bldgColor = buildingColor;
}

function replenishColor(building) {
    let buildingColor = building.bldgColor;
    let originalColor = building.origColor;
    for (let i = 0; i < buildingColor.length; i++) {
        if (buildingColor[i] < originalColor[i]) buildingColor[i] += colorIncrement;
        else if (buildingColor[i] > originalColor[i]) buildingColor[i] -= colorIncrement;
    }
    building.bldgColor = buildingColor;
}

function increaseOverlay() {
    if (overlayAlpha < maxOverlayAlpha) overlayAlpha += colorIncrement;
    fill(120, 120, 120, overlayAlpha);
    rect(0, 0, width, height);
}

function reduceOverlay() {
    if (overlayAlpha > 0) overlayAlpha -= colorIncrement;
    fill(120, 120, 120, overlayAlpha);
    rect(0, 0, width, height);
}

function windowResized() {
    resizeCanvas(canvasContainer.width(), canvasContainer.height());
    //ground = height - 60; // update ground position
    //generateBuildings(); // regenerate buildings when window resized
}