

class Object {
    constructor(sprite, x, y, description) {
        this.x = x;
        this.y = y;
        this.blocking = true;
        this.size = tile_size;
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
        ctx.translate(this.x * tile_size, this.y * tile_size);
        ctx.drawImage(this.sprite, 0, 0);
        if (showInfo) {
            this.drawInfoBox(ctx);
        }
        ctx.restore();
    }
    
    distanceToPlayer() {
        //return Math.max(Math.abs(this.x - player.x), Math.abs(this.y - player.y));
        return Math.abs(this.x - game.player.x) + Math.abs(this.y - game.player.y);
    }

    update() {}
}

class Rock extends Object {
    constructor(room, x, y) {
        super(obstacle_sprite, x, y, 'Rock');
    }
}


class Buff extends Object {
    constructor(sprite, x, y, description) {
        super(sprite, x, y, description);
        this.blocking = false;
    }
}

class HP extends Buff {
    constructor(room, x, y) {
        super(hp_sprite, x, y, '+20 health');
    }
    
    pickUp() {
        game.player.heal(20);
    }
}

class Regen extends Buff {
    constructor(room, x, y) {
        super(hp_regen_sprite, x, y, '+1 health regeneration');
    }
    
    pickUp() {
        game.player.regen++;
    }
}

class MaxHP extends Buff {
    constructor(room, x, y) {
        super(max_hp_sprite, x, y, '+10 max health');
    }
    
    pickUp() {
        game.player.max_health += 10;
        game.player.heal(10);
        game.score += 10;
    }
}

class DMG extends Buff {
    constructor(room, x, y) {
        super(dmg_sprite, x, y, '+5 damage');
    }
    
    pickUp() {
        game.player.damage += 5;
        game.score += 10;
    }
}

class Initiative extends Buff {
    constructor(room, x, y) {
        super(initiative_sprite, x, y, '+1 initiative');
    }
    
    pickUp() {
        game.player.initiative++;
        game.score += 10;
    }
}

class Experience extends Buff {
    constructor(room, x, y) {
        super(experience_sprite, x, y, '+10 experience');
    }
    
    pickUp() {
        game.player.gainExperience(10);
        game.score += 10;
    }
}

class ExperienceBig extends Buff {
    constructor(room, x, y) {
        super(experience_sprite, x, y, '+100 experience');
    }
    
    pickUp() {
        game.player.gainExperience(100);
        game.score += 10;
    }
}

var buffs = [HP, Experience, Regen, MaxHP, ExperienceBig, DMG];

class PickupRange extends Buff {
    constructor(room, x, y) {
        super(pickup_range_sprite, x, y, '+1 pick up range!');
    }
    
    pickUp() {
        game.player.pickupRange++;
        game.score += 100;
    }
}

class MoveRocks extends Buff {
    constructor(room, x, y) {
        super(move_rocks_sprite, x, y, 'Lets you move rocks!');
    }
    
    pickUp() {
        game.player.canMoveRocks = true;
        game.score += 100;
    }
}

class Range extends Buff {
    constructor(room, x, y) {
        super(range_sprite, x, y, '+1 range');
    }
    
    pickUp() {
        if (game.player.range < player_max_range) {
            game.player.range++;
        }
        game.score += 10;
    }
}



class Actor extends Object {
    constructor(sprite, x, y, description, max_health) {
        super(sprite, x, y, description);
        this.max_health = max_health;
        this.health = max_health;
        this.health_change = 0;
        this.last_instigator = undefined;
    }

    takeDamage(amount, instigator) {
        this.last_instigator = instigator;
        amount = Math.min(amount, this.health);
        this.health -= amount;
        this.health_change -= amount;
        // compensate for half effect size and one square of neighrbor rooms being drawn, bah
        this.effect = new Effect(this.x*tile_size + 80, this.y*tile_size + 80);
    }

    draw(ctx) { 
        Object.prototype.draw.call(this,ctx);
        if (this.health_change != 0) {
            ctx.save();
            ctx.translate(this.x * tile_size, this.y * tile_size);
            this.drawHealthBar(ctx);
            ctx.restore();
            this.health_change = 0;
        }
    }

    drawHealthBar(ctx) {
        ctx.save();
        ctx.fillStyle = "Crimson";
        ctx.fillRect(0, 0, tile_size, 10);
        ctx.fillStyle = "OliveDrab";
        var health = Math.max(0, tile_size * this.health / this.max_health);
        var delta = Math.abs(tile_size * this.health_change / this.max_health);
        ctx.fillRect(0, 0, health, 10);
        if (this.health_change > 0) {
            ctx.fillStyle = "YellowGreen";
            ctx.fillRect(health - delta, 0, delta, 10);
        } else if (this.health_change < 0) {
            ctx.fillStyle = "Salmon";
            ctx.fillRect(health, 0, delta, 10);
        }
        ctx.restore();
    }

