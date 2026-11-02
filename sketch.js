// ==========================================
// 1. 全域變數宣告區
// ==========================================

let gameState = "START";

let score = 60; 
let stage1Correct = false; // 第一關（聖劍關）是否通關
let stage2Correct = false; // 第二關（護盾關）是否通關

// 拼圖相關變數
let pieces = [];          
let selectedPiece = null; 
let targetGrid = [];      
let puzzleCompleted = false;

// 數學題目相關變數
let currentQuestion = "";
let currentOptions = [];
let correctAnswerIndex = 0;
let mathAnswered = false;

// 動畫相關變數
let animTimer = 0;
let heroX = 200;
let bossX = 600;

// ==========================================
// 2. p5.js 生命週期函式
// ==========================================

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent('game-container');
  textAlign(CENTER, CENTER);
  
  // 初始化第一關：聖劍拼圖
  initPuzzle(1);
}

function draw() {
  background(30, 30, 50);

  switch (gameState) {
    case "START":
      drawStartScreen();
      break;
    case "STAGE1_PUZZLE":
      drawPuzzleScreen("第一關：組裝【聖劍】拼圖 (拖曳至正確框內)", 1);
      break;
    case "STAGE1_MATH":
      drawMathScreen("第一關考驗：三位數加減法");
      break;
    case "STAGE1_REWARD":
      drawRewardScreen("恭喜獲得：【光之聖劍】！", "STAGE2_TRANSITION", "⚔️");
      break;
    case "STAGE2_TRANSITION":
      drawTransitionScreen("準備進入第二關...", "STAGE2_PUZZLE");
      break;
    case "STAGE2_PUZZLE":
      drawPuzzleScreen("第二關：組裝【護盾】拼圖 (拖曳至正確框內)", 2);
      break;
    case "STAGE2_MATH":
      drawMathScreen("第二關考驗：九九乘法與除法");
      break;
    case "STAGE2_REWARD":
      drawRewardScreen("恭喜獲得：【勇者之盾】！", "BOSS_ANIM", "🛡️");
      break;
    case "GAME_OVER_RETRY":
      drawRetryScreen();
      break;
    case "BOSS_ANIM":
      drawBossAnimScreen();
      break;
    case "RESULT":
      drawResultScreen();
      break;
  }
}

// ==========================================
// 3. 畫面與邏輯繪製函式
// ==========================================

// --- [A] 開始畫面 ---
function drawStartScreen() {
  fill(255);
  textSize(36);
  textStyle(BOLD);
  text("打敗魔王的數學勇者大冒險", width / 2, 180);
  
  textSize(20);
  textStyle(NORMAL);
  text("解開數學謎題，收集聖劍與護盾打敗魔王！", width / 2, 250);

  // 預設持有一劍一盾的勇者與魔王
  drawHero(250, 400, 1.2, true, true);
  drawBoss(550, 400, 1.2);

  drawButton(width / 2 - 80, 480, 160, 50, "開始冒險", () => {
    stage1Correct = false;
    stage2Correct = false;
    gameState = "STAGE1_PUZZLE";
    initPuzzle(1);
  });
}

// --- [B, G] 拼圖初始化與繪製 (type 1: 聖劍, type 2: 護盾) ---
function initPuzzle(type) {
  pieces = [];
  
  if (type === 1) {
    // 聖劍拼圖 4 個格子排成直線或十字形狀
    targetGrid = [
      { x: 500, y: 150, w: 80, h: 80, filled: false },
      { x: 500, y: 230, w: 80, h: 80, filled: false },
      { x: 500, y: 310, w: 80, h: 80, filled: false },
      { x: 500, y: 390, w: 80, h: 80, filled: false }
    ];
  } else {
    // 護盾拼圖 4 個格子排成方形
    targetGrid = [
      { x: 460, y: 200, w: 90, h: 90, filled: false },
      { x: 555, y: 200, w: 90, h: 90, filled: false },
      { x: 460, y: 295, w: 90, h: 90, filled: false },
      { x: 555, y: 295, w: 90, h: 90, filled: false }
    ];
  }

  let baseColor = (type === 1) ? color(230, 200, 50) : color(50, 150, 230);
  for (let i = 0; i < 4; i++) {
    pieces.push({
      id: i,
      x: random(60, 220),
      y: random(180, 380),
      w: 80,
      h: 80,
      c: baseColor,
      isPlaced: false
    });
  }
  puzzleCompleted = false;
}

