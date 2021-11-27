

class Room {
    constructor(creator, x, y) {
        this.x = x;
        this.y = y;
        this.trail = document.createElement('canvas');
        this.trail.width = room_width;
        this.trail.height = room_height;
        this.visited = false;
        this.perimeter = false;
        game.rooms.forEach((room) => {
            this.connect(room);
        });
        game.rooms.push(this);
        this.random = mulberry32(Math.random() * 1000);
        if (creator == undefined) {
            this.biome = game.biomes[0];
        } else if (this.random() < 0.5) {
            this.biome = getRandomElementWeighted(game.biomes, this.random(), (this.x**2 + this.y**2) / 50);
        } else {
            this.biome = creator.biome;
        }
        var obstacles = [];
        var monsters = [];
        var buffs = [];
        for (var x = 0; x < room_width_tiles; x++) {
            for (var y = 0; y < room_height_tiles; y++) {
                // Should there be anything at all?
                // Create a ring of rocks around the start position, so that move rocks must be found to progress.
                var distanceFromOrigo = Math.round(Math.sqrt((this.x*room_width_tiles + x)**2 + (this.y*room_height_tiles + y)**2));
                if (distanceFromOrigo == rock_perimeter) {
                    obstacles.push(new Rock(this, x, y));
                    this.perimeter = true;
                } else if (this.random() < this.biome.density) {
                    // If so, let rocks dominate the perifery and concentrate monsters and buffs to the center
                    var distance = this.getRelativeDistanceToCenter(x, y);
                    if (this.random()*0.4 + distance*0.6 > 0.5) {
                        obstacles.push(new Rock(this, x, y));
                    } else {
                        // if far from center, but not along the perifery, then add monster. 
                        // Monsters block entrance, so avoid having them in the perifery.
                        if (getKumaraswamySample(this.random(), this.biome.difficulty)*distance > 0.2 &&
                            x != 0 && y != 0 && x != room_width_tiles-1 && y != room_height_tiles-1) {
                            monsters.push(new (getRandomElement(this.biome.monsters))(this, x, y));
                        } else {
                            if (buffs.length < 4) {
                                buffs.push(new (getRandomElement(this.biome.buffs))(this, x, y));
                            } else {
                                obstacles.push(new Rock(this, x, y));
                            }
                        }
                    }
                }
            }
        }
        this.objects = [...obstacles, ...monsters, ...buffs];
        if (!this.perimeter) {        
            // Ensure we almost always have a monster and a buff in each room, but only if the room does not contain perimeter rocks.
            if (buffs.length == 0) {
                var x = Math.floor(this.random()*room_width_tiles);
                var y = Math.floor(this.random()*room_height_tiles);
                this.clearArea(x, y, 1, 1);
                this.objects.push(new (getRandomElement(this.biome.buffs))(this, x, y));
            }
            if (monsters.length == 0) {
                var x = Math.floor(this.random()*room_width_tiles);
                var y = Math.floor(this.random()*room_height_tiles);
                this.clearArea(x, y, 1, 1);
                this.objects.push(new (getRandomElement(this.biome.monsters))(this, x, y));
            }
            // Avoid putting this in first room!
            if (creator != undefined &&  this.random() > 0.9) {
                this.addPredefinedPattern();
            }
        }
    }

    clearArea(x, y, width, height) {
        this.objects = this.objects.filter((o) => {
            if(x <= o.x && o.x <= x + width && y <= o.y && o.y <= y + height) {
                return false;
            }
            return true;
        });
    }

    getBlockingObjectsAt(x, y) {
        return this.objects.filter((o) => {
            if(x == o.x && y == o.y && o.blocking) {
                return true;
            }
            return false;
        });
    }

    addPredefinedPattern() {
        if (game.patterns.length > 0) {
            var pattern = game.patterns.splice(0, 1)[0];
            var x_start = Math.floor(this.random() * (room_width_tiles - pattern[0].length));
            var y_start = Math.floor(this.random() * (room_height_tiles - pattern.length));
            this.clearArea(x_start, y_start, pattern[0].length, pattern.length);
            for (var y = 0; y <  pattern.length; y++) {
                for (var x = 0; x < pattern[y].length; x++) {
                    if (pattern[y][x] != null) {
                        this.objects.push(new pattern[y][x](this, x_start + x, y_start + y));
                    }
                }
            }
        }
    }

    getRelativeDistanceToCenter(x, y) {
        const max = Math.sqrt((room_width_tiles/2)**2 + (room_height_tiles/2)**2);
        return Math.sqrt((room_width_tiles/2 - x)**2 + (room_height_tiles/2 - y)**2) / max;
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
        this.objects.forEach((object) => {
            object.draw(ctx);
        });
        ctx.restore();
    }

    update() {
        this.objects = this.objects.filter((object) => {
            object.update();
            if (object instanceof Monster && object.health <= 0) {
                return false;
            }
            return true;
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

