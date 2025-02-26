// sketch.js 

let canvasContainer;
let color = 0;

function setup() {
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container");
}


// 
function draw() {
    color += 1;
    background(color % 255);
}