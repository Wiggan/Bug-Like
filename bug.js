const px = 10;
const object_size = 80;
const room_size = 720;
const width = 840;
const height = 840;
const StateEnum = {
    Beginning: 'Beginning',
    Running: 'Running',
    End: 'End'
};
var state = StateEnum.Beginning;
var showInfo = false;

// Game session variables
class Game {
    constructor() {
        this.rooms = [];
        this.player = undefined;
        this.biomes = [];
        this.score = 0;
        this.current_room = undefined;
    }
}

var game = new Game;

// Configure canvas
var canvas = document.getElementById('mycanvas');
canvas.width = width;
canvas.height = height;

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

class Room {
    constructor(creator, x, y) {
        this.x = x;
        this.y = y;
        this.trail = document.createElement('canvas');
        this.trail.width = room_size;
        this.trail.height = room_size;
        game.rooms.forEach((room) => {
            this.connect(room);
        });
        game.rooms.push(this);
        this.random = mulberry32(Math.random() * 1000);
        if (creator == undefined) {
            this.biome = game.biomes[0];
        } else if (this.random() < 0.3) {
            this.biome = getRandomElementWeighted(game.biomes, this.random, (x*x + y*y) / 100);
        } else {
            this.biome = creator.biome;
        }
        this.obstacles = [];
        this.monsters = [];
        this.buffs = [];
        for (var x = 1; x < room_size / object_size - 1; x++) {
            for (var y = 1; y < room_size / object_size - 1; y++) {
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
        ctx.translate((this.x) * room_size, (this.y) * room_size);
        ctx.fillStyle = this.biome.color;
        ctx.fillRect(0, 0, room_size, room_size);
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
        if (this.x * room_size < x && x <= (this.x + 1) * room_size &&
            this.y * room_size < y && y <= (this.y + 1) * room_size) {
            return true;
        }
        return false;
    }
}

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

function getRandomColor(random, difficulty) {
    var hue = 45 - random() * 20 - difficulty * 20;
    var saturation = 20 + difficulty * 40 + random() * 20;
    var lightness = 85 - random() * 20 - difficulty * 50;
    return 'hsl(' + hue +', ' + saturation + '%, ' + lightness + '%)';
}

function getKumaraswamySample(random, difficulty) {
    var x = random();
    var b = 5 - difficulty * 4.5;
    var a = 0.5 + difficulty * 4;    
    var f = a * b * x ** (a - 1) * (1 - x ** a) ** (b - 1);
    return (1 - (1 - x)**(1/b))**(1/a);
}

function getRandomElementWeighted(array, random, difficulty) {
    var sample = getKumaraswamySample(random, Math.min(difficulty, 1));
    var index = Math.floor(sample * array.length);
    console.log("index: " + index + " of " + array.length + " with difficulty: " + difficulty);  
    return array[index];
}

function testDistribution() {
    var random = mulberry32(0);
    for (var difficulty = 0; difficulty < 1; difficulty += 0.1) {
        var bins = new Array(10);
        for (var i = 0; i < bins.length; i++) {
            bins[i] = 0;
        }
        for (var i = 0; i < 10000; i++) {
            var sample = getKumaraswamySample(random, difficulty);
            bins[Math.floor(sample*10)] += 1;
        }
        console.log("difficulty: " + difficulty + " gave " + bins);
    }
}

async function generateBiomes(seed) {
    var random = mulberry32(seed);
    var biomes = [];

    // Have lists of monsters, buffs etc sorted by difficulty
    var monsters = [Ant, Spider, Centepede];
    var buffs = [HP, MaxHP, DMG, Range];

    for (var i = 0; i < 10; i++) {
        var difficulty = 0.05 + (random() * 0.03 + 0.065) * i;
        console.log("Randomized difficulty: " + difficulty);
        biomes.push({
            color: getRandomColor(random, difficulty),
            background: await generatePattern(random()*100, room_size, room_size, 'Black'),
            music: 'nice.ogg',
            density: difficulty / (1 + 2 * difficulty * random()),
            difficulty: difficulty,
            monsters: [getRandomElementWeighted(monsters, random, difficulty), getRandomElementWeighted(monsters, random, difficulty)],
            buffs: [getRandomElementWeighted(buffs, random, difficulty), getRandomElementWeighted(buffs, random, difficulty)],
        });
    }

    return biomes;
}

async function generate() {
    testDistribution();

    game.biomes = await generateBiomes(0);
    player_sprite = await generateMirroredPattern(126, object_size, 'Navy');
    obstacle_sprite = await generatePattern(1957, object_size, object_size, 'Grey');
    hp_sprite = await generateDoubleMirroredPattern(1940, object_size, 'Crimson');
    max_hp_sprite = await generateDoubleMirroredPattern(2566, object_size, 'Crimson');
    dmg_sprite = await generateMirroredPattern(1742, object_size, 'Gold');
    range_sprite = await generateMirroredPattern(605, object_size, 'Gold');
    ants_sprite = await generateMirroredPattern(463, object_size, object_size, 'Black');
    spider_sprite = await generateMirroredPattern(101, object_size, 'Black');
    centepede_sprite = await generateMirroredPattern(103, object_size, 'Black');

    game.player = new Player();
    game.rooms.push(new Room(undefined, 0, 0));
    game.current_room = game.rooms[0];
    game.rooms[0].fill_surrounding();
}

function mulberry32(a) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

async function generateMirroredPattern(seed, size, color) {
    // Get image of half width
    var image = await generatePattern(seed, size / 2, size, color);
    // Mirror by copying and flipping
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(image, -size, 0);
    ctx.restore();
    ctx.drawImage(image, 0, 0);
    return canvas2image(canvas);
}

async function generateDoubleMirroredPattern(seed, size, color) {
    // Get image of half width
    var image = await generatePattern(seed, size / 2, size / 2, color);
    // Mirror by copying and flipping
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(image, -size, 0);
    ctx.restore();
    ctx.save();
    ctx.scale(1, -1);
    ctx.drawImage(image, 0, -size);
    ctx.restore();
    ctx.save();
    ctx.scale(-1, -1);
    ctx.drawImage(image, -size, -size);
    ctx.restore();
    ctx.drawImage(image, 0, 0);
    return canvas2image(canvas);
}

async function generatePattern(seed, width, height, color) {
    var start = Date.now();
    var random = mulberry32(seed);
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var squareSize = 10;
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = color;
    for (let x = 0; x < width; x += squareSize) {
        for (let y = 0; y < height; y += squareSize) {
            if (random() > 0.4) {
                ctx.fillRect(x, y, squareSize, squareSize);
            }
        }
    }
    //console.log("Finished pattern generation of size " + size + ": " + (Date.now() - start));
    return canvas2image(canvas);
}

async function canvas2image(canvas) {
    var img;
    const imageLoadPromise = new Promise(resolve => {
        img = new Image();
        img.onload = resolve;
        img.src = canvas.toDataURL('image/png');
    });

    await imageLoadPromise;
    return img;
}

async function drawStart() {
    var random = mulberry32(0);
    var canvas = document.getElementById('mycanvas');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = getRandomColor(random, 1);
    ctx.fillRect(0, 0, width, height);
    var background = await generatePattern(0, width, height, 'Black');
    ctx.globalAlpha = 0.1;
    ctx.drawImage(background, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'black';
    ctx.font = "20px sans-serif";
    ctx.fillText("Press any key to start...", 50, 50);
}

function drawRunning() {
    var canvas = document.getElementById('mycanvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.save();
    ctx.translate(-(game.current_room.x + 0.5) * room_size, -(game.current_room.y + 0.5) * room_size);
    game.rooms.forEach((room) => {
        room.draw(ctx);
    })
    ctx.restore();
    ctx.save();
    ctx.translate(-0.5 * room_size, -0.5 * room_size);
    game.player.draw(ctx);
    ctx.restore();
    ctx.restore();
}

function draw() {
    switch(state) {
        case StateEnum.Beginning:
            drawStart();
            break;
        case StateEnum.Running:
            drawRunning();
            break;
        case StateEnum.End:
            drawRunning();
            drawEnd();
            break;
    }
}

function drawEnd() {
    var canvas = document.getElementById('mycanvas');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
    ctx.font = "20px sans-serif";
    ctx.fillText("You died!", 50, 50);
    ctx.fillText("Score: " + game.score, 50, 150);
}

function isMoveValid(target_x, target_y) {
    var room = getRoomRelativeCurrentRoom(target_x, target_y);
    var wrapped_x = (target_x + 9) % 9;
    var wrapped_y = (target_y + 9) % 9;
    return room.obstacles.every((obstacle) => {
        return obstacle.x != wrapped_x || obstacle.y != wrapped_y
    }) && room.monsters.every((monster) => {
        return monster.x != wrapped_x || monster.y != wrapped_y
    })
}

function getRoomRelativeCurrentRoom(x, y) {
    if (x < 0) {
        return game.current_room.w;
    } else if (x >= room_size / object_size) {
        return game.current_room.e;
    } else if (y < 0) {
        return game.current_room.n;
    } else if (y >= room_size / object_size) {
        return game.current_room.s;
    } else {
        return game.current_room;
    }
}

function update() {
    var room = getRoomRelativeCurrentRoom(game.player.x, game.player.y);
    if (room != game.current_room) {
        console.log("Entering new room: " + JSON.stringify({
            biome: room.biome.difficulty,
            x: room.x,
            y: room.y
        }));
        game.current_room = room;
        game.current_room.fill_surrounding();
        game.player.x = (game.player.x + 9) % 9;
        game.player.y = (game.player.y + 9) % 9;
    }
    //console.log("x: " + player.x + ", y: " + player.y);
    var ctx = game.current_room.trail.getContext("2d");
    ctx.fillStyle = 'SaddleBrown';
    ctx.fillRect((game.player.x) * game.player.size, (game.player.y) * game.player.size, game.player.size, game.player.size);
    game.current_room.buffs.forEach((buff, index, object) => {
        if (buff.x == game.player.x && buff.y == game.player.y) {
            buff.pickUp();
            object.splice(index, 1);
        }
    })
    game.current_room.update();

    if (game.player.health <= 0) {
        state = StateEnum.End;
        drawEnd();
        console.log('died');
    }
}
