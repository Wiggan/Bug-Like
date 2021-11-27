class Sound {
    constructor() {
        this.playSounds = true;
        this.songs = [
            new Audio('sounds/Nice.ogg'),
            new Audio('sounds/Calm.ogg'),
            new Audio('sounds/Scary.ogg')
        ];
        
        this.current_song = undefined;
        const callback = () => {
            this.current_song = game.current_room.biome.music;
            this.current_song.play();
            console.log("Music ended");
        }
        this.songs.forEach((o) => {
            o.addEventListener('ended', callback);
        });
    }
    
    startPlayingMusic() {
        this.current_song = game.current_room.biome.music;
        this.current_song.play();
    }
    
    stopPlayingMusic() {
        if (this.current_song != undefined) {
            this.current_song.pause();
            this.current_song.currentTime = 0;
        }
    }
    
    mute() {
        this.playSounds = false;
        if (this.current_song != undefined) {
            this.current_song.pause();
        }
    }
    
    unmute() {
        this.playSounds = true;
        this.current_song = game.current_room.biome.music;
        this.current_song.currentTime = 0;
        this.current_song.play();
    }
}
