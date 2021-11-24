

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

var buffs = [HP, Experience, Regen, Initiative, MaxHP, ExperienceBig, DMG];

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
    }

    takeDamage(amount) {
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
}

class Player extends Actor {
    constructor() {
        super(player_sprite, 4, 4, "You: Lucanus Cervus", 20);
        this.damage = 10;
        this.range = 1;
        this.pickupRange = 0;
        this.initiative = 10;
        this.level = 1;
        this.experience = 0;
        this.level_up_experience = this.getLevelUpExperience(this.level);
        this.previous_level_up_experience = 0;
        this.regen = 0;
        this.canMoveRocks = false;
    }
    
    getLevelUpExperience(level) {
        return Math.floor(30**((1 + level * 0.2)));
    }

    heal(amount) {
        if (this.health < this.max_health) {
            amount = Math.min(amount, this.max_health - this.health);
            this.health = this.health + amount;
            this.health_change += amount;
        }
    }

    gainExperience(amount) {
        this.experience += amount;
        if (this.experience >= this.level_up_experience) {
            console.log("Level up!");
            this.level++;
            this.max_health += 10;
            this.damage += 10;
            this.heal(this.max_health);
            this.previous_level_up_experience = this.level_up_experience;
            this.level_up_experience = this.getLevelUpExperience(this.level);
        }
    }

    drawExperienceBar(ctx) {
        ctx.save();
        ctx.fillStyle = "Black";
        ctx.fillRect(0, 10, tile_size, 10);
        ctx.fillStyle = "Grey";
        ctx.fillRect(0, 10, Math.max(0, tile_size * (this.experience - this.previous_level_up_experience) / (this.level_up_experience - this.previous_level_up_experience)), 10);
        ctx.restore();
    }

    drawInfoBox(ctx) {
        Actor.prototype.drawInfoBox.call(this,ctx);
        this.drawExperienceBar(ctx);
    }

    update() {
        var room = getRoomRelativeCurrentRoom(this.x, this.y);
        if (room != game.current_room) {
            console.log("Entering new room: " + JSON.stringify({
                biome: room.biome.difficulty,
                x: room.x,
                y: room.y
            }));
            game.current_room = room;
            game.current_room.fill_surrounding();
            this.x = (this.x + room_width_tiles) % room_width_tiles;
            this.y = (this.y + room_height_tiles) % room_height_tiles;
        }
        
        var ctx = game.current_room.trail.getContext("2d");
        ctx.fillStyle = 'SaddleBrown';
        ctx.fillRect((this.x) * this.size, (this.y) * this.size, this.size, this.size);
        game.current_room.objects = game.current_room.objects.filter((object, index) => {
            if (object instanceof Buff && object.distanceToPlayer() <= this.pickupRange) {
                object.pickUp();
                return false;
            }
            return true;
        });

        if (this.health <= 0) {
            state = StateEnum.End;
        }

        this.heal(this.regen);
    }
    
}

class Monster extends Actor {
    constructor(room, sprite, x, y, desciption, max_health, aggro_range, speed, damage, initiative) {
        super(sprite, x, y, desciption, max_health);
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
                        if (isMoveValid(this.x - x_step, this.y)) {
                            this.x -= x_step
                            moved += Math.abs(x_step);
                        }
                    }
                } else {
                    if ( this.distanceToPlayer() > 1) {
                        var y_step = Math.sign(this.y - game.player.y);
                        if (isMoveValid(this.x, this.y - y_step)) {
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
                game.player.takeDamage(this.damage);
            }
        }
        if (distance <= game.player.range) {
            this.takeDamage(game.player.damage);
            if (this.health <= 0) {
                game.player.gainExperience(this.experience_value);
                game.score += 10;
            }
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
        super(room, ants_sprite, x, y, "Ant", 15, 2, 1, 5, 11);
    }
}

class Spider extends Monster {
    constructor(room, x, y) {
        super(room, spider_sprite, x, y, "Spider", 40, 3, 2, 10, 20);
    }
}

class Centepede extends Monster {
    constructor(room, x, y) {
        super(room, centepede_sprite, x, y, "Centepede", 30, 2, 2, 10, 15);
    }
}

class Woodlouse extends Monster {
    constructor(room, x, y) {
        super(room, woodlouse_sprite, x, y, "Woodlouse", 60, 1, 1, 5, 9);
    }
}

class MayBug extends Monster {
    constructor(room, x, y) {
        super(room, may_bug_sprite, x, y, "May Bug", 40, 2, 2, 10, 20);
    }
}

class Mantis extends Monster {
    constructor(room, x, y) {
        super(room, mantis_sprite, x, y, "Mantis", 70, 5, 1, 50, 50);
    }
}

class Tic extends Monster {
    constructor(room, x, y) {
        super(room, tic_sprite, x, y, "Tic", 30, 1, 0, 5, 13);
    }
}

class Beetle extends Monster {
    constructor(room, x, y) {
        super(room, beetle_sprite, x, y, "Beetle", 60, 3, 1, 10, 11);
    }
}


var monsters = [Ant, MayBug, Woodlouse, Tic, Spider, Centepede, Beetle, Mantis];


