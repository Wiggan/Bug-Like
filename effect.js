
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
            this.ctx.globalAlpha = 1;
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
                this.ctx.font = "40px Courier New";
                var you_died = "You were killed by " + game.player.last_instigator.description;
                this.ctx.fillText(you_died, 0.5 * canvas.clientWidth - this.ctx.measureText(you_died).width * 0.5, 0.5 * canvas.clientHeight - 50);
                this.ctx.font = "20px Courier New";
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


class LevelUpEffect {
    constructor() {
        var canvas = document.getElementById('effectcanvas');
        this.ctx = canvas.getContext('2d');
        this.fill = 0;
        this.text_displayed_time = 0;
        this.interval = setInterval(() => {
            this.ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            this.ctx.fillStyle = "Gold";
            this.ctx.globalAlpha = 0.2;
            if (this.fill < 1) {
                this.ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
                this.ctx.clearRect(0.5 * canvas.clientWidth * this.fill, 
                                   0.5 * canvas.clientHeight * this.fill, 
                                   canvas.clientWidth * (1-this.fill), 
                                   canvas.clientHeight * (1-this.fill));
                this.fill += 0.05;
            } else if (this.text_displayed_time++ < 100){
                this.ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
                this.ctx.globalAlpha = 1;
                this.ctx.fillStyle = "Black";
                this.ctx.font = "40px Courier New";
                var text = "Level Up!";
                this.ctx.fillText(text, 0.5 * canvas.clientWidth - this.ctx.measureText(text).width * 0.5, 0.5 * canvas.clientHeight - 50);
            } else {
                clearInterval(this.interval);
            }
        }, 10);
    }
}

class RespawnEffect {
    constructor() {
        var canvas = document.getElementById('effectcanvas');
        this.ctx = canvas.getContext('2d');
        this.fill = 0;
        this.text_displayed_time = 0;
        this.interval = setInterval(() => {
            this.ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            this.ctx.fillStyle = "black";
            this.ctx.globalAlpha = 1;
            if (this.fill < 1) {
                this.ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
                this.ctx.clearRect(0.5 * canvas.clientWidth * this.fill, 
                    0.5 * canvas.clientHeight * this.fill, 
                    canvas.clientWidth * (1-this.fill), 
                    canvas.clientHeight * (1-this.fill));
                this.fill += 0.05;
            }  else if (this.text_displayed_time++ < 100){
                this.ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
                this.ctx.fillStyle = "Crimson";
                this.ctx.font = "40px Courier New";
                var you_died = "You were killed by " + game.player.last_instigator.description;
                this.ctx.fillText(you_died, 0.5 * canvas.clientWidth - this.ctx.measureText(you_died).width * 0.5, 0.5 * canvas.clientHeight - 50);
                this.ctx.font = "20px Courier New";
                var text = "You were saved by your life line...";
                this.ctx.fillText(text, 0.5 * canvas.clientWidth - this.ctx.measureText(text).width * 0.5, 0.5 * canvas.clientHeight);
            } else {
                game.current_room = game.first_room;
                game.player.x = 4;
                game.player.y = 4;
                game.player.heal(game.player.max_health);
                game.player.is_respawning = false;
                update();
                draw();
                clearInterval(this.interval);
            }
        }, 30);
    }
}