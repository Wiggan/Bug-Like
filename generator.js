

function mulberry32(a) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function getRandomColor(random, difficulty) {
    var hue = 45 - random() * 20 - difficulty * 20;
    var saturation = 20 + difficulty * 40 + random() * 20;
    var lightness = 85 - random() * 20 - difficulty * 50;
    return 'hsl(' + hue +', ' + saturation + '%, ' + lightness + '%)';
}

function getKumaraswamySample(random, difficulty) {
    var x = random;
    var b = 5 - difficulty * 4.5;
    var a = 0.5 + difficulty * 4;    
    var f = a * b * x ** (a - 1) * (1 - x ** a) ** (b - 1);
    return (1 - (1 - x)**(1/b))**(1/a);
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getUniqueElementsFromArray(array, difficulty) {
    var result = [];
    var count = Math.min(Math.floor(2 + difficulty * 4 + Math.random() * 2), array.length);
    for (var i = 0; i < count; i++) {
        var candidate = getRandomElementWeighted(array, Math.random(), difficulty);
        while(result.includes(candidate)) {
            candidate = getRandomElementWeighted(array, Math.random(), difficulty);
        }
        result.push(candidate);
    }
    console.log(result);
    return result;
}

function getRandomElementWeighted(array, random, difficulty) {
    var sample = getKumaraswamySample(random, Math.min(difficulty, 1));
    var index = Math.floor(sample * array.length);
    //console.log("index: " + index + " of " + array.length + " with difficulty: " + difficulty);  
    return array[index];
}

function testDistribution() {
    var random = mulberry32(0);
    for (var difficulty = 0; difficulty < 1; difficulty += 0.1) {
        var bins = new Array(10);
        for (var i = 0; i < bins.length; i++) {
            bins[i] = 0;
        }
        for (var i = 0; i < 10000; i++) {
            var sample = getKumaraswamySample(random, difficulty);
            bins[Math.floor(sample*10)] += 1;
        }
        console.log("difficulty: " + difficulty + " gave " + bins);
    }
}


async function generateMirroredPattern(seed, size, color) {
    // Get image of half width
    var image = await generatePattern(seed, size / 2, size, color);
    // Mirror by copying and flipping
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(image, -size, 0);
    ctx.restore();
    ctx.drawImage(image, 0, 0);
    return canvas2image(canvas);
}

async function generateDoubleMirroredPattern(seed, size, color) {
    // Get image of half width
    var image = await generatePattern(seed, size / 2, size / 2, color);
    // Mirror by copying and flipping
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(image, -size, 0);
    ctx.restore();
    ctx.save();
    ctx.scale(1, -1);
    ctx.drawImage(image, 0, -size);
    ctx.restore();
    ctx.save();
    ctx.scale(-1, -1);
    ctx.drawImage(image, -size, -size);
    ctx.restore();
    ctx.drawImage(image, 0, 0);
    return canvas2image(canvas);
}

async function generatePattern(seed, width, height, color) {
    var start = Date.now();
    var random = mulberry32(seed);
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var squareSize = 10;
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = color;
    for (let x = 0; x < width; x += squareSize) {
        for (let y = 0; y < height; y += squareSize) {
            if (random() > 0.4) {
                ctx.fillRect(x, y, squareSize, squareSize);
            }
        }
    }
    //console.log("Finished pattern generation of size " + size + ": " + (Date.now() - start));
    return canvas2image(canvas);
}

async function generateSoundOnSprite() {
    var canvas = document.createElement('canvas');
    canvas.width = 30;
    canvas.height = 30;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(5, 10);
    ctx.lineTo(5, 20);
    ctx.lineTo(15, 20);
    ctx.lineTo(25, 30);
    ctx.lineTo(25, 0);
    ctx.lineTo(15, 10);
    ctx.closePath();
    ctx.fill();
    return canvas2image(canvas);
}

async function generateSoundOffSprite() {
    var canvas = document.createElement('canvas');
    canvas.width = 30;
    canvas.height = 30;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(5, 10);
    ctx.lineTo(5, 20);
    ctx.lineTo(15, 20);
    ctx.lineTo(25, 30);
    ctx.lineTo(25, 0);
    ctx.lineTo(15, 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(28, 2);
    ctx.lineTo(2, 28);
    ctx.stroke();
    return canvas2image(canvas);
}

async function canvas2image(canvas) {
    var img;
    const imageLoadPromise = new Promise(resolve => {
        img = new Image();
        img.onload = resolve;
        img.src = canvas.toDataURL('image/png');
    });

    await imageLoadPromise;
    return img;
}
