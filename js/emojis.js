//This class will spawn an emoji on the top of the screen and it will fall downwards in a side to side manor
class Emojis{
    constructor(emojiID){
        this.emojiID = emojiID;
        this.emojiText = this.emojiIDtoEmoji(emojiID);
        this.active = true;

        this.x = random(0, width);
        this.y = -10;

        this.speed = random(2, 2.5); // falling speed
        this.xSpeed = random(-1.5, 1.5); // side to side speed

        this.tick = 0;
        this.tickInterval = int(random(20, 50)); // interval for side to side movement

        this.groundSurvivalTime = 80; // time in ticks before emoji disappears
        this.groundCounter = 0; // counter for ground survival time
        this.breakAfterTime = this.emojiIDtoAutoBreak(emojiID);
    }

    emojiIDtoEmoji(emojiID){
        if (emojiID == 0) return "💻";
        if (emojiID == 1) return "💤";
        if (emojiID == 2) return "🗓️"; // Consider switching to 📅📆🗓️ any of these
        if (emojiID == 3) return "💊";
        else return "💩"; // If you get poop, something went wrong
    }

    emojiIDtoAutoBreak(emojiID){ // returns true if emoji should break after time (easily changeable)
        if (emojiID == 0) return false;
        if (emojiID == 1) return true;
        if (emojiID == 2) return true;
        if (emojiID == 3) return false;
        else return true;
    }

    get pos(){
        return this.x;
    }

    draw(){
        textSize(30);
        if (this.active) text(this.emojiText, this.x, this.y);
        if (this.x < 0 || this.x > width){
            console.log("Emoji out of bounds!");
        } 
    }

    update(){
        this.tick++;
        if (this.y >= height - 50){
            this.y = height - 50;
            this.groundCounter++;
            let multiplier = 1;
            if (!this.breakAfterTime) multiplier = 3;
            if (this.groundCounter >= this.groundSurvivalTime * multiplier){
                this.active = false; // emoji disappears after 30 ticks on ground   
            }
            
        }
        else{
            if (this.tick % this.tickInterval == 0){
                this.xSpeed *= -1; // reverse direction every 30 ticks
                if (this.x + this.xSpeed * this.tickInterval < 0){
                    this.xSpeed = abs(this.xSpeed); // move right if out of bounds
                }
                else if (this.x + this.xSpeed * this.tickInterval > width){
                    this.xSpeed = -abs(this.xSpeed); // move left if out of bounds
                }
            }
            this.y += this.speed;
            this.x += this.xSpeed; // side to side movement
        }
    }
    
}