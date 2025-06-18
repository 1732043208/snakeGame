class GameMap {
    constructor() {
        this.tileSize = 32;
        // 扩大地图尺寸，去掉外围钢墙
        this.map = [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
            [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
            [0,1,0,1,0,2,0,1,0,2,0,1,0,1,0],
            [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
            [0,1,0,2,0,1,0,1,0,1,0,2,0,1,0],
            [0,1,0,1,0,1,0,2,0,1,0,1,0,1,0],
            [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
            [0,1,0,1,0,2,0,1,0,2,0,1,0,1,0],
            [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
            [0,0,0,0,0,0,3,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ];
        this.sprites = {
            wall: document.createElement('img'),
            steel: document.createElement('img'),
            base: document.createElement('img')
        };
        this.loadSprites();
    }

    loadSprites() {
        this.sprites.wall.src = './public/map/wall.png';
        this.sprites.steel.src = './public/map/ice.png';
        this.sprites.base.src = './public/map/camp.png';
    }

    draw(ctx) {
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                const tile = this.map[y][x];
                const xPos = x * this.tileSize;
                const yPos = y * this.tileSize;

                switch (tile) {
                    case 1: // 普通墙
                        if (this.sprites.wall.complete) {
                            ctx.drawImage(this.sprites.wall, xPos, yPos, this.tileSize, this.tileSize);
                        } else {
                            ctx.fillStyle = '#8B4513';
                            ctx.fillRect(xPos, yPos, this.tileSize, this.tileSize);
                        }
                        break;
                    case 2: // 钢墙
                        if (this.sprites.steel.complete) {
                            ctx.drawImage(this.sprites.steel, xPos, yPos, this.tileSize, this.tileSize);
                        } else {
                            ctx.fillStyle = '#808080';
                            ctx.fillRect(xPos, yPos, this.tileSize, this.tileSize);
                        }
                        break;
                    case 3: // 基地
                        if (this.sprites.base.complete) {
                            ctx.drawImage(this.sprites.base, xPos, yPos, this.tileSize, this.tileSize);
                        } else {
                            ctx.fillStyle = '#FFD700';
                            ctx.fillRect(xPos, yPos, this.tileSize, this.tileSize);
                        }
                        break;
                }
            }
        }
    }

    isSolid(x, y) {
        // 添加边界检查
        if (x < 0 || x >= this.map[0].length || y < 0 || y >= this.map.length) {
            return true;
        }
        return this.map[y][x] > 0;
    }

    destroyTile(x, y) {
        // 添加边界检查
        if (x < 0 || x >= this.map[0].length || y < 0 || y >= this.map.length) {
            return false;
        }
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