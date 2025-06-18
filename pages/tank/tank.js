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
        
        // 添加动画相关的变量初始化
        this.currentFrame = 0;
        this.frameCount = 2;
        this.frameDelay = 5;
        this.frameTimer = 0;
        
        // 加载精灵图
        this.level = 0; // 坦克等级，默认为0
        this.sprites = [];
        this.loadSprites();
    }

    loadSprites() {
        const playerType = this.controls.up === 'w' ? 'p1' : 'p2';
        // 加载坦克精灵图
        this.sprites = [
            this.loadImage(`./public/player/${playerType}/${playerType}_${this.level}_0.png`),
            this.loadImage(`./public/player/${playerType}/${playerType}_${this.level}_1.png`)
        ];
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

        // 计算旋转角度
        let rotation = 0;
        switch (this.direction) {
            case 'up': rotation = 0; break;
            case 'right': rotation = 90; break;
            case 'down': rotation = 180; break;
            case 'left': rotation = 270; break;
        }

        // 设置旋转中心点为坦克中心
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        
        const sprite = this.sprites[this.currentFrame];
        if (sprite && sprite.complete) {
            // 绘制时需要将坐标原点移回坦克左上角
            ctx.drawImage(
                sprite, 
                -this.size / 2, 
                -this.size / 2, 
                this.size, 
                this.size
            );
        } else {
            // 后备渲染
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }

        ctx.restore();

        // 绘制子弹
        this.bullets.forEach(bullet => bullet.draw(ctx));
    }
}