function drawPuzzleScreen(titleText, type) {
  fill(255);
  textSize(24);
  text(titleText, width / 2, 70);

  // 繪製放置目標框外框提示
  stroke(255, 200, 0);
  strokeWeight(3);
  noFill();
  if (type === 1) {
    rect(490, 140, 100, 340, 10);
  } else {
    rect(450, 190, 205, 205, 10);
  }
  
  for (let grid of targetGrid) {
    stroke(255, 150);
    strokeWeight(2);
    rect(grid.x, grid.y, grid.w, grid.h);
  }

  // 繪製拼圖塊
  noStroke();
  let allPlaced = true;
  for (let p of pieces) {
    fill(p.c);
    rect(p.x, p.y, p.w, p.h, 8);
    fill(255);
    textSize(18);
    text(`${type === 1 ? '劍' : '盾'}${p.id + 1}`, p.x + p.w / 2, p.y + p.h / 2);

    if (!p.isPlaced) allPlaced = false;
  }

  // 拼圖完成自動跳轉
  if (allPlaced && !puzzleCompleted) {
    puzzleCompleted = true;
    setTimeout(() => {
      if (gameState === "STAGE1_PUZZLE") {
        setupMathQuestion(1);
        gameState = "STAGE1_MATH";
      } else if (gameState === "STAGE2_PUZZLE") {
        setupMathQuestion(2);
        gameState = "STAGE2_MATH";
      }
    }, 500);
  }
}

// --- [C, G] 數學問答畫面 ---
function setupMathQuestion(stage) {
  mathAnswered = false;
  if (stage === 1) {
    let num1 = floor(random(120, 450));
    let num2 = floor(random(100, 350));
    let ans = num1 + num2;
    currentQuestion = `${num1} + ${num2} = ?`;
    currentOptions = [ans, ans + 10, ans - 5, ans + 2].sort(() => random() - 0.5);
    correctAnswerIndex = currentOptions.indexOf(ans);
  } else {
    let a = floor(random(4, 9));
    let b = floor(random(6, 9));
    let ans = a * b;
    currentQuestion = `${a} × ${b} = ?`;
    currentOptions = [ans, ans + 4, ans - 3, ans + 6].sort(() => random() - 0.5);
    correctAnswerIndex = currentOptions.indexOf(ans);
  }
}

function drawMathScreen(titleText) {
  fill(255);
  textSize(24);
  text(titleText, width / 2, 80);

  fill(40, 50, 90);
  stroke(255);
  strokeWeight(2);
  rect(150, 140, 500, 120, 15);
  
  fill(255, 230, 100);
  textSize(36);
  noStroke();
  text(currentQuestion, width / 2, 200);

  for (let i = 0; i < currentOptions.length; i++) {
    let btnX = (i % 2 === 0) ? 180 : 430;
    let btnY = (i < 2) ? 300 : 390;
    
    drawButton(btnX, btnY, 190, 60, `${currentOptions[i]}`, () => {
      if (mathAnswered) return;
      mathAnswered = true;
      
      if (i === correctAnswerIndex) {
        if (gameState === "STAGE1_MATH") {
          stage1Correct = true;
          gameState = "STAGE1_REWARD";
        } else if (gameState === "STAGE2_MATH") {
          stage2Correct = true;
          gameState = "STAGE2_REWARD";
        }
      } else {
        if (gameState === "STAGE1_MATH") {
          stage1Correct = false;
          gameState = "STAGE2_TRANSITION"; // 雖答錯，進入第二關
        } else if (gameState === "STAGE2_MATH") {
          stage2Correct = false;
          if (stage1Correct) {
            gameState = "BOSS_ANIM"; // 聖劍對、護盾錯 -> 進入BOSS
          } else {
            gameState = "GAME_OVER_RETRY"; // 兩關皆錯 -> 失敗重試
          }
        }
      }
    });
  }
}

