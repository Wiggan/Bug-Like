class Player extends Actor {
    constructor() {
        super(player_sprite, 4, 4, "You: Lucanus Cervus", 20000);
        this.damage = 10;
        this.range = 1;
        this.pickupRange = 0;
        this.initiative = 0;
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
            if (object instanceof Buff && Math.floor(object.distanceToPlayer()) <= this.pickupRange) {
                object.pickUp();
                return false;
            }
            return true;
        });

        if (this.health <= 0) {
            drawEnd();
        } else {
            this.heal(this.regen);
        }

    }

    getBlockingObject(target_x, target_y, x_movement, y_movement) {
        //  And if player does not try to move rock from one room to another
        if ((x_movement == 0 || (0 < target_x && target_x < room_width_tiles - 1)) &&
            (y_movement == 0 || (0 < target_y && target_y < room_height_tiles - 1))) {
            // And there is a rock blocking the player
            var blockage = game.current_room.getBlockingObjectsAt(target_x, target_y)[0];
            if (blockage != undefined && blockage instanceof Rock) {
                // And if there is nothing blocking where the rock would end up
                if (game.current_room.getBlockingObjectsAt(target_x + x_movement, target_y + y_movement).length == 0) {
                    return blockage;
                }
            }
        }
    }
    
    move(x, y) {
        // Handle being dead
        if (this.health <= 0) {
            return;
        }
        // Handle wait
        if (x == 0 && y == 0) {
            update();
            draw();
        }
        var target_x =  this.x + x;
        var target_y =  this.y + y;
        if (this.isMoveValid(target_x, target_y)) {
            this.x = target_x;
            this.y = target_y;
            update();
            draw();
        } else if (this.canMoveRocks) {
            // If player owns buff move rocks
            var blockingObject = this.getBlockingObject(target_x, target_y, x, y)
            if (blockingObject != undefined) {
                blockingObject.x = target_x + x;
                blockingObject.y = target_y + y;
                this.x = target_x;
                this.y = target_y;
                update();
                draw();
            }
        }
    }
}
