// sketch.js 

let canvasContainer;
let color = 0;

let sliders = [];

function setupSliders() {
    sliders.push(document.getElementById("slider1"));
    sliders.push(document.getElementById("slider2"));
    sliders.push(document.getElementById("slider3"));

    for (let i = 0; i < sliders.length; i++) {
        sliders[i].oninput = function() {
            console.log("Slider " + (i + 1) + " value: " + this.value);
        }
    }
}

function setup() {
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container");

    setupSliders();
}


// 
function draw() {
    color += 1;
    background(color % 255);
}