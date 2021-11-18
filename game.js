

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

        // Have lists of monsters, buffs etc sorted by difficulty
        var monsters = [Ant, Spider, Centepede];
        var buffs = [HP, MaxHP, DMG, Range];

        for (var i = 0; i < 10; i++) {
            var difficulty = 0.05 + (random() * 0.03 + 0.065) * i;
            //console.log("Randomized difficulty: " + difficulty);
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
}

