

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
                if (this.random() < this.biome.density) {
                    // If so, let rocks dominate the perifery and concentrate monsters and buffs to the center
                    //console.log("x: " + x + ", y: " + y + " relativeDistance: " + this.getRelativeDistanceToCenter(x, y));
                    var distance = this.getRelativeDistanceToCenter(x, y);
                    if (this.random()*0.4 + distance*0.6 > 0.5) {
                        obstacles.push(new Rock(x, y));
                    } else {
                        //if (this.random()**1.5 < this.biome.difficulty*0.8) {
                        if (getKumaraswamySample(this.random(), this.biome.difficulty)*distance > 0.2) {
                            monsters.push(new (getRandomElement(this.biome.monsters))(this, x, y));
                        } else {
                            buffs.push(new (getRandomElement(this.biome.buffs))(x, y));
                        }
                    }
                }
            }
        }
        this.objects = [...obstacles, ...monsters, ...buffs];
        // Ensure we almost always have a monster and a buff in each room
        if (buffs.length == 0) {
            var x = Math.floor(this.random()*room_width_tiles);
            var y = Math.floor(this.random()*room_height_tiles);
            this.clearArea(x, y, 0.9);
            this.objects.push(new (getRandomElement(this.biome.buffs))(x, y));
        }
        if (monsters.length == 0) {
            var x = Math.floor(this.random()*room_width_tiles);
            var y = Math.floor(this.random()*room_height_tiles);
            this.clearArea(x, y, 0.9);
            this.objects.push(new (getRandomElement(this.biome.monsters))(this, x, y));
        }
    }

    clearArea(x, y, radius) {

        this.objects = this.objects.filter((o) => {
            var distance = Math.sqrt((o.x - x)**2 + (o.y - y)**2);
            if(distance <= radius) {
                console.log("distance: " + distance);
                console.log("Removed object");
                return false;
            }
            return true;
        });
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
        this.objects.forEach((object, index) => {
            object.update();
            if (object instanceof Monster && object.health <= 0) {
                this.objects.splice(index, 1);
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

