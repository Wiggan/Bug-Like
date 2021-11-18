
const StateEnum = {
    Beginning: 'Beginning',
    Running: 'Running',
    End: 'End'
};
var state = StateEnum.Beginning;
var showInfo = false;

var game = undefined;

// Configure canvas
var canvas = document.getElementById('mycanvas');
canvas.width = width;
canvas.height = height;
var effectcanvas = document.getElementById('effectcanvas');
effectcanvas.width = width;
effectcanvas.height = height;

async function generate() {
    player_sprite = await generateMirroredPattern(126, object_size, 'Navy');
    obstacle_sprite = await generatePattern(1957, object_size, object_size, 'Grey');
    hp_sprite = await generateDoubleMirroredPattern(1940, object_size, 'Crimson');
    max_hp_sprite = await generateDoubleMirroredPattern(2566, object_size, 'Crimson');
    dmg_sprite = await generateMirroredPattern(1742, object_size, 'Gold');
    range_sprite = await generateMirroredPattern(605, object_size, 'Gold');
    ants_sprite = await generateMirroredPattern(463, object_size, object_size, 'Black');
    spider_sprite = await generateMirroredPattern(101, object_size, 'Black');
    centepede_sprite = await generateMirroredPattern(103, object_size, 'Black');
    effect_sprites = [
        await generateDoubleMirroredPattern(15, 40, 'Crimson'),
        await generateDoubleMirroredPattern(60, 40, 'Crimson'),
        await generateDoubleMirroredPattern(2, 40, 'Crimson'),
        await generateDoubleMirroredPattern(22, 40, 'Crimson'),
        await generateDoubleMirroredPattern(60, 40, 'Crimson')
    ];
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

    game.current_room.draw(ctx);
    game.current_room.n.draw(ctx);
    game.current_room.ne.draw(ctx);
    game.current_room.e.draw(ctx);
    game.current_room.se.draw(ctx);
    game.current_room.s.draw(ctx);
    game.current_room.sw.draw(ctx);
    game.current_room.w.draw(ctx);
    game.current_room.nw.draw(ctx);
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
    }
}
