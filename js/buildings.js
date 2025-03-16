class Buildings{
    constructor(x, y, w, h, roofStyle, cols, rows){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.roofStyle = roofStyle;
        this.cols = cols;
        this.rows = rows;
        this.windowsOff = 0;
        this.windows = [];
        this.setupWindows();
        this.buildingColor = this.getRandomDarkColor();
        this.originalColor = this.buildingColor;
    }

    setupWindows(){
        let winW = this.w / this.cols * 0.6; // window width 
        let winH = this.h / this.rows * 0.6; // window height 
        let paddingX = (this.w - this.cols * winW) / (this.cols + 1); // horizontal padding
        let paddingY = (this.h - this.rows * winH) / (this.rows + 1); // vertical padding
        for (let i = 0; i < this.cols; i++){
            for (let j = 0; j < this.rows; j++){
                let wx = this.x + paddingX + i * (winW + paddingX); // X position
                let wy = this.y + paddingY + j * (winH + paddingY); // Y position
                this.windows.push(new Window(wx, wy, winW, winH)); // add window to the list
            }
        }
    }
    disableWindow() {
        let randomIndex = int(random(this.windows.length)); // select a random window
        while (!this.windows[randomIndex].active) { // if the window is already inactive, select another one
            randomIndex = int(random(this.windows.length));
        }
        this.windowsOff++;
        this.windows[randomIndex].active = false; // set the window to inactive
    }

    enableWindow(){
        let randomIndex = int(random(this.windows.length)); // select a random window
        while (this.windows[randomIndex].active) { // if the window is already active, select another one
            randomIndex = int(random(this.windows.length));
        }
        this.windowsOff--;
        this.windows[randomIndex].active = true; // set the window to active
    }
    

    getRandomDarkColor() {
        let stormyColors = [
            [44, 62, 80],   // Dark Blue-Gray
            [43, 43, 43],   // Deep Charcoal Gray
            [74, 63, 88],   // Muted Purple
            [47, 66, 62],   // Dark Desaturated Green
            [50, 50, 50],   // Classic Dark Gray
            [30, 30, 40],   // Almost Black with a Blue Tint
        ];

        ////less grey option 
        // let stormyColors = [
        //     [44, 62, 80],   // Dark Blue-Gray 
        //     [74, 63, 88],   // Muted Purple 
        //     [47, 66, 62],   // Dark Desaturated Green 
        //     [58, 48, 78],   // Deep Indigo-Purple
        //     [72, 54, 80],   // Muted Plum 
        //     [40, 55, 71],   // Deep Teal-Blue 
        //     [60, 50, 70],   // Dusty Violet 
        // ];
        
        return random(stormyColors); //selects a random color from the list
    }

    draw(){
        //fill(50); // building = grey
        fill(this.buildingColor[0], this.buildingColor[1], this.buildingColor[2]); 
        rect(this.x, this.y, this.w, this.h); // draw rectangle building
        
        // different rooftop styles (can add more later)
        if (this.roofStyle === 0) {
            // triangle roof
            triangle(this.x, this.y, this.x + this.w / 2, this.y - 20, this.x + this.w, this.y);
        } else if (this.roofStyle === 1) {
            // rectangle roof
            rect(this.x + this.w * 0.25, this.y - 20, this.w * 0.5, 20);
        } else if (this.roofStyle === 2) {
            // no roof
            line(this.x, this.y, this.x + this.w, this.y);
        } else if (this.roofStyle === 3) {
            // slanted roof 
            quad(this.x, this.y, this.x + this.w, this.y - 15, this.x + this.w, this.y, this.x, this.y);
        } else if (this.roofStyle === 4) {
            // dome roof
            arc(this.x + this.w / 2, this.y, this.w * 0.8, this.w * 0.4, PI, 0, CHORD);
        } else if (this.roofStyle === 5) {
            // flat overhang 
            rect(this.x - 5, this.y - 10, this.w + 10, 10);
        }
        this.drawWindows();
    }

    drawWindows(){
        for (let win of this.windows){
            win.draw(); // draw the window
        }
    }

    get bldgColor() {
        return this.buildingColor;
    }

    set bldgColor(color) {
        this.buildingColor = color;
    }

    get origColor() {
        return this.originalColor;
    }
}

class Window {
    constructor(x, y, w, h){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.active = true;
    }

    draw(){
        fill(200, 150, 50);// window = yellow
        if (!this.active) fill(150, 150, 150); // grey if inactive
        rect(this.x, this.y, this.w, this.h); // draw the window
    }
}

class Fire {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.lifeSpan = 200; // Fire duration
        this.smokeParticles = [];
        this.noiseOffset = random(100);
    }

    update() {
        this.lifeSpan--;
        if (this.lifeSpan > 0) {
            this.smokeParticles.push(new Smoke(this.x, this.y)); // Smoke spawns exactly above fire
        }
        this.smokeParticles = this.smokeParticles.filter(p => p.lifeSpan > 0);
    }

    draw() {
        for (let smoke of this.smokeParticles) {
            smoke.update();
            smoke.draw();
        }
        if (this.lifeSpan > 0) {
            let fireShakeX = random(-4, 4); // More violent shaking
            let fireShakeY = random(-4, 4);

            textSize(30); // Bigger fire emoji
            textAlign(CENTER, CENTER);
            text("🔥", this.x + fireShakeX, this.y + fireShakeY);
        }
    }
}

class Smoke {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = random(15, 25);
        this.lifeSpan = 100;
        this.noiseOffset = random(100);
    }

    update() {
        this.y -= 1; // Keep the original slow upward movement
        this.x += map(noise(this.noiseOffset), 0, 1, -1, 1); // Subtle horizontal movement
        this.size *= 0.97;
        this.lifeSpan--;
        this.noiseOffset += 0.1;
    }

    draw() {
        fill(150, 150, 150, map(this.lifeSpan, 0, 100, 0, 255));
        noStroke();
        ellipse(this.x, this.y - this.size / 2, this.size, this.size); // Smoke aligns properly above fire
    }
}
