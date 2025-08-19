document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button'); 
    const winRestartButton = document.getElementById('win-restart-button'); 
    const resumeButton = document.getElementById('resume-button'); 
    const pauseRestartButton = document.getElementById('pause-restart-button'); 
    let game;
    
    function startGame() {
        document.getElementById('start-screen').classList.add('hidden');
        if (!game) {
            game = new Game(canvas);
        } else {
            game.restart();
        }
    }
    
   
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
    
    
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            if (game) {
                game.restart();
            } else {
                startGame();
            }
        });
    }
    
   
    if (winRestartButton) {
        winRestartButton.addEventListener('click', () => {
            if (game) {
                game.restart();
            } else {
                startGame();
            }
        });
    }
    
    
    if (resumeButton) {
        resumeButton.addEventListener('click', () => {
            if (game) {
                game.resume();
            }
        });
    }
    
    
    if (pauseRestartButton) {
        pauseRestartButton.addEventListener('click', () => {
            if (game) {
                game.restart();
            } else {
                startGame();
            }
        });
    }
    
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !game) {
            startGame();
        }
    });
    
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (game) {
                game.setupCanvas();
            }
        }, 100);
    });
});