// --- [D, H1, H] 裝備獲得畫面 ---
function drawRewardScreen(rewardText, nextState, iconStr) {
  fill(255, 215, 0);
  textSize(32);
  text("獲得戰利品！", width / 2, 120);

  fill(255);
  textSize(24);
  text(rewardText, width / 2, 200);

  stroke(255, 215, 0);
  strokeWeight(4);
  fill(100, 50, 200);
  rect(width / 2 - 60, 250, 120, 120, 15);
  
  fill(255);
  noStroke();
  textSize(50);
  text(iconStr, width / 2, 310);

  drawButton(width / 2 - 80, 440, 160, 50, "繼續冒險", () => {
    gameState = nextState;
    if (nextState === "STAGE2_PUZZLE") initPuzzle(2);
  });
}

// --- [E, F] 過渡畫面 ---
function drawTransitionScreen(msgText, targetState) {
  fill(255);
  textSize(28);
  text("第一關完成！", width / 2, 180);
  textSize(20);
  text(msgText, width / 2, 240);

  drawButton(width / 2 - 80, 360, 160, 50, "點擊開始", () => {
    gameState = targetState;
    if (targetState === "STAGE2_PUZZLE") initPuzzle(2);
  });
}

// --- [J] 失敗重試畫面 ---
function drawRetryScreen() {
  fill(255, 100, 100);
  textSize(32);
  text("挑戰失敗！", width / 2, 180);
  
  fill(255);
  textSize(22);
  text("你還需要變得更厲害喔！", width / 2, 260);

  drawButton(width / 2 - 90, 380, 180, 50, "點擊再試一次", () => {
    stage1Correct = false;
    stage2Correct = false;
    gameState = "START";
  });
}

// --- [J1, J2, J3] BOSS 動畫對打畫面 ---
function drawBossAnimScreen() {
  fill(255);
  textSize(28);
  text("⚔️ BOSS 決戰時刻 ⚔️", width / 2, 80);

  if (stage1Correct && stage2Correct) {
    score = 100; // K1
  } else if (!stage1Correct && stage2Correct) {
    score = 80;  // K2 (沒聖劍，有護盾)
  } else {
    score = 60;  // K3 (有聖劍，沒護盾，或兩者皆無)
  }

  animTimer += 0.05;
  heroX = 200 + sin(animTimer * 5) * 40;
  bossX = 600 - sin(animTimer * 5) * 20;

  // 根據通關與否決定主角是否拿著聖劍與護盾
  drawHero(heroX, 350, 1.3, stage1Correct, stage2Correct);
  drawBoss(bossX, 350, 1.3);

  if (sin(animTimer * 5) > 0.5) {
    stroke(255, 255, 0);
    strokeWeight(5);
    line(heroX + 40, 300, bossX - 40, 350);
    noStroke();
  }

  if (animTimer > 15) {
    animTimer = 0;
    gameState = "RESULT";
  }
}

// --- [K1, K2, K3, L] 結算畫面 ---
function drawResultScreen() {
  fill(255, 215, 0);
  textSize(36);
  text("🎉 冒險勝利 🎉", width / 2, 120);

  fill(255);
  textSize(28);
  text(`戰勝BOSS！你是 ${score} 分的勇者！`, width / 2, 220);

  // 結算畫麵同樣維持其裝備判定狀態
  drawHero(width / 2, 340, 1.5, stage1Correct, stage2Correct);

  fill(200, 255, 200);
  textSize(20);
  text("是否要再玩一次呢？", width / 2, 450);

  drawButton(width / 2 - 80, 490, 160, 50, "同意 (再試一次)", () => {
    stage1Correct = false;
    stage2Correct = false;
    gameState = "START";
  });
}

