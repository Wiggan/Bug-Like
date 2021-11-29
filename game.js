
const clamp = (min, num, max) => Math.min(Math.max(num, min), max);

class Game {
    constructor() {
        this.rooms = [];
        this.player = undefined;
        this.biomes = [];
        this.score = 0;
        this.current_room = undefined;
        this.patterns = [
            [[Rock, Rock, Rock, Rock, Rock], [null, null, null, null, Rock], [Rock, Rock, Rock, null, Rock], [Rock, LifeLine, Spider, null, Rock], [Rock, Rock, Rock, Rock, Rock]],  // Needs nothing
            [[Rock, Rock, Rock, Rock, Rock], [null, null, null, null, Rock], [Rock, Rock, Rock, null, Rock], [Rock, LifeLine, MayBug, MayBug, Rock], [Rock, Rock, Rock, Rock, Rock]],  // Needs nothing
            [[Rock, Rock, Rock, Rock], [Rock, MoveRocks, Mantis, null], [Rock, Rock, Rock, null]],  // Needs nothing
            [[null, Rock, null], [Rock, PickupRange, Rock], [null, Rock, null]], // Needs move rocks
            [[Rock, Rock, Rock], [Rock, Range, Rock], [Rock, Rock, Rock]],  // Needs pickup range and move rocks
            [[Rock, Rock, null, Rock, Rock], [Rock, Rock, Spider, Rock, Rock], [null, Spider, LevelUp, Spider, null], [Rock, Rock, Spider, Rock, Rock], [Rock, Rock, null, Rock, Rock]],  // Needs initiative
            [[Rock, Rock, Rock, Rock, Rock], [null, null, null, null, Rock], [Rock, Rock, Rock, null, Rock], [Rock, LifeLine, Beetle, Beetle, Rock], [Rock, Rock, Rock, Rock, Rock]],  // Needs nothing
            [[null, null, Rock, Rock, null], [null, Rock, Tic, Rock, Rock], [Rock, Tic, PickupRange, Tic, Rock], [Rock, Rock, Tic, Rock, null], [null, Rock, Rock, null, null]],  // Needs range and move rocks
            [[null, null, Rock, Rock, null], [null, null, Rock, Rock, Rock], [Rock, Rock, Initiative, Rock, Rock], [Rock, Rock, Rock, null, null], [null, Rock, Rock, null, null]],  // Needs 2 pickup range
            [[Rock, Rock, null, Rock, Rock], [Rock, Rock, PoisonDartFrog, Rock, Rock], [null, PoisonDartFrog, LevelUp, PoisonDartFrog, null], [Rock, Rock, PoisonDartFrog, Rock, Rock], [Rock, Rock, null, Rock, Rock]],  // Needs initiative
            [[Rock, Rock, Rock, Rock, Rock], [null, null, null, null, Rock], [Rock, Rock, Rock, null, Rock], [Rock, LifeLine, Mantis, Mantis, Rock], [Rock, Rock, Rock, Rock, Rock]],  // Needs nothing
            [[Rock, Rock, Rock, Rock, Rock], [Rock, null, null, null, Rock], [Rock, null, LifeLine, MinotaurBeetle, Rock], [Rock, null, null, null, Rock], [Rock, Rock, Rock, Rock, Rock]],  // Needs nothing
        ];
        this.score_pattern = [[Rock, MinotaurBeetle, Rock], [MinotaurBeetle, Score, MinotaurBeetle], [Rock, MinotaurBeetle, Rock]];
    }
    
    async build() {
        this.biomes = await this.generateBiomes(0);
        this.player = new Player();
        this.first_room = new Room(undefined, 0, 0);

        this.first_room.clearArea(this.player.x - 1, this.player.y - 1, 3, 3);
        this.rooms.push(this.first_room);
        this.current_room = this.first_room;
        this.first_room.fill_surrounding();
        this.first_room.visited = true;
    } 

    async generateBiomes(seed) {
        var random = mulberry32(seed);
        var biomes = [];

        for (var i = 0; i < 20; i++) {
            var difficulty = getKumaraswamySample(random(), i/20);
            biomes.push({
                color: getRandomColor(random, difficulty),
                background: await generatePattern(random()*100, room_width, room_height, 'Black'),
                music: getRandomElementWeighted(sounds.songs, random(), difficulty),
                density: clamp(0.04, getKumaraswamySample(random(), difficulty), 0.6),
                difficulty: difficulty,
                monsters: getUniqueElementsFromArray(monsters, difficulty),
                buffs: getUniqueElementsFromArray(buffs, difficulty),
            });
        }

        return biomes;
    }
}

