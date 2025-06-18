class Tank {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.direction = config.direction || 'up';
        this.color = config.color;
        this.controls = config.controls;
        this.size = 32;
        this.speed = 4;
        this.bullets = [];
        this.cooldown = 0;
        this.maxCooldown = 20;
        this.sprites = {};
        this.currentFrame = 0;
        this.frameCount = 2;
        this.frameDelay = 5;
        this.frameTimer = 0;
        this.loadSprites();
    }

    loadSprites() {
        // 加载对应方向的坦克图片
        const directions = ['0', '1', '2', '3']; // 对应上右下左
        const playerType = this.controls.up === 'w' ? 'p1' : 'p2'; // 判断是玩家1还是玩家2
        
        directions.forEach(dir => {
            this.sprites[dir] = [
                this.loadImage(`./public/player/${playerType}/${playerType}_${dir}_0.png`),
                this.loadImage(`./public/player/${playerType}/${playerType}_${dir}_1.png`)
            ];
        });
    }

    loadImage(src) {
        const img = new Image();
        img.src = src;
        return img;
    }

    update(gameMap) {
        if (this.cooldown > 0) {
            this.cooldown--;
        }

        // 更新子弹
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update();
            
            // 检查子弹碰撞
            const gridX = Math.floor(bullet.x / gameMap.tileSize);
            const gridY = Math.floor(bullet.y / gameMap.tileSize);
            
            if (gridX < 0 || gridX >= gameMap.map[0].length || 
                gridY < 0 || gridY >= gameMap.map.length) {
                this.bullets.splice(i, 1);
                continue;
            }

            if (gameMap.isSolid(gridX, gridY)) {
                if (gameMap.isGameOver(gridX, gridY)) {
                    window.gameOver = true;
                }
                if (gameMap.destroyTile(gridX, gridY)) {
                    this.bullets.splice(i, 1);
                }
            }
        }
    }

    move(direction, gameMap) {
        this.direction = direction;
        let newX = this.x;
        let newY = this.y;

        switch (direction) {
            case 'up': newY -= this.speed; break;
            case 'down': newY += this.speed; break;
            case 'left': newX -= this.speed; break;
            case 'right': newX += this.speed; break;
        }

        // 碰撞检测
        if (this.canMove(newX, newY, gameMap)) {
            this.x = newX;
            this.y = newY;
        }
    }

    canMove(newX, newY, gameMap) {
        const gridX = Math.floor(newX / gameMap.tileSize);
        const gridY = Math.floor(newY / gameMap.tileSize);
        const gridX2 = Math.floor((newX + this.size - 1) / gameMap.tileSize);
        const gridY2 = Math.floor((newY + this.size - 1) / gameMap.tileSize);

        return !gameMap.isSolid(gridX, gridY) && 
               !gameMap.isSolid(gridX2, gridY) && 
               !gameMap.isSolid(gridX, gridY2) && 
               !gameMap.isSolid(gridX2, gridY2);
    }

    shoot() {
        if (this.cooldown === 0) {
            const bulletX = this.x + this.size / 2;
            const bulletY = this.y + this.size / 2;
            this.bullets.push(new Bullet(bulletX, bulletY, this.direction));
            this.cooldown = this.maxCooldown;
        }
    }

    draw(ctx) {
        ctx.save();
        
        // 更新动画帧
        this.frameTimer++;
        if (this.frameTimer >= this.frameDelay) {
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
            this.frameTimer = 0;
        }

        // 获取当前方向的图片数组
        let dirIndex;
        switch (this.direction) {
            case 'up': dirIndex = '0'; break;
            case 'right': dirIndex = '1'; break;
            case 'down': dirIndex = '2'; break;
            case 'left': dirIndex = '3'; break;
        }

        const sprite = this.sprites[dirIndex][this.currentFrame];
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, this.x, this.y, this.size, this.size);
        } else {
            // 如果图片未加载完成，使用颜色块代替
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }

        ctx.restore();

        // 绘制子弹
        this.bullets.forEach(bullet => bullet.draw(ctx));
    }
}