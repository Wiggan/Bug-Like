
class Effect {
    constructor(x, y) {
        var canvas = document.getElementById('effectcanvas');
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.y = y;
        this.index = 0;
        this.interval = setInterval(() => {
            this.ctx.clearRect(this.x, this.y, 40, 40);
            if (effect_sprites.length > this.index) {
                this.ctx.drawImage(effect_sprites[this.index], this.x, this.y);
            } else {
                clearInterval(this.interval);
            }
            this.index++;
        }, 50);
    }
}