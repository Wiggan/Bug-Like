
var playSounds = true;
var songs = [
    new Audio('sounds/Nice.ogg'),
    new Audio('sounds/Calm.ogg'),
    new Audio('sounds/Scary.ogg')
];

var current_song = undefined;

function startPlayingMusic() {
    current_song = game.current_room.biome.music;
    current_song.play();
    current_song.addEventListener('ended', () => {
        current_song = game.current_room.biome.music;
        current_song.play();
        console.log("Music ended, playing " + current_song);
    });
}

function stopPlayingMusic() {
    if (current_song != undefined) {
        current_song.pause();
        current_song.currentTime = 0;
    }
}