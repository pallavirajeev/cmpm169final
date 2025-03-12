class Buildings{
    constructor(x, y, w, h, roofStyle, cols, rows){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.roofStyle = roofStyle;
        this.cols = cols;
        this.rows = rows;

        this.buildingColor = this.getRandomDarkColor();
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
        let winW = this.w / this.cols * 0.6; // window width 
        let winH = this.h / this.rows * 0.6; // window height 
        let paddingX = (this.w - this.cols * winW) / (this.cols + 1); // horizontal padding
        let paddingY = (this.h - this.rows * winH) / (this.rows + 1); // vertical padding
        
        fill(200, 150, 50);// window = yellow
        for (let i = 0; i < this.cols; i++) { 
            for (let j = 0; j < this.rows; j++) { 
                let wx = this.x + paddingX + i * (winW + paddingX); // X position
                let wy = this.y + paddingY + j * (winH + paddingY); // Y position
                rect(wx, wy, winW, winH); // draw the window
            }
        }
    }


}