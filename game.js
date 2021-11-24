
const clamp = (min, num, max) => Math.min(Math.max(num, min), max);

class Game {
    constructor() {
        this.rooms = [];
        this.player = undefined;
        this.biomes = [];
        this.score = 0;
        this.current_room = undefined;
        this.patterns = [
            [[Rock, Rock, Rock], [Rock, PickupRange, Mantis], [Rock, Rock, Rock]],  // Needs nothing
            [[Rock, Rock, Rock], [Rock, MoveRocks, Rock], [Rock, Rock, Rock]],  // Needs pickup range 
            [[null, Rock, null], [Rock, Range, Rock], [null, Rock, null]], // Needs move rocks
            [[null, null, Rock, Rock, null], [null, Rock, Tic, Rock, Rock], [Rock, Tic, null, Tic, Rock], [Rock, Rock, Tic, Rock, null], [null, Rock, Rock, null, null]],  // Needs range and move rocks
        ];
    }
    
    async build() {
        this.biomes = await this.generateBiomes(0);
        this.player = new Player();
        var first_room = new Room(undefined, 0, 0);

        first_room.clearArea(this.player.x, this.player.y, 3, 3);
        this.rooms.push(first_room);
        this.current_room = game.rooms[0];
        this.rooms[0].fill_surrounding();
    } 

    async generateBiomes(seed) {
        var random = mulberry32(seed);
        var biomes = [];

        for (var i = 0; i < 20; i++) {
            var difficulty = getKumaraswamySample(random(), i/20);
            console.log("Randomized difficulty: " + difficulty);
            biomes.push({
                color: getRandomColor(random, difficulty),
                background: await generatePattern(random()*100, room_width, room_height, 'Black'),
                music: 'nice.ogg',
                density: clamp(0.04, getKumaraswamySample(random(), difficulty), 0.6),
                difficulty: difficulty,
                monsters: getUniqueElementsFromArray(monsters, difficulty),
                buffs: getUniqueElementsFromArray(buffs, difficulty),
            });
        }

        return biomes;
    }
}

