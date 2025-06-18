class TankGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameMap = new GameMap();
        
        // 创建玩家坦克
        this.player1 = new Tank({
            x: 5 * 32,
            y: 10 * 32,
            direction: 'up',
            color: '#4CAF50',
            controls: {
                up: 'w',
                down: 's',
                left: 'a',
                right: 'd',
                shoot: ' '
            }
        });

        this.player2 = new Tank({
            x: 9 * 32,
            y: 10 * 32,
            direction: 'up',
            color: '#2196F3',
            controls: {
                up: 'ArrowUp',
                down: 'ArrowDown',
                left: 'ArrowLeft',
                right: 'ArrowRight',
                shoot: 'Enter'
            }
        });

        // 添加敌人坦克数组和相关配置
        this.enemies = [];
        this.maxEnemies = 4; // 场上最大敌人数量
        this.totalEnemies = 20; // 总敌人数量
        this.enemiesDefeated = 0; // 已击败的敌人数量
        this.enemySpawnPoints = [
            { x: 0, y: 0 },            // 左上角
            { x: 7 * 32, y: 0 },       // 中上
            { x: 14 * 32, y: 0 }       // 右上角
        ];
        this.enemySpawnDelay = 180; // 生成新敌人的延迟
        this.enemySpawnCounter = 0;

        this.animationId = null;
        this.isPaused = false;

        this.bindEvents();
        this.showStartScreen();
    }

    bindEvents() {
        document.getElementById('backBtn').addEventListener('click', () => {
            if (this.gameLoop) {
                cancelAnimationFrame(this.gameLoop);
            }
            window.location.href = '../menu/index.html';
        });

        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());

        this.keyStates = {};
        document.addEventListener('keydown', (e) => this.keyStates[e.key] = true);
        document.addEventListener('keyup', (e) => this.keyStates[e.key] = false);
    }

    spawnEnemy() {
        if (this.enemies.length >= this.maxEnemies || 
            this.enemiesDefeated >= this.totalEnemies) return;

        const spawnPoint = this.enemySpawnPoints[
            Math.floor(Math.random() * this.enemySpawnPoints.length)
        ];

        const enemy = new EnemyTank({
            x: spawnPoint.x,
            y: spawnPoint.y,
            direction: 'down',
            color: '#ff0000',
            level: Math.floor(Math.random() * 4) // 随机等级 0-3
        });

        this.enemies.push(enemy);
    }

    startGameLoop() {
        const loop = () => {
            if (!this.isPaused) {
                this.update();
                this.draw();
            }
            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    }

    startGame() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // 重置游戏状态
        this.enemies = [];
        this.enemiesDefeated = 0;
        this.enemySpawnCounter = 0;
        this.isPaused = false;
        
        // 重置玩家位置
        this.player1.x = 5 * 32;
        this.player1.y = 10 * 32;
        this.player2.x = 9 * 32;
        this.player2.y = 10 * 32;

        this.startGameLoop();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pauseBtn').textContent = this.isPaused ? '继续' : '暂停';
    }

    showStartScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('点击"开始游戏"按钮开始', this.canvas.width / 2, this.canvas.height / 2);
    }

    showGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束', this.canvas.width / 2, this.canvas.height / 2);

        const message = this.enemiesDefeated >= this.totalEnemies ? 
            '胜利！' : '游戏结束';
        this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
    }

    update() {
        if (this.isPaused) return;

        // 更新玩家控制
        if (this.keyStates) {
            // 玩家1控制
            if (this.keyStates['w']) this.player1.move('up', this.gameMap);
            if (this.keyStates['s']) this.player1.move('down', this.gameMap);
            if (this.keyStates['a']) this.player1.move('left', this.gameMap);
            if (this.keyStates['d']) this.player1.move('right', this.gameMap);
            if (this.keyStates[' ']) this.player1.shoot();

            // 玩家2控制
            if (this.keyStates['ArrowUp']) this.player2.move('up', this.gameMap);
            if (this.keyStates['ArrowDown']) this.player2.move('down', this.gameMap);
            if (this.keyStates['ArrowLeft']) this.player2.move('left', this.gameMap);
            if (this.keyStates['ArrowRight']) this.player2.move('right', this.gameMap);
            if (this.keyStates['Enter']) this.player2.shoot();
        }

        // 更新敌人生成
        this.enemySpawnCounter++;
        if (this.enemySpawnCounter >= this.enemySpawnDelay) {
            this.enemySpawnCounter = 0;
            this.spawnEnemy();
        }

        // 更新敌人
        this.enemies.forEach(enemy => {
            enemy.updateAI(this.gameMap, [this.player1, this.player2]);
            enemy.update(this.gameMap);
        });

        // 检查子弹碰撞
        this.checkBulletCollisions();

        this.player1.update(this.gameMap);
        this.player2.update(this.gameMap);
    }

    checkBulletCollisions() {
        // 检查玩家子弹是否击中敌人
        [this.player1, this.player2].forEach(player => {
            player.bullets.forEach((bullet, bulletIndex) => {
                this.enemies.forEach((enemy, enemyIndex) => {
                    if (this.checkCollision(bullet, enemy)) {
                        player.bullets.splice(bulletIndex, 1);
                        this.enemies.splice(enemyIndex, 1);
                        this.enemiesDefeated++;
                        // TODO: 添加爆炸效果
                    }
                });
            });
        });

        // 检查敌人子弹是否击中玩家
        this.enemies.forEach(enemy => {
            enemy.bullets.forEach((bullet, bulletIndex) => {
                [this.player1, this.player2].forEach(player => {
                    if (this.checkCollision(bullet, player)) {
                        enemy.bullets.splice(bulletIndex, 1);
                        // TODO: 玩家死亡逻辑
                    }
                });
            });
        });
    }

    checkCollision(bullet, tank) {
        return bullet.x >= tank.x && 
               bullet.x <= tank.x + tank.size &&
               bullet.y >= tank.y && 
               bullet.y <= tank.y + tank.size;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.gameMap.draw(this.ctx);
        this.player1.draw(this.ctx);
        this.player2.draw(this.ctx);

        // 绘制敌人
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        
        // 优化剩余敌人显示
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.shadowColor = '#000';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.fillText(`剩余敌人: ${this.totalEnemies - this.enemiesDefeated}`, 10, 30);
        
        // 清除阴影效果，避免影响其他绘制
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }

    gameLoop() {
        this.update();
        this.draw();

        if (window.gameOver) {
            this.showGameOver();
            return;
        }

        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        window.game = new TankGame(canvas);
    } else {
        console.error('找不到 canvas 元素');
    }
});