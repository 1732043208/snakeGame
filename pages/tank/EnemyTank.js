class EnemyTank extends Tank {
    constructor(config) {
        super(config);
        // 降低速度
        this.speed = 2; // 从父类的 4 降低到 2

        this.aiUpdateDelay = 60; // AI更新频率
        this.aiCounter = 0;
        this.shootProbability = 0.02; // 发射子弹的概率
        this.moveTime = 0; // 当前方向移动时间
        this.maxMoveTime = 120; // 最大移动时间，到达后重新选择方向
    }

    loadSprites() {
        // 加载敌人坦克精灵图
        const enemyType = `e${(this.level + 1)}`; // e1, e2, e3, e4 对应不同类型的敌人
        this.sprites = [
            this.loadImage(`./public/enemy/${enemyType}_0_0.png`),
            this.loadImage(`./public/enemy/${enemyType}_0_1.png`)
        ];
    }

    getAvailableDirections(gameMap) {
        const directions = ['up', 'down', 'left', 'right'];
        return directions.filter(direction => {
            let testX = this.x;
            let testY = this.y;
            switch (direction) {
                case 'up': testY -= this.speed; break;
                case 'down': testY += this.speed; break;
                case 'left': testX -= this.speed; break;
                case 'right': testX += this.speed; break;
            }

            // 检查边界
            const gridX = Math.floor(testX / gameMap.tileSize);
            const gridY = Math.floor(testY / gameMap.tileSize);
            const gridX2 = Math.floor((testX + this.size - 1) / gameMap.tileSize);
            const gridY2 = Math.floor((testY + this.size - 1) / gameMap.tileSize);

            // 添加边界检查
            if (gridX < 0 || gridX >= gameMap.map[0].length || 
                gridY < 0 || gridY >= gameMap.map.length ||
                gridX2 < 0 || gridX2 >= gameMap.map[0].length || 
                gridY2 < 0 || gridY2 >= gameMap.map.length) {
                return false;
            }

            return !gameMap.isSolid(gridX, gridY) && 
                   !gameMap.isSolid(gridX2, gridY) && 
                   !gameMap.isSolid(gridX, gridY2) && 
                   !gameMap.isSolid(gridX2, gridY2);
        });
    }

    updateAI(gameMap, players) {
        this.aiCounter++;
        this.moveTime++;

        // 更新移动
        if (this.moveTime >= this.maxMoveTime || !this.canMove(this.x, this.y, gameMap)) {
            this.moveTime = 0;
            const availableDirections = this.getAvailableDirections(gameMap);
            if (availableDirections.length > 0) {
                this.direction = availableDirections[Math.floor(Math.random() * availableDirections.length)];
            }
        }

        // 执行移动前进行边界检查
        let newX = this.x;
        let newY = this.y;
        switch (this.direction) {
            case 'up': newY -= this.speed; break;
            case 'down': newY += this.speed; break;
            case 'left': newX -= this.speed; break;
            case 'right': newX += this.speed; break;
        }

        // 检查是否可以移动
        if (this.canMove(newX, newY, gameMap)) {
            this.x = newX;
            this.y = newY;
        } else {
            // 如果不能移动，立即重新选择方向
            this.moveTime = this.maxMoveTime;
        }

        // 发射子弹逻辑
        if (this.aiCounter >= this.aiUpdateDelay) {
            this.aiCounter = 0;
            if (Math.random() < this.shootProbability) {
                this.shoot();
            }
        }
    }
}