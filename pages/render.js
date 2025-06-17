class Snake {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.food = this.generateFood();
        this.score = 0;
        this.gameLoop = null;
        this.isPaused = false;
        
        this.bindEvents();
        this.showStartScreen();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    }

    handleKeyPress(e) {
        const keys = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
        };

        if (keys[e.key]) {
            e.preventDefault();
            const newDirection = keys[e.key];
            const opposites = {
                'up': 'down',
                'down': 'up',
                'left': 'right',
                'right': 'left'
            };

            if (this.direction !== opposites[newDirection]) {
                this.direction = newDirection;
            }
        }
    }

    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        return {x, y};
    }

    drawSquare(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * this.gridSize,
            y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );
    }

    draw() {
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制蛇
        this.snake.forEach((segment, i) => {
            const color = i === 0 ? '#4CAF50' : '#45a049';
            this.drawSquare(segment.x, segment.y, color);
        });

        // 绘制食物
        this.drawSquare(this.food.x, this.food.y, '#ff0000');
    }

    move() {
        const head = {...this.snake[0]};

        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // 检查是否撞墙
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            this.gameOver();
            return;
        }

        // 检查是否撞到自己
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    gameOver() {
        clearInterval(this.gameLoop);
        alert(`游戏结束！最终得分：${this.score}`);
        this.resetGame();
    }

    resetGame() {
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.score = 0;
        document.getElementById('score').textContent = '0';
        this.food = this.generateFood();
        this.isPaused = false;
        this.showStartScreen();
    }

    startGame() {
        // 清除之前的游戏循环
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        // 重置游戏状态
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.score = 0;
        document.getElementById('score').textContent = '0';
        this.food = this.generateFood();
        this.isPaused = false;
        
        // 启动新的游戏循环
        this.gameLoop = setInterval(() => {
            if (!this.isPaused) {
                this.move();
                this.draw();
            }
        }, 150);
        
        // 更新按钮文本
        document.getElementById('pauseBtn').textContent = '暂停';
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
        this.ctx.fillText('点击"开始游戏"按钮开始', this.canvas.width/2, this.canvas.height/2);
    }
}

// 确保 DOM 加载完成后再初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        window.game = new Snake(canvas); // 将游戏实例存储在全局变量中
    } else {
        console.error('找不到 canvas 元素');
    }
});