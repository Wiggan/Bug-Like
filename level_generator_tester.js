
const StateEnum = {
    Beginning: 'Beginning',
    Running: 'Running',
    End: 'End'
};
var state = StateEnum.Beginning;
var showInfo = false;

var game = undefined;
var scale = 0.05;
var x = width/2;
var y = height/2;

// Configure canvas
var canvas = document.getElementById('mycanvas');
canvas.width = width;
canvas.height = height;
var effectcanvas = document.getElementById('effectcanvas');
effectcanvas.width = width;
effectcanvas.height = height;

async function generate() {
    player_sprite = await generateMirroredPattern(126, tile_size, 'Navy');
    obstacle_sprite = await generatePattern(1957, tile_size, tile_size, 'Grey');
    hp_sprite = await generateDoubleMirroredPattern(1940, tile_size, 'Crimson');
    experience_sprite = await generateDoubleMirroredPattern(192, tile_size, 'Gold');
    experience_big_sprite = await generateDoubleMirroredPattern(194, tile_size, 'Gold');
    max_hp_sprite = await generateDoubleMirroredPattern(2566, tile_size, 'Gold');
    dmg_sprite = await generateMirroredPattern(1742, tile_size, 'Gold');
    range_sprite = await generateMirroredPattern(605, tile_size, 'Gold');
    initiative_sprite = await generateMirroredPattern(1090, tile_size, 'Gold');
    ants_sprite = await generateMirroredPattern(463, tile_size, tile_size, 'Black');
    spider_sprite = await generateMirroredPattern(101, tile_size, 'Black');
    centepede_sprite = await generateMirroredPattern(103, tile_size, 'Black');
    woodlouse_sprite = await generateDoubleMirroredPattern(201, tile_size, 'Black');
    may_bug_sprite = await generateMirroredPattern(120, tile_size, 'Black');
    mantis_sprite = await generateMirroredPattern(526, tile_size, 'Black');
    tic_sprite = await generateMirroredPattern(535, tile_size, 'Black');
    beetle_sprite = await generateMirroredPattern(589, tile_size, 'Black');
    effect_sprites = [
        await generateDoubleMirroredPattern(15, effect_size, 'Crimson'),
        await generateDoubleMirroredPattern(60, effect_size, 'Crimson'),
        await generateDoubleMirroredPattern(2, effect_size, 'Crimson'),
        await generateDoubleMirroredPattern(22, effect_size, 'Crimson'),
        await generateDoubleMirroredPattern(60, effect_size, 'Crimson')
    ];
}

function draw() {
    var canvas = document.getElementById('mycanvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    game.rooms.forEach((room) => {
        room.draw(ctx);
    });
    
    ctx.restore();
    ctx.save();
    ctx.translate(-0.5 * room_width, -0.5 * room_height);
    game.player.draw(ctx);
    ctx.restore();
}
