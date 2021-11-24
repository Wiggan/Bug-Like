
function drawHud() {
    var canvas = document.getElementById('hudcanvas');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgba(150, 120, 120, 0.8)";
    ctx.strokeStyle = "rgba(50, 20, 20, 0.7)";
    ctx.lineWidth = 10;
    ctx.font = "20px sans-serif";
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.fillRect(0, 0, canvas.clientWidth , canvas.clientHeight);
    ctx.strokeRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    var info = "HP: " + game.player.health + "/" + game.player.max_health + "(+" + game.player.regen + ")" + 
               "   Level: " + game.player.level + "(" + game.player.experience + "/" + game.player.level_up_experience + ")" +
               "   DMG: " + game.player.damage +
               "   Range: " + game.player.range + 
               "   Initiative: " + game.player.initiative +
               "   Score: " + game.score;
    ctx.fillStyle = "black";
    ctx.fillText(info, 10, 25);

    if (playSounds) {
        ctx.drawImage(sound_on_sprite, canvas.clientWidth - 45, 5);
    } else {
        ctx.drawImage(sound_off_sprite, canvas.clientWidth - 45, 5);
    }
}

function clearHud() {
    var canvas = document.getElementById('hudcanvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}

