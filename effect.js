
class Effect {
    constructor(x, y) {
        var canvas = document.getElementById('effectcanvas');
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.y = y;
        this.index = 0;
        this.interval = setInterval(() => {
            this.ctx.clearRect(this.x, this.y, effect_size, effect_size);
            if (effect_sprites.length > this.index) {
                this.ctx.drawImage(effect_sprites[this.index], this.x, this.y);
            } else {
                clearInterval(this.interval);
            }
            this.index++;
        }, 50);
    }
}

class DeathEffect {
    constructor() {
        var canvas = document.getElementById('effectcanvas');
        this.ctx = canvas.getContext('2d');
        this.fill = 0;
        this.interval = setInterval(() => {
            this.ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            this.ctx.fillStyle = "black";
            this.ctx.globalAlpha = 0.9;
            if (this.fill < 1) {
                this.ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
                this.ctx.clearRect(0.5 * canvas.clientWidth * this.fill, 
                                   0.5 * canvas.clientHeight * this.fill, 
                                   canvas.clientWidth * (1-this.fill), 
                                   canvas.clientHeight * (1-this.fill));
            } else {
                clearInterval(this.interval);
                this.ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
                this.ctx.globalAlpha = 1;
                this.ctx.fillStyle = "Crimson";
                this.ctx.font = "40px sans-serif";
                var you_died = "You were killed by " + game.player.last_instigator.description;
                this.ctx.fillText(you_died, 0.5 * canvas.clientWidth - this.ctx.measureText(you_died).width * 0.5, 0.5 * canvas.clientHeight - 50);
                this.ctx.font = "20px sans-serif";
                var score = "Score: " + game.score;
                this.ctx.fillText(score, 0.5 * canvas.clientWidth - this.ctx.measureText(score).width * 0.5, 0.5 * canvas.clientHeight);
                state = StateEnum.End;
            }
            this.fill += 0.05;
        }, 30);
    }
}


function clearEffects() {
    var canvas = document.getElementById('effectcanvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}

