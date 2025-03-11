class Buildings{
    constructor(x, y, w, h, roofStyle, cols, rows){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.roofStyle = roofStyle;
        this.cols = cols;
        this.rows = rows;
    }

    draw(){
        fill(50); // building = grey
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