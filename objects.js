

class Object {
    constructor(sprite, x, y, description) {
        this.x = x;
        this.y = y;
        this.size = object_size;
        this.description = description;
        this.sprite = sprite;
    }

    drawInfoBox(ctx) {
        ctx.save();
        ctx.fillStyle = "rgba(150, 120, 120, 0.7)";
        ctx.strokeStyle = "rgba(50, 20, 20, 0.7)";
        ctx.lineWidth = 10;
        ctx.font = "20px sans-serif";
        var measure = ctx.measureText(this.description);
        var padding = 20;
        ctx.translate(this.size / 2, this.size / 2);
        ctx.translate(-padding, -padding);
        ctx.translate(-measure.width / 2, 0);
        ctx.fillRect(0, 0, measure.width + padding * 2, padding * 2);
        ctx.strokeRect(0, 0, measure.width + padding * 2, padding * 2);
        ctx.fillStyle = "black";
        ctx.fillText(this.description, padding, padding + 5);
        ctx.restore();
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x * object_size, this.y * object_size);
        ctx.drawImage(this.sprite, 0, 0);
        if (showInfo) {
            this.drawInfoBox(ctx);
        }
        ctx.restore();
    }
}

class Rock extends Object {
    constructor(x, y) {
        super(obstacle_sprite, x, y, 'Rock');
    }
}

class Buff extends Object {
    constructor(sprite, x, y, description) {
        super(sprite, x, y, description);
    }
}

class HP extends Buff {
    constructor(x, y) {
        super(hp_sprite, x, y, '+20 health');
    }

    pickUp() {
        game.player.heal(20);
    }
}

class MaxHP extends Buff {
    constructor(x, y) {
        super(max_hp_sprite, x, y, '+20 max health');
    }

    pickUp() {
        game.player.max_health += 20;
        game.player.heal(20);
    }
}

class DMG extends Buff {
    constructor(x, y) {
        super(dmg_sprite, x, y, '+10 damage');
    }

    pickUp() {
        game.player.damage += 10;
    }
}

class Range extends Buff {
    constructor(x, y) {
        super(range_sprite, x, y, '+1 range');
    }

    pickUp() {
        game.player.range++;
    }
}

class Actor extends Object {
    constructor(sprite, x, y, description, max_health) {
        super(sprite, x, y, description);
        this.max_health = max_health;
        this.health = max_health;
        this.show_health = false;
    }

    takeDamage(amount) {
        this.health -= amount;
        this.show_health = true;
    }

    draw(ctx) { 
        Object.prototype.draw.call(this,ctx);
        if (this.show_health) {
            ctx.save();
            ctx.translate(this.x * object_size, this.y * object_size);
            this.drawHealthBar(ctx);
            ctx.restore();
            this.show_health = false;
        }
    }

    drawHealthBar(ctx) {
        ctx.save();
        ctx.fillStyle = "Crimson";
        ctx.fillRect(0, 0, object_size, 10);
        ctx.fillStyle = "OliveDrab";
        ctx.fillRect(0, 0, Math.max(0, object_size * this.health / this.max_health), 10);
        ctx.restore();
    }

    drawInfoBox(ctx) {
        Object.prototype.drawInfoBox.call(this,ctx);
        this.drawHealthBar(ctx);
    }
}

class Player extends Actor {
    constructor() {
        super(player_sprite, 4, 4, "You: Lucanus Cervus", 1);
        this.damage = 10;
        this.range = 1;
        this.initiative = 10;
    }
    
    heal(amount) {
        this.health = Math.min(this.max_health, this.health + amount);
        this.show_health = true;
    }
}

class Monster extends Actor {
    constructor(room, sprite, x, y, desciption, max_health, aggro_range, speed, damage) {
        super(sprite, x, y, desciption, max_health);
        this.aggro_range = aggro_range;
        this.range = 1;
        this.initiative = 20;
        this.room = room;
        this.speed = speed;
        this.damage = damage;
    }

    distanceToPlayer() {
        //return Math.max(Math.abs(this.x - player.x), Math.abs(this.y - player.y));
        return Math.abs(this.x - game.player.x) + Math.abs(this.y - game.player.y);
    }

    update() {
        if (this.health <= 0) { return; }
        if (this.distanceToPlayer() <= this.aggro_range) {
            console.log("Got aggro!");
            var moved = 0;
            //while (moved < this.speed && this.distanceToPlayer() > 1) {
            if ( this.distanceToPlayer() > 1) {
                var x_step = Math.sign(this.x - game.player.x);
                if (isMoveValid(this.x - x_step, this.y)) {
                    this.x -= x_step
                    moved += Math.abs(x_step);
                }
            }
            if ( this.distanceToPlayer() > 1) {
                if (moved < this.speed) { 
                    var y_step = Math.sign(this.y - game.player.y);
                    if (isMoveValid(this.x, this.y - y_step)) {
                        this.y -= y_step
                        moved += Math.abs(y_step);
                    }
                }
            }
        }
        // Compare initative, so that if player is faster than monster, monster never hits player if it dies 
        // due to the damage inflicted by the player.
        var distance = this.distanceToPlayer();
        if (this.initiative > game.player.initiative) {
            if (this.health > 0 && distance <= this.range) {
                game.player.takeDamage(this.damage);
            }
        }
        if (distance <= game.player.range) {
            this.takeDamage(game.player.damage);
        }
        if (this.initiative <= game.player.initiative) {
            if (this.health > 0 && distance <= this.range) {
                game.player.takeDamage(this.damage);
            }
        }
    }
}

class Ant extends Monster {
    constructor(room, x, y) {
        super(room, ants_sprite, x, y, "Ant", 15, 2, 1, 5);
    }
}

class Spider extends Monster {
    constructor(room, x, y) {
        super(room, spider_sprite, x, y, "Spider", 20, 3, 2, 10);
    }
}

class Centepede extends Monster {
    constructor(room, x, y) {
        super(room, centepede_sprite, x, y, "Centepede", 30, 2, 2, 10);
    }
}

