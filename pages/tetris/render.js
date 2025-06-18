class Tetris {
    constructor(gameCanvas, nextCanvas) {
        this.gameCanvas = gameCanvas;
        this.nextCanvas = nextCanvas;
        this.ctx = gameCanvas.getContext('2d');
        this.nextCtx = nextCanvas.getContext('2d');
        this.blockSize = 30;
        this.cols = 10;
        this.rows = 20;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.isPaused = false;
        this.gameLoop = null;
        this.animationId = null; // 添加这一行来存储动画帧ID

        // 定义方块形状
        this.shapes = {
            I: [[1, 1, 1, 1]],
            L: [[1, 0], [1, 0], [1, 1]],
            J: [[0, 1], [0, 1], [1, 1]],
            O: [[1, 1], [1, 1]],
            Z: [[1, 1, 0], [0, 1, 1]],
            S: [[0, 1, 1], [1, 1, 0]],
            T: [[1, 1, 1], [0, 1, 0]]
        };

        // 定义方块颜色
        this.colors = {
            I: '#00f0f0',
            L: '#f0a000',
            J: '#0000f0',
            O: '#f0f000',
            Z: '#f00000',
            S: '#00f000',
            T: '#a000f0'
        };

        this.currentPiece = null;
        this.nextPiece = null;
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        
        this.bindEvents();
        this.showStartScreen();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.isPaused && this.currentPiece) {
                switch(e.key) {
                    case 'ArrowLeft':
                        this.movePiece(-1, 0);
                        break;
                    case 'ArrowRight':
                        this.movePiece(1, 0);
                        break;
                    case 'ArrowDown':
                        this.movePiece(0, 1);
                        break;
                    case 'ArrowUp':
                        this.rotatePiece();
                        break;
                    // 删除空格键的 case
                }
            }
        });

        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('backBtn').addEventListener('click', () => {
            if (this.gameLoop) {
                cancelAnimationFrame(this.gameLoop);
            }
            window.location.href = '../menu/index.html';
        });
    }

    createPiece() {
        const shapes = Object.keys(this.shapes);
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        return {
            shape: shape,
            matrix: this.shapes[shape],
            color: this.colors[shape],
            x: Math.floor(this.cols / 2) - Math.floor(this.shapes[shape][0].length / 2),
            y: 0
        };
    }

    drawBlock(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize - 1, this.blockSize - 1);
        
        // 添加高光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize - 1, 2);
        ctx.fillRect(x * this.blockSize, y * this.blockSize, 2, this.blockSize - 1);
    }

    drawPiece(ctx, piece, offsetX = 0, offsetY = 0) {
        piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.drawBlock(
                        ctx,
                        piece.x + x + offsetX,
                        piece.y + y + offsetY,
                        piece.color
                    );
                }
            });
        });
    }

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

        // 绘制已固定的方块
        this.board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.drawBlock(this.ctx, x, y, value);
                }
            });
        });

        // 绘制当前方块
        if (this.currentPiece) {
            this.drawPiece(this.ctx, this.currentPiece);
        }

        // 绘制下一个方块
        if (this.nextPiece) {
            const offsetX = (4 - this.nextPiece.matrix[0].length) / 2;
            const offsetY = (4 - this.nextPiece.matrix.length) / 2;
            this.drawPiece(this.nextCtx, this.nextPiece, offsetX, offsetY);
        }
    }

    movePiece(dx, dy) {
        this.currentPiece.x += dx;
        this.currentPiece.y += dy;
        
        if (this.checkCollision()) {
            this.currentPiece.x -= dx;
            this.currentPiece.y -= dy;
            
            // 只有在向下移动时才锁定方块
            if (dy > 0) {
                this.lockPiece();
                this.clearLines();
                this.spawnPiece();
            }
            return false;
        }
        return true;
    }

    rotatePiece() {
        const matrix = this.currentPiece.matrix;
        const newMatrix = matrix[0].map((_, i) => 
            matrix.map(row => row[i]).reverse()
        );
        
        const originalMatrix = this.currentPiece.matrix;
        this.currentPiece.matrix = newMatrix;
        
        if (this.checkCollision()) {
            this.currentPiece.matrix = originalMatrix;
        }
    }

    dropPiece() {
        let collided = false;
        while (!collided) {
            this.currentPiece.y += 1;
            
            if (this.checkCollision()) {
                // 如果发生碰撞，回退一步并锁定方块
                this.currentPiece.y -= 1;
                this.lockPiece();
                this.clearLines();
                this.spawnPiece();
                collided = true;
            }
        }
    }

    lockPiece() {
        this.currentPiece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    // 确保方块在有效范围内
                    if (boardY >= 0 && boardY < this.rows && 
                        boardX >= 0 && boardX < this.cols) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            });
        });
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                // 移除完整的行
                this.board.splice(y, 1);
                // 在顶部添加新的空行
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++; // 检查同一行（因为上面的行下移了）
            }
        }

        if (linesCleared > 0) {
            this.updateScore(linesCleared);
        }
    }

    checkCollision() {
        return this.currentPiece.matrix.some((row, dy) => {
            return row.some((value, dx) => {
                if (!value) return false;
                
                const newX = this.currentPiece.x + dx;
                const newY = this.currentPiece.y + dy;
                
                return (
                    newX < 0 || // 左边界
                    newX >= this.cols || // 右边界
                    newY >= this.rows || // 底边界
                    (newY >= 0 && this.board[newY][newX]) // 与已有方块碰撞
                );
            });
        });
    }

    update() {
        const speed = Math.max(100, 1000 - (this.level - 1) * 100);
        const now = Date.now();
        
        if (!this.lastUpdate || now - this.lastUpdate > speed) {
            this.movePiece(0, 1); // 向下移动
            this.lastUpdate = now;
        }
    }

    startGameLoop() {  // 添加新方法
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
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.isPaused = false;
        this.lastUpdate = null;  // 添加这一行
        
        document.getElementById('score').textContent = '0';
        document.getElementById('lines').textContent = '0';
        document.getElementById('level').textContent = '1';

        this.nextPiece = this.createPiece();
        this.spawnPiece();
        this.startGameLoop();  // 修改这一行
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pauseBtn').textContent = this.isPaused ? '继续' : '暂停';
    }

    showStartScreen() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            '点击"开始游戏"按钮开始',
            this.gameCanvas.width / 2,
            this.gameCanvas.height / 2
        );
    }

    gameOver() {
        if (this.animationId) {  // 添加检查
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束', this.gameCanvas.width / 2, this.gameCanvas.height / 2);
        this.ctx.font = '20px Arial';
        this.ctx.fillText(
            `最终得分: ${this.score}`,
            this.gameCanvas.width / 2,
            this.gameCanvas.height / 2 + 40
        );
    }
    
    spawnPiece() {
        // 使用下一个方块作为当前方块
        this.currentPiece = this.nextPiece || this.createPiece();
        // 创建新的下一个方块
        this.nextPiece = this.createPiece();
        
        // 设置初始位置为顶部中间
        this.currentPiece.x = Math.floor(this.cols / 2) - Math.floor(this.currentPiece.matrix[0].length / 2);
        this.currentPiece.y = 0;

        // 检查是否游戏结束
        if (this.checkCollision()) {
            this.gameOver();
            return false;
        }

        return true;
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const gameCanvas = document.getElementById('gameCanvas');
    const nextCanvas = document.getElementById('nextCanvas');
    if (gameCanvas && nextCanvas) {
        window.game = new Tetris(gameCanvas, nextCanvas);
    } else {
        console.error('找不到 canvas 元素');
    }
});