class GameMap {
    constructor() {
        this.tileSize = 32;
        // 0: 空地, 1: 普通墙, 2: 钢墙, 3: 基地
        this.map = [
            [2,2,2,2,2,2,2,2,2,2,2,2,2],
            [2,0,0,0,0,0,0,0,0,0,0,0,2],
            [2,0,1,0,1,0,1,0,1,0,1,0,2],
            [2,0,1,0,1,0,1,0,1,0,1,0,2],
            [2,0,1,0,1,0,1,0,1,0,1,0,2],
            [2,0,1,0,1,0,1,0,1,0,1,0,2],
            [2,0,1,0,1,0,1,0,1,0,1,0,2],
            [2,0,1,0,1,0,1,0,1,0,1,0,2],
            [2,0,1,0,1,0,0,0,1,0,1,0,2],
            [2,0,0,0,0,0,3,0,0,0,0,0,2],
            [2,2,2,2,2,2,2,2,2,2,2,2,2]
        ];
        this.sprites = {
            wall: document.createElement('img'),
            steel: document.createElement('img'),
            base: document.createElement('img')
        };
        this.loadSprites();
    }

    loadSprites() {
        this.sprites.wall.src = '../assets/wall.png';
        this.sprites.steel.src = '../assets/steel.png';
        this.sprites.base.src = '../assets/base.png';
    }

    draw(ctx) {
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                const tile = this.map[y][x];
                const xPos = x * this.tileSize;
                const yPos = y * this.tileSize;

                switch (tile) {
                    case 1: // 普通墙
                        ctx.fillStyle = '#8B4513';
                        ctx.fillRect(xPos, yPos, this.tileSize, this.tileSize);
                        break;
                    case 2: // 钢墙
                        ctx.fillStyle = '#808080';
                        ctx.fillRect(xPos, yPos, this.tileSize, this.tileSize);
                        break;
                    case 3: // 基地
                        ctx.fillStyle = '#FFD700';
                        ctx.fillRect(xPos, yPos, this.tileSize, this.tileSize);
                        break;
                }
            }
        }
    }

    isSolid(x, y) {
        return this.map[y][x] > 0;
    }

    destroyTile(x, y) {
        if (this.map[y][x] === 1) { // 只能摧毁普通墙
            this.map[y][x] = 0;
            return true;
        }
        return false;
    }

    isGameOver(x, y) {
        return this.map[y][x] === 3; // 检查是否击中基地
    }
}