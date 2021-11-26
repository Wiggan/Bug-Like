function drawMap() {
    const scale = 0.1;
    const padding = 50;
    var canvas = document.getElementById('mapcanvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    if (showMap) {
        var canvas2 = document.createElement('canvas');
        canvas2.width = canvas.clientWidth - padding*2;// / scale;
        canvas2.height = canvas.clientHeight - padding*2;// / scale;
        var ctx2 =  canvas2.getContext('2d');    
        ctx2.save();
        ctx2.scale(scale, scale);
        ctx2.translate(room_width*5 - game.current_room.x * room_width, room_height*5 - game.current_room.y * room_height);
        // Draw every room that has been visited
        game.rooms.forEach((o) => {
            if (o.visited) {
                o.draw(ctx2);
                if (o == game.current_room) {
                    ctx2.save();
                    ctx2.globalAlpha = 0.5;
                    ctx2.fillStyle = "Navy";
                    ctx2.translate((o.x) * room_width, (o.y) * room_height);
                    ctx2.fillRect(0, 0, room_width, room_height);
                    ctx2.globalAlpha = 1;
                    ctx2.restore();
                }
            }
        });
        ctx2.restore();
        
        ctx.fillStyle = "black";
        ctx.strokeStyle = "rgba(50, 20, 20, 0.7)";
        ctx.lineWidth = 10;
        ctx.fillRect(padding, padding, canvas.clientWidth - padding*2, canvas.clientHeight - padding*2);
        ctx.strokeRect(padding, padding, canvas.clientWidth - padding*2, canvas.clientHeight - padding*2);
        //ctx.drawImage(canvas2, padding, padding);
        ctx.drawImage(canvas2, 0, 0, canvas2.width, canvas2.height, padding, padding, canvas.clientWidth - padding*2, canvas.clientHeight - padding*2);
    }
}