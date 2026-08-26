// 许健恶搞游乐场 游戏逻辑引擎
document.addEventListener('DOMContentLoaded', () => {

  // ===== Web Audio 简单合成音效（无需外部音频文件） =====
  const audioCtx = (window.AudioContext || window.webkitAudioContext) ? new (window.AudioContext || window.webkitAudioContext)() : null;
  
  function playBeep(freq = 440, type = 'sine', duration = 0.1) {
    if (!audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
  }

  // ===== 1. 选项卡切换 =====
  const tabBtns = document.querySelectorAll('.tab-btn');
  const gamePanels = document.querySelectorAll('.game-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      gamePanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.target);
      if (target) target.classList.add('active');
      playBeep(520, 'triangle', 0.08);
    });
  });

  // ==========================================
  // ===== 2. 游戏一：暴打许健 / 戳戳乐 =====
  // ==========================================
  let hitCount = 0;
  let comboCount = 0;
  let comboTimer = null;
  let autoWhackInterval = null;

  const hitWords = [
    "💥 借200块充话费！",
    "📱 安卓手机壳送苹果！",
    "🎮 刚在开团收不住！",
    "💸 AA制我最近手头紧！",
    "💔 我配不上你（隔天官宣）！",
    "🥩 红烧肉盗图英雄所见！",
    "🔗 拼多多帮我砍一刀！",
    "🤡 朋友圈高效广撒网！",
    "😤 暴击！混蛋值 +999！",
    "🙄 怎么没化妆啊！"
  ];

  const titles = [
    { threshold: 0, title: "路过的吃瓜群众" },
    { threshold: 10, title: "初级反诈受害者" },
    { threshold: 30, title: "反借钱先锋斗士" },
    { threshold: 60, title: "鉴海王十级学者" },
    { threshold: 100, title: "暴打许健全国总冠军 👑" }
  ];

  const hitCountEl = document.getElementById('hit-count');
  const comboCountEl = document.getElementById('combo-count');
  const titleEl = document.getElementById('player-title');
  const targetCard = document.getElementById('whack-target');
  const targetEmoji = document.getElementById('target-emoji');
  const targetStatus = document.getElementById('target-status');
  const rageFill = document.getElementById('rage-fill');
  const flyingContainer = document.getElementById('flying-texts');
  const btnHit = document.getElementById('btn-hit');
  const btnAutoWhack = document.getElementById('btn-auto-whack');
  const btnResetWhack = document.getElementById('btn-reset-whack');

  const emojis = ['🤡', '💩', '🤦', '🙄', '😵', '😵‍💫', '😭'];

  function updateWhackTitle() {
    for (let i = titles.length - 1; i >= 0; i--) {
      if (hitCount >= titles[i].threshold) {
        titleEl.textContent = titles[i].title;
        break;
      }
    }
  }

  function spawnFlyingText(x, y) {
    const text = hitWords[Math.floor(Math.random() * hitWords.length)];
    const el = document.createElement('div');
    el.className = 'flying-word';
    el.textContent = text;
    el.style.left = (x || (40 + Math.random() * 20)) + '%';
    el.style.top = (y || (40 + Math.random() * 20)) + '%';
    flyingContainer.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  function doHit() {
    hitCount++;
    comboCount++;
    hitCountEl.textContent = hitCount;
    comboCountEl.textContent = comboCount;

    // 充能条
    const ragePercent = (comboCount * 5) % 100;
    rageFill.style.width = ragePercent + '%';

    // 随机更换受击表情
    targetEmoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    // 动画类
    targetCard.classList.remove('hit');
    void targetCard.offsetWidth; // 触发重绘
    targetCard.classList.add('hit');

    // 吐槽语
    targetStatus.textContent = comboCount > 20 ? "“别打了别打了，我把200还你！”" : "“嗷！你还真打啊？！”";

    // 飘字
    spawnFlyingText();

    // 称号
    updateWhackTitle();

    // 音效
    playBeep(200 + Math.min(comboCount * 20, 600), 'sawtooth', 0.08);

    // 连击重置定时器
    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => {
      comboCount = 0;
      comboCountEl.textContent = '0';
      rageFill.style.width = '0%';
      targetStatus.textContent = "“呼……终于停手了。”";
      targetEmoji.textContent = '🤡';
    }, 1800);
  }

  if (targetCard) targetCard.addEventListener('click', doHit);
  if (btnHit) btnHit.addEventListener('click', doHit);

  // 自动连点器
  if (btnAutoWhack) {
    btnAutoWhack.addEventListener('click', () => {
      if (autoWhackInterval) {
        clearInterval(autoWhackInterval);
        autoWhackInterval = null;
        btnAutoWhack.textContent = '⚡ 开启自动连点器';
        btnAutoWhack.classList.remove('active');
      } else {
        autoWhackInterval = setInterval(doHit, 200);
        btnAutoWhack.textContent = '🛑 停止自动连点';
        btnAutoWhack.classList.add('active');
      }
    });
  }

  // 重置
  if (btnResetWhack) {
    btnResetWhack.addEventListener('click', () => {
      if (autoWhackInterval) {
        clearInterval(autoWhackInterval);
        autoWhackInterval = null;
        btnAutoWhack.textContent = '⚡ 开启自动连点器';
      }
      hitCount = 0;
      comboCount = 0;
      hitCountEl.textContent = '0';
      comboCountEl.textContent = '0';
      rageFill.style.width = '0%';
      titleEl.textContent = titles[0].title;
      targetStatus.textContent = "“哎呀，你点我干嘛？”";
      targetEmoji.textContent = '🤡';
    });
  }

  // ==========================================
  // ===== 3. 游戏二：离谱借口大转盘 =====
  // ==========================================
  const wheel = document.getElementById('wheel-disc');
  const btnSpin = document.getElementById('btn-spin');
  const excuseResult = document.getElementById('excuse-result');
  const resultText = document.getElementById('result-text');
  const resultComment = document.getElementById('result-comment');

  const excuses = [
    { text: "“借200充话费，朋友之间这点忙都不帮？”", comment: "鉴定结论：建议立刻拉黑，并回敬一句‘那你去借呗’！" },
    { text: "“刚才排位开团收不住手，才迟到了一个半小时。”", comment: "鉴定结论：他的真爱是水晶枢纽，你只是背景板。" },
    { text: "“虽然你用苹果，但我送你安卓手机壳留着以后换手机用。”", comment: "鉴定结论：拼多多九块九的顶级礼物刺客。" },
    { text: "“朋友圈同时发三条文案配三个人，叫高效广撒网匹配。”", comment: "鉴定结论：海王自白书，建议全网通报。" },
    { text: "“红烧肉盗图水印没擦？这是英雄所见略同。”", comment: "鉴定结论：死鸭子嘴硬天花板，厚脸皮宗师。" },
    { text: "“来帮我砍一刀浇水助力领现金吧宝贝！”", comment: "鉴定结论：不是来谈恋爱的，是来做社群裂变运营的。" },
    { text: "“你今天怎么没化妆啊？这家餐厅咱 AA 吧。”", comment: "鉴定结论：直男癌晚期 + AA侠合体形态。" },
    { text: "“是我配不上你（隔天换情头官宣新欢）。”", comment: "鉴定结论：批量生产借口，无缝衔接冲恋爱 KPI。" }
  ];

  let currentRotation = 0;
  let isSpinning = false;

  if (btnSpin && wheel) {
    btnSpin.addEventListener('click', () => {
      if (isSpinning) return;
      isSpinning = true;
      btnSpin.disabled = true;
      excuseResult.style.display = 'none';

      // 随机选一个索引 (0 ~ 7)
      const targetIndex = Math.floor(Math.random() * excuses.length);
      // 每个扇区 45 度，转动多圈 (5~8圈) + 偏移
      const sliceDeg = 45;
      const extraRounds = 360 * (5 + Math.floor(Math.random() * 3));
      // 指针在顶部 (0度)，由于顺时针旋转，第 targetIndex 个扇区停在顶部所需的最终角度
      const targetAngle = 360 - (targetIndex * sliceDeg + sliceDeg / 2);
      
      currentRotation += extraRounds + (targetAngle - (currentRotation % 360));
      wheel.style.transform = `rotate(${currentRotation}deg)`;

      // 旋转音效
      let beepCount = 0;
      const beepInterval = setInterval(() => {
        playBeep(400 + beepCount * 30, 'triangle', 0.05);
        beepCount++;
        if (beepCount > 15) clearInterval(beepInterval);
      }, 180);

      setTimeout(() => {
        isSpinning = false;
        btnSpin.disabled = false;
        resultText.textContent = excuses[targetIndex].text;
        resultComment.textContent = excuses[targetIndex].comment;
        excuseResult.style.display = 'block';
        playBeep(660, 'square', 0.3);
      }, 3600);
    });
  }

  // ==========================================
  // ===== 4. 游戏三：避雷接物大作战 =====
  // ==========================================
  const canvas = document.getElementById('dodge-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const overlay = document.getElementById('game-overlay');
  const btnStartDodge = document.getElementById('btn-start-dodge');
  const timerEl = document.getElementById('game-timer');
  const scoreEl = document.getElementById('game-score');
  const highscoreEl = document.getElementById('game-highscore');
  const btnLeft = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');

  let dodgeScore = 0;
  let dodgeHighScore = 0;
  let dodgeTimeLeft = 30;
  let dodgeTimerInterval = null;
  let dodgeAnimId = null;
  let isDodgeRunning = false;

  // 玩家挡板
  const player = {
    x: 260,
    y: 340,
    width: 80,
    height: 30,
    speed: 7,
    moveLeft: false,
    moveRight: false
  };

  // 掉落物品类型
  const itemTypes = [
    { text: "🧾 借200", type: "bad", score: -10, color: "#ff4757" },
    { text: "📱 安卓壳", type: "bad", score: -10, color: "#ff4757" },
    { text: "🔗 砍一刀", type: "bad", score: -10, color: "#ff4757" },
    { text: "🥩 盗图肉", type: "bad", score: -10, color: "#ff4757" },
    { text: "💔 KPI无缝", type: "bad", score: -15, color: "#ff4757" },
    { text: "🚫 一键拉黑", type: "good", score: 20, color: "#2ed573" },
    { text: "🛡️ 避雷成功", type: "good", score: 15, color: "#2ed573" },
    { text: "💵 拒绝AA", type: "good", score: 15, color: "#2ed573" }
  ];

  let fallingItems = [];

  function resetDodgeGame() {
    dodgeScore = 0;
    dodgeTimeLeft = 30;
    scoreEl.textContent = '0';
    timerEl.textContent = '30s';
    fallingItems = [];
    player.x = (canvas.width - player.width) / 2;
  }

  function spawnDodgeItem() {
    if (!isDodgeRunning) return;
    const item = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    fallingItems.push({
      x: 30 + Math.random() * (canvas.width - 90),
      y: -20,
      width: 60,
      height: 24,
      speed: 2 + Math.random() * 2.5,
      ...item
    });
  }

  function updateDodgeGame() {
    if (!isDodgeRunning || !ctx) return;

    // 清屏
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 移动玩家
    if (player.moveLeft && player.x > 10) player.x -= player.speed;
    if (player.moveRight && player.x + player.width < canvas.width - 10) player.x += player.speed;

    // 绘制玩家小车 / 盾牌
    ctx.fillStyle = "#ffa502";
    ctx.beginPath();
    ctx.roundRect(player.x, player.y, player.width, player.height, 8);
    ctx.fill();
    ctx.fillStyle = "#1a0f0f";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🛡️ 避雷盾", player.x + player.width / 2, player.y + 20);

    // 掉落物品逻辑
    if (Math.random() < 0.04) spawnDodgeItem();

    for (let i = fallingItems.length - 1; i >= 0; i--) {
      const it = fallingItems[i];
      it.y += it.speed;

      // 绘制物品
      ctx.fillStyle = it.color;
      ctx.beginPath();
      ctx.roundRect(it.x, it.y, it.width, it.height, 6);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(it.text, it.x + it.width / 2, it.y + 16);

      // 碰撞检测 (AABB)
      if (
        it.x < player.x + player.width &&
        it.x + it.width > player.x &&
        it.y < player.y + player.height &&
        it.y + it.height > player.y
      ) {
        dodgeScore += it.score;
        scoreEl.textContent = dodgeScore;
        playBeep(it.type === 'good' ? 600 : 180, it.type === 'good' ? 'sine' : 'sawtooth', 0.1);
        fallingItems.splice(i, 1);
        continue;
      }

      // 超出底端移除
      if (it.y > canvas.height + 30) {
        fallingItems.splice(i, 1);
      }
    }

    dodgeAnimId = requestAnimationFrame(updateDodgeGame);
  }

  function startDodgeGame() {
    resetDodgeGame();
    isDodgeRunning = true;
    overlay.classList.add('hidden');

    dodgeTimerInterval = setInterval(() => {
      dodgeTimeLeft--;
      timerEl.textContent = dodgeTimeLeft + 's';
      if (dodgeTimeLeft <= 0) {
        endDodgeGame();
      }
    }, 1000);

    updateDodgeGame();
  }

  function endDodgeGame() {
    isDodgeRunning = false;
    clearInterval(dodgeTimerInterval);
    cancelAnimationFrame(dodgeAnimId);

    if (dodgeScore > dodgeHighScore) {
      dodgeHighScore = dodgeScore;
      highscoreEl.textContent = dodgeHighScore;
    }

    let evaluation = "鉴定结果：被许健借光了钱包，急需充值智商！💸";
    if (dodgeScore >= 100) evaluation = "鉴定结果：避雷界顶级宗师！许健见你绕道走！🏆";
    else if (dodgeScore >= 50) evaluation = "鉴定结果：鉴渣大师，成功保住 200 块话费！🛡️";
    else if (dodgeScore > 0) evaluation = "鉴定结果：险象环生，建议少看朋友圈！👀";

    const title = document.getElementById('overlay-title');
    const desc = document.getElementById('overlay-desc');
    title.textContent = `🎮 挑战结束！最终得分：${dodgeScore}`;
    desc.innerHTML = `${evaluation}<br><br>点击下方按钮可再次挑战！`;
    overlay.classList.remove('hidden');
    btnStartDodge.textContent = '🔄 再次挑战';
  }

  if (btnStartDodge) btnStartDodge.addEventListener('click', startDodgeGame);

  // 键盘控制
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') player.moveLeft = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') player.moveRight = true;
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') player.moveLeft = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') player.moveRight = false;
  });

  // 手机端按钮控制
  if (btnLeft) {
    btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); player.moveLeft = true; });
    btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); player.moveLeft = false; });
    btnLeft.addEventListener('mousedown', () => player.moveLeft = true);
    btnLeft.addEventListener('mouseup', () => player.moveLeft = false);
  }
  if (btnRight) {
    btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); player.moveRight = true; });
    btnRight.addEventListener('touchend', (e) => { e.preventDefault(); player.moveRight = false; });
    btnRight.addEventListener('mousedown', () => player.moveRight = true);
    btnRight.addEventListener('mouseup', () => player.moveRight = false);
  }

  console.log('%c🎮 许健恶搞游乐场已加载完毕！', 'color:#ffa502;font-size:16px;font-weight:bold;');
});