// ==========================================
// 4. 角色繪製函式 (動態調整裝備顯示)
// ==========================================

// 繪製勇者：hasSword (有無聖劍), hasShield (有無護盾)
function drawHero(x, y, s, hasSword, hasShield) {
  push();
  translate(x, y);
  scale(s);
  
  // 身體/盔甲
  fill(50, 120, 220);
  rect(-20, -10, 40, 50, 5);

  // 頭部
  fill(255, 220, 180);
  ellipse(0, -30, 40, 40);
  // 頭髮
  fill(255, 200, 0);
  arc(0, -35, 45, 30, PI, TWO_PI);
  // 眼睛
  fill(0);
  ellipse(-7, -30, 5, 5);
  ellipse(7, -30, 5, 5);

  // 護盾（若第二關沒過則不顯示）
  if (hasShield) {
    fill(50, 150, 230);
    stroke(255, 215, 0);
    strokeWeight(2);
    rect(-32, -5, 15, 25, 4);
    noStroke();
  }

  // 聖劍（若第一關沒過則不顯示）
  if (hasSword) {
    stroke(200, 220, 255);
    strokeWeight(4);
    line(22, 10, 38, -25);
    fill(255, 215, 0);
    noStroke();
    rect(18, 8, 10, 4);
  }
  
  pop();
}

// 繪製魔王 (BOSS)
function drawBoss(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  
  fill(100, 30, 120);
  rect(-35, -20, 70, 70, 10);
  fill(130, 40, 150);
  ellipse(0, -40, 60, 50);
  fill(200, 30, 30);
  triangle(-20, -55, -30, -80, -10, -60);
  triangle(20, -55, 30, -80, 10, -60);
  fill(255, 0, 0);
  ellipse(-12, -42, 10, 10);
  ellipse(12, -42, 10, 10);
  fill(0);
  arc(0, -25, 30, 15, 0, PI);
  fill(255);
  triangle(-8, -25, -4, -25, -6, -20);
  triangle(4, -25, 8, -25, 6, -20);
  
  pop();
}

// 按鈕繪製元件
function drawButton(x, y, w, h, label, callback) {
  let isHover = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
  
  stroke(255);
  strokeWeight(2);
  fill(isHover ? color(80, 180, 240) : color(40, 100, 200));
  rect(x, y, w, h, 10);

  fill(255);
  noStroke();
  textSize(18);
  textStyle(BOLD);
  text(label, x + w / 2, y + h / 2);

  if (isHover && mouseIsPressed) {
    mouseIsPressed = false;
    callback();
  }
}

// ==========================================
// 5. 滑鼠拖曳拼圖互動邏輯
// ==========================================

function mousePressed() {
  if (gameState !== "STAGE1_PUZZLE" && gameState !== "STAGE2_PUZZLE") return;

  for (let p of pieces) {
    if (!p.isPlaced && mouseX > p.x && mouseX < p.x + p.w && mouseY > p.y && mouseY < p.y + p.h) {
      selectedPiece = p;
      break;
    }
  }
}

function mouseDragged() {
  if (selectedPiece) {
    selectedPiece.x = mouseX - selectedPiece.w / 2;
    selectedPiece.y = mouseY - selectedPiece.h / 2;
  }
}

function mouseReleased() {
  if (selectedPiece) {
    let target = targetGrid[selectedPiece.id];
    let d = dist(selectedPiece.x, selectedPiece.y, target.x, target.y);
    
    if (d < 40) {
      selectedPiece.x = target.x;
      selectedPiece.y = target.y;
      selectedPiece.isPlaced = true;
      target.filled = true;
    }
    selectedPiece = null;
  }
}