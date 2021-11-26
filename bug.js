
const StateEnum = {
    Beginning: 'Beginning',
    Running: 'Running',
    End: 'End'
};
var state = StateEnum.Beginning;
var showInfo = false;
var showMap = false;
var playSounds = true;

var game = undefined;

// Configure canvas
var canvas = document.getElementById('mycanvas');
canvas.width = width;
canvas.height = height;
var effectcanvas = document.getElementById('effectcanvas');
effectcanvas.width = width;
effectcanvas.height = height;
var hudcanvas = document.getElementById('hudcanvas');
hudcanvas.width = width;
hudcanvas.height = 40;
var mapcanvas = document.getElementById('mapcanvas');
mapcanvas.width = width;
mapcanvas.height = height;

async function generate() {
    player_sprite = await generateMirroredPattern(126, tile_size, 'Navy');
    obstacle_sprite = await generatePattern(1957, tile_size, tile_size, 'Grey');
    hp_sprite = await generateDoubleMirroredPattern(1940, tile_size, 'Crimson');
    hp_regen_sprite = await generateDoubleMirroredPattern(-160, tile_size, 'Crimson');
    experience_sprite = await generateDoubleMirroredPattern(192, tile_size, 'Crimson');
    experience_big_sprite = await generateDoubleMirroredPattern(194, tile_size, 'Crimson');
    max_hp_sprite = await generateDoubleMirroredPattern(2566, tile_size, 'Crimson');
    dmg_sprite = await generateMirroredPattern(1742, tile_size, 'Crimson');
    
    range_sprite = await generateMirroredPattern(605, tile_size, 'Gold');
    pickup_range_sprite = await generatePattern(1080, tile_size, tile_size, 'Gold');
    move_rocks_sprite = await generatePattern(1081, tile_size, tile_size, 'Gold');
    initiative_sprite = await generateMirroredPattern(1090, tile_size, 'Gold');

    ants_sprite = await generateMirroredPattern(463, tile_size, tile_size, 'Black');
    spider_sprite = await generateMirroredPattern(101, tile_size, 'Black');
    centepede_sprite = await generateMirroredPattern(103, tile_size, 'Black');
    woodlouse_sprite = await generateDoubleMirroredPattern(201, tile_size, 'Black'); 
    may_bug_sprite = await generateMirroredPattern(120, tile_size, 'Black');
    mantis_sprite = await generateMirroredPattern(526, tile_size, 'Black');
    tic_sprite = await generateMirroredPattern(535, tile_size, 'Black');
    beetle_sprite = await generateMirroredPattern(589, tile_size, 'Black');
    poison_dart_frog_sprite = await generateMirroredPattern(87, tile_size, 'Black');

    effect_sprites = [
        await generateDoubleMirroredPattern(15, effect_size, 'Crimson'),
        await generateDoubleMirroredPattern(60, effect_size, 'Crimson'),
        await generateDoubleMirroredPattern(2, effect_size, 'Crimson'),
        await generateDoubleMirroredPattern(22, effect_size, 'Crimson'),
        await generateDoubleMirroredPattern(60, effect_size, 'Crimson')
    ];
    sound_on_sprite = await generateSoundOnSprite();
    sound_off_sprite = await generateSoundOffSprite();
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
    clearEffects();
    clearHud();
}

function drawRunning() {
    var canvas = document.getElementById('mycanvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.save();
    ctx.translate(-(game.current_room.x + 0.5) * room_width, -(game.current_room.y + 0.5) * room_height);

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
    ctx.translate(-0.5 * room_width, -0.5 * room_height);
    game.player.draw(ctx);
    ctx.restore();
    ctx.restore();
    drawHud();
    drawMap();
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
    clearHud();
    game.end = new DeathEffect();
}

function getRoomRelativeCurrentRoom(x, y) {
    if (x < 0) {
        return game.current_room.w;
    } else if (x >= room_width_tiles) {
        return game.current_room.e;
    } else if (y < 0) {
        return game.current_room.n;
    } else if (y >= room_height_tiles) {
        return game.current_room.s;
    } else {
        return game.current_room;
    }
}

function update() {
    game.current_room.update();
    game.player.update();
}
