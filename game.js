

// Game session variables
class Game {
    constructor() {
        this.rooms = [];
        this.player = undefined;
        this.biomes = [];
        this.score = 0;
        this.current_room = undefined;
        console.log("hej game ctor");
    }
    
    async build() {
        this.biomes = await this.generateBiomes(0);
        this.player = new Player();
        this.rooms.push(new Room(undefined, 0, 0));
        this.current_room = game.rooms[0];
        this.rooms[0].fill_surrounding();
    }
    
    

    async generateBiomes(seed) {
        var random = mulberry32(seed);
        var biomes = [];

        for (var i = 0; i < 20; i++) {
            var difficulty = Math.min(0.05 + (random() * 0.01 + 0.085) * i, 1);
            //console.log("Randomized difficulty: " + difficulty);
            var monster
            biomes.push({
                color: getRandomColor(random, difficulty),
                background: await generatePattern(random()*100, room_width, room_height, 'Black'),
                music: 'nice.ogg',
                density: difficulty / (1 + 2 * difficulty * random()),
                difficulty: difficulty,
                monsters: getUniqueElementsFromArray(monsters, difficulty),
                buffs: getUniqueElementsFromArray(buffs, difficulty),
            });
        }

        return biomes;
    }
}

