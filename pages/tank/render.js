class TankGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameMap = new GameMap();
        
        // 创建玩家坦克
        this.player1 = new Tank({
            x: 4 * 32,
            y: 9 * 32,
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
            x: 8 * 32,
            y: 9 * 32,
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

    update() {
        if (this.isPaused) return;

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

        this.player1.update(this.gameMap);
        this.player2.update(this.gameMap);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.gameMap.draw(this.ctx);
        this.player1.draw(this.ctx);
        this.player2.draw(this.ctx);
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

    startGame() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.gameOver = false;
        this.isPaused = false;
        this.gameLoop();
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