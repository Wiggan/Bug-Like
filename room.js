

class Room {
    constructor(creator, x, y) {
        this.x = x;
        this.y = y;
        this.trail = document.createElement('canvas');
        this.trail.width = room_width;
        this.trail.height = room_height;
        game.rooms.forEach((room) => {
            this.connect(room);
        });
        game.rooms.push(this);
        this.random = mulberry32(Math.random() * 1000);
        if (creator == undefined) {
            this.biome = game.biomes[0];
        } else if (this.random() < 0.3) {
            this.biome = getRandomElementWeighted(game.biomes, this.random(), (x*x + y*y) / 100);
        } else {
            console.log("using parent biome");
            this.biome = creator.biome;
        }
        this.obstacles = [];
        this.monsters = [];
        this.buffs = [];
        for (var x = 1; x < room_width_tiles - 1; x++) {
            for (var y = 1; y < room_height_tiles - 1; y++) {
                if (this.random() < this.biome.density) {
                    if (this.random() > 0.5) {
                        this.obstacles.push(new Rock(x, y));
                    } else {
                        if (this.random()*this.random() < this.biome.difficulty) {
                            this.monsters.push(new (getRandomElement(this.biome.monsters))(this, x, y));
                        } else {
                            this.buffs.push(new (getRandomElement(this.biome.buffs))(x, y));
                        }
                    }
                }
            }
        }
    }

    connect(other) {
        if (this.x == other.x && this.y == other.y + 1) {
            this.n = other;
            other.s = this;
        } else if (this.x == other.x - 1 && this.y == other.y + 1) {
            this.ne = other;
            other.sw = this;
        } else if (this.x == other.x - 1 && this.y == other.y) {
            this.e = other;
            other.w = this;
        } else if (this.x == other.x - 1 && this.y == other.y - 1) {
            this.se = other;
            other.nw = this;
        } else if (this.x == other.x && this.y == other.y - 1) {
            this.s = other;
            other.n = this;
        } else if (this.x == other.x + 1 && this.y == other.y - 1) {
            this.sw = other;
            other.ne = this;
        } else if (this.x == other.x + 1 && this.y == other.y) {
            this.w = other;
            other.e = this;
        } else if (this.x == other.x + 1 && this.y == other.y + 1) {
            this.nw = other;
            other.se = this;
        }
    }

    fill_surrounding() {
        if (this.n == undefined) {
            this.n = new Room(this, this.x, this.y - 1);
        }
        if (this.ne == undefined) {
            this.ne = new Room(this, this.x + 1, this.y - 1);
        }
        if (this.e == undefined) {
            this.e = new Room(this, this.x + 1, this.y);
        }
        if (this.se == undefined) {
            this.se = new Room(this, this.x + 1, this.y + 1);
        }
        if (this.s == undefined) {
            this.s = new Room(this, this.x, this.y + 1);
        }
        if (this.sw == undefined) {
            this.sw = new Room(this, this.x - 1, this.y + 1);
        }
        if (this.w == undefined) {
            this.w = new Room(this, this.x - 1, this.y);
        }
        if (this.nw == undefined) {
            this.nw = new Room(this, this.x - 1, this.y - 1);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate((this.x) * room_width, (this.y) * room_height);
        ctx.fillStyle = this.biome.color;
        ctx.fillRect(0, 0, room_width, room_height);
        ctx.globalAlpha = 0.05;
        ctx.drawImage(this.biome.background, 0, 0);
        ctx.globalAlpha = 0.5;
        ctx.drawImage(this.trail, 0, 0);
        ctx.globalAlpha = 1;
        this.obstacles.forEach((obstacle) => {
            obstacle.draw(ctx);
        });
        this.monsters.forEach((monster) => {
            monster.draw(ctx);
        });
        this.buffs.forEach((buff) => {
            buff.draw(ctx);
        });
        ctx.restore();
    }

    update() {
        this.monsters.forEach((monster, index, object) => {
            monster.update();
            if (monster.health <= 0) {
                object.splice(index, 1);
            }
        });
    }

    contains(x, y) {
        if (this.x * room_width < x && x <= (this.x + 1) * room_width &&
            this.y * room_height < y && y <= (this.y + 1) * room_height) {
            return true;
        }
        return false;
    }
}