    drawInfoBox(ctx) {
        Object.prototype.drawInfoBox.call(this,ctx);
        this.drawHealthBar(ctx);
    }

    isMoveValid(target_x, target_y) {
        var room = getRoomRelativeCurrentRoom(target_x, target_y);
        var wrapped_x = (target_x + room_width_tiles) % room_width_tiles;
        var wrapped_y = (target_y + room_height_tiles) % room_height_tiles;
        return room.objects.every((object) => {
            return object.x != wrapped_x || object.y != wrapped_y || !object.blocking
        });
    }
}

class Monster extends Actor {
    constructor(room, sprite, x, y, description, max_health, aggro_range, speed, damage, initiative) {
        super(sprite, x, y, description, max_health);
        this.aggro_range = aggro_range;
        this.isAggro = false;
        this.range = 1;
        this.initiative = initiative;
        this.experience_value = 20;
        this.room = room;
        this.speed = speed;
        this.damage = damage;
    }

    update() {
        // Check if alive
        if (this.health <= 0) { return; }

        // Check aggro
        if (this.distanceToPlayer() <= this.aggro_range) {
            this.isAggro = true;
            console.log("Got aggro!");
        } else if (this.distanceToPlayer() > this.aggro_range + 1) {
            this.isAggro = false;
            console.log("Lost aggro!");
        }

        // Move
        if (this.isAggro) {
            var moved = 0;
            var attempts = 0;
            while (moved < this.speed && this.distanceToPlayer() > 1 && attempts < 15) {
                attempts++;
                if (Math.random() < 0.5) {
                    if ( this.distanceToPlayer() > 1) {
                        var x_step = Math.sign(this.x - game.player.x);
                        if (this.isMoveValid(this.x - x_step, this.y)) {
                            this.x -= x_step
                            moved += Math.abs(x_step);
                        }
                    }
                } else {
                    if ( this.distanceToPlayer() > 1) {
                        var y_step = Math.sign(this.y - game.player.y);
                        if (this.isMoveValid(this.x, this.y - y_step)) {
                            this.y -= y_step
                            moved += Math.abs(y_step);
                        }
                    }
                }
            }
        }
        // Compare initative, so that if player is faster than monster, monster never hits player if it dies 
        // due to the damage inflicted by the player.
        var distance = this.distanceToPlayer();
        if (this.initiative > game.player.initiative) {
            if (this.health > 0 && distance <= this.range) {
                game.player.takeDamage(this.damage, this);
            }
        }
        if (distance <= game.player.range) {
            this.takeDamage(game.player.damage, game.player);
            if (this.health <= 0) {
                game.player.gainExperience(this.experience_value);
                game.score += 10;
            }
        }
        if (this.initiative <= game.player.initiative) {
            if (this.health > 0 && distance <= this.range) {
                game.player.takeDamage(this.damage, this);
            }
        }
    }
}

class Ant extends Monster {
    constructor(room, x, y) {
        super(room, ants_sprite, x, y, "Ant", 15, 2, 1, 5, 0);
    }
}

class Spider extends Monster {
    constructor(room, x, y) {
        super(room, spider_sprite, x, y, "Spider", 40, 3, 2, 10, 1);
    }
}

class Centepede extends Monster {
    constructor(room, x, y) {
        super(room, centepede_sprite, x, y, "Centepede", 30, 2, 2, 10, 1);
    }
}

class Woodlouse extends Monster {
    constructor(room, x, y) {
        super(room, woodlouse_sprite, x, y, "Woodlouse", 60, 1, 1, 5, 0);
    }
}

class MayBug extends Monster {
    constructor(room, x, y) {
        super(room, may_bug_sprite, x, y, "May Bug", 40, 2, 2, 10, 0);
    }
}

class Mantis extends Monster {
    constructor(room, x, y) {
        super(room, mantis_sprite, x, y, "Mantis", 70, 5, 1, 50, 1);
    }
}

class Tic extends Monster {
    constructor(room, x, y) {
        super(room, tic_sprite, x, y, "Tic", 30, 1, 0, 5, 0);
    }
}

class Beetle extends Monster {
    constructor(room, x, y) {
        super(room, beetle_sprite, x, y, "Beetle", 100, 3, 1, 10, 0);
    }
}


var monsters = [Ant, MayBug, Woodlouse, Tic, Spider, Centepede, Beetle, Mantis];

class PoisonDartFrog extends Monster {
    constructor(room, x, y) {
        super(room, poison_dart_frog_sprite, x, y, "Poison Dart Frog", 1, 8, 3, 99999, 1);
        this.range = 2;
    }
}


