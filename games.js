// 许健恶搞游乐场 游戏逻辑引擎 (全功能修复与优化版)
document.addEventListener('DOMContentLoaded', () => {

  // ===== 1. Web Audio 简单合成音效（自适应激活） =====
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playBeep(freq = 440, type = 'sine', duration = 0.1) {
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
  }

  // 页面首次任意交互时激活音频
  window.addEventListener('click', initAudio, { once: true });
  window.addEventListener('touchstart', initAudio, { once: true });

  // ==========================================
  // ===== 2. 选项卡切换系统 =====
  // ==========================================
  const tabBtns = document.querySelectorAll('.tab-btn');
  const gamePanels = document.querySelectorAll('.game-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      initAudio();
      tabBtns.forEach(b => b.classList.remove('active'));
      gamePanels.forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      const targetId = btn.dataset.target;
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
      playBeep(520, 'triangle', 0.08);
    });
  });

  // ==========================================
  // ===== 3. 游戏一：暴打许健 / 戳戳乐 =====
  // ==========================================
  let hitCount = 0;
  let comboCount = 0;
  let comboTimer = null;
  let autoWhackInterval = null;
  let achievementUnlocked = false;

  const whackStage = document.getElementById('whack-stage') || document.querySelector('.whack-stage');
  const achievementModal = document.getElementById('achievement-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const modalBackdrop = document.getElementById('modal-backdrop');

  const hitWords = [
    "💥 借500充话费说是天使轮投资！",
    "📱 敏捷极简交付送苹果安卓壳！",
    "🎮 跑单元测试实则0-12峡谷带妹！",
    "💸 前端状态解耦咖啡AA侠！",
    "💔 模板复用挽回信忘记替换女方名字！",
    "🥩 红烧肉带美团外卖条形码！",
    "🔗 拼多多砍一刀强行插入需求！",
    "🤡 8线程同时聊天叫分布式高并发！",
    "🛡️ CVE-99999 致命高危渣男漏洞！",
    "🚫 git reset --hard 永久拒合PR！"
  ];

  const titles = [
    { threshold: 0, title: "初级受害者 (吃瓜)" },
    { threshold: 5, title: "正义暴打先锋 🔨" },
    { threshold: 15, title: "反借钱先锋程序媛" },
    { threshold: 30, title: "鉴高并发海王架构师" },
    { threshold: 60, title: "零信任反诈高级总监" },
    { threshold: 100, title: "暴打许健·金牌主审官 👑" }
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

  function checkAchievement() {
    if (hitCount >= 5 && !achievementUnlocked) {
      achievementUnlocked = true;
      // 1. 舞台背景动态切换为 NAI5 暴打漫画
      if (whackStage) {
        whackStage.classList.add('has-achievement-bg');
      }
      // 2. 弹出成就弹窗
      if (achievementModal) {
        achievementModal.style.display = 'flex';
      }
      // 3. 胜利音效
      playBeep(523.25, 'sine', 0.12);
      setTimeout(() => playBeep(659.25, 'sine', 0.12), 120);
      setTimeout(() => playBeep(783.99, 'sine', 0.2), 240);
      setTimeout(() => playBeep(1046.50, 'triangle', 0.35), 360);
    }
  }

  // 关闭弹窗
  function closeModal() {
    if (achievementModal) {
      achievementModal.style.display = 'none';
    }
  }
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  function updateWhackTitle() {
    if (!titleEl) return;
    for (let i = titles.length - 1; i >= 0; i--) {
      if (hitCount >= titles[i].threshold) {
        titleEl.textContent = titles[i].title;
        break;
      }
    }
  }

  function spawnFlyingText(x, y) {
    if (!flyingContainer) return;
    const text = hitWords[Math.floor(Math.random() * hitWords.length)];
    const el = document.createElement('div');
    el.className = 'flying-word';
    el.textContent = text;
    el.style.left = (x || (30 + Math.random() * 40)) + '%';
    el.style.top = (y || (30 + Math.random() * 40)) + '%';
    flyingContainer.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  function doHit() {
    hitCount++;
    comboCount++;
    if (hitCountEl) hitCountEl.textContent = hitCount;
    if (comboCountEl) comboCountEl.textContent = comboCount;

    // 检查 5 次暴打成就
    checkAchievement();

    // 充能条
    if (rageFill) {
      const ragePercent = (comboCount * 5) % 100;
      rageFill.style.width = ragePercent + '%';
    }

    // 随机更换受击表情
    if (targetEmoji) {
      targetEmoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    }

    // 动画类
    if (targetCard) {
      targetCard.classList.remove('hit');
      void targetCard.offsetWidth; // 触发重绘
      targetCard.classList.add('hit');
    }

    // 吐槽语
    if (targetStatus) {
      targetStatus.textContent = comboCount > 20 ? "“别打了别打了，我把500块话费退你！”" : "“嗷！你还真打啊？！架构师的事能叫渣吗？！”";
    }

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
      if (comboCountEl) comboCountEl.textContent = '0';
      if (rageFill) rageFill.style.width = '0%';
      if (targetStatus) targetStatus.textContent = "“呼……终于停手了，赶紧去开把排位。”";
      if (targetEmoji) targetEmoji.textContent = '🤡';
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

  // 重置计数
  if (btnResetWhack) {
    btnResetWhack.addEventListener('click', () => {
      if (autoWhackInterval) {
        clearInterval(autoWhackInterval);
        autoWhackInterval = null;
        btnAutoWhack.textContent = '⚡ 开启自动连点器';
        btnAutoWhack.classList.remove('active');
      }
      hitCount = 0;
      comboCount = 0;
      if (hitCountEl) hitCountEl.textContent = '0';
      if (comboCountEl) comboCountEl.textContent = '0';
      if (rageFill) rageFill.style.width = '0%';
      if (titleEl) titleEl.textContent = titles[0].title;
      if (targetStatus) targetStatus.textContent = "“哎呀，你点我干嘛？”";
      if (targetEmoji) targetEmoji.textContent = '🤡';
    });
  }

  // ==========================================
  // ===== 4. 游戏二：离谱借口大转盘 =====
  // ==========================================
  const wheel = document.getElementById('wheel-disc');
  const btnSpin = document.getElementById('btn-spin');
  const excuseResult = document.getElementById('excuse-result');
  const resultText = document.getElementById('result-text');
  const resultComment = document.getElementById('result-comment');

  const excuses = [
    { text: "“借500充话费，这是算你给本架构师的天使轮入股！”", comment: "Code Review 评审意见：垃圾不良资产，非法集资，建议直接报网安！" },
    { text: "“刚才在跑本地单元测试，其实在峡谷五排带妹0-12。”", comment: "Code Review 评审意见：测试覆盖率为0，重大线上故障直接通报批评！" },
    { text: "“送你苹果手机壳给安卓用，叫敏捷MVP极简交付。”", comment: "Code Review 评审意见：需求严重偏离，直接打回重做！" },
    { text: "“同时跟8个妹子聊，叫分布式多线程高并发负载均衡。”", comment: "Code Review 评审意见：严重内存泄漏与线程死锁，建议直接 kill -9！" },
    { text: "“红烧肉盗图水印没擦干净，是英雄所见略同。”", comment: "Code Review 评审意见：第三方侵权依赖，死鸭子嘴硬天花板。" },
    { text: "“发2000字深情挽回长文，第二段把名字打成了婷婷。”", comment: "Code Review 评审意见：变量名未重命名严重事故，未经灰度直接热修复翻车！" },
    { text: "“喝杯25块咖啡，跟我讲前端状态解耦必须各自AA。”", comment: "Code Review 评审意见：直男癌晚期 + 铁公鸡微服务架构。" },
    { text: "“发朋友圈把我 display:none 抹黑，说为了保护我隐私。”", comment: "Code Review 评审意见：CSS 样式坍塌，海王惯犯，建议永久拉黑！" }
  ];

  let currentRotation = 0;
  let isSpinning = false;

  if (btnSpin && wheel) {
    btnSpin.addEventListener('click', () => {
      if (isSpinning) return;
      isSpinning = true;
      btnSpin.disabled = true;
      if (excuseResult) excuseResult.style.display = 'none';

      // 随机选一个索引 (0 ~ 7)
      const targetIndex = Math.floor(Math.random() * excuses.length);
      const sliceDeg = 45;
      const extraRounds = 360 * (5 + Math.floor(Math.random() * 3));
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
        if (resultText) resultText.textContent = excuses[targetIndex].text;
        if (resultComment) resultComment.textContent = excuses[targetIndex].comment;
        if (excuseResult) excuseResult.style.display = 'block';
        playBeep(660, 'square', 0.3);
      }, 3600);
    });
  }

  // ==========================================
  // ===== 5. 游戏三：避雷接物大作战 =====
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
    width: 86,
    height: 30,
    speed: 7.5,
    moveLeft: false,
    moveRight: false
  };

  // 掉落物品类型
  const itemTypes = [
    { text: "🧾 借钱天使轮", type: "bad", score: -10, color: "#ff4757" },
    { text: "📱 安卓壳送苹果", type: "bad", score: -10, color: "#ff4757" },
    { text: "🔗 拼夕夕砍一刀", type: "bad", score: -10, color: "#ff4757" },
    { text: "🥩 外卖条形码肉", type: "bad", score: -10, color: "#ff4757" },
    { text: "💔 忘记改变量名", type: "bad", score: -15, color: "#ff4757" },
    { text: "🤡 8线程多开海王", type: "bad", score: -15, color: "#ff4757" },
    { text: "🚫 git拒合并", type: "good", score: 20, color: "#2ed573" },
    { text: "🛡️ 架构师避雷", type: "good", score: 15, color: "#2ed573" },
    { text: "🔒 触发零信任", type: "good", score: 20, color: "#2ed573" }
  ];

  let fallingItems = [];

  function resetDodgeGame() {
    dodgeScore = 0;
    dodgeTimeLeft = 30;
    if (scoreEl) scoreEl.textContent = '0';
    if (timerEl) timerEl.textContent = '30s';
    fallingItems = [];
    if (canvas) {
      player.x = (canvas.width - player.width) / 2;
    }
  }

  function spawnDodgeItem() {
    if (!isDodgeRunning || !canvas) return;
    const item = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    fallingItems.push({
      x: 20 + Math.random() * (canvas.width - 110),
      y: -20,
      width: 90,
      height: 24,
      speed: 2.2 + Math.random() * 2.6,
      ...item
    });
  }

  function updateDodgeGame() {
    if (!isDodgeRunning || !ctx || !canvas) return;

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
    ctx.fillStyle = "#140d0d";
    ctx.font = "bold 12.5px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🛡️ 架构师避雷盾", player.x + player.width / 2, player.y + 20);

    // 掉落物品逻辑
    if (Math.random() < 0.045) spawnDodgeItem();

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
        if (scoreEl) scoreEl.textContent = dodgeScore;
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
    if (overlay) overlay.classList.add('hidden');

    dodgeTimerInterval = setInterval(() => {
      dodgeTimeLeft--;
      if (timerEl) timerEl.textContent = dodgeTimeLeft + 's';
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
      if (highscoreEl) highscoreEl.textContent = dodgeHighScore;
    }

    let evaluation = "Code Review 结论：被许健的多线程海王炸毁了服务器，急需重构！💸";
    if (dodgeScore >= 120) evaluation = "Code Review 结论：金牌首席安全架构师！许健的渣男代码连编译都过不去！🏆";
    else if (dodgeScore >= 60) evaluation = "Code Review 结论：资深鉴渣专家，成功拦截 8 线程高并发并发漏洞！🛡️";
    else if (dodgeScore > 0) evaluation = "Code Review 结论：险象环生，建议立刻关闭对外端口，开启零信任防御！🔒";

    const title = document.getElementById('overlay-title');
    const desc = document.getElementById('overlay-desc');
    if (title) title.textContent = `🚨 审核结束！最终得分：${dodgeScore}`;
    if (desc) desc.innerHTML = `${evaluation}<br><br>点击下方按钮再次开启 Review！`;
    if (overlay) overlay.classList.remove('hidden');
    if (btnStartDodge) btnStartDodge.textContent = '🔄 再次 Review 避雷';
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

  console.log('%c🚨 许健恶搞游乐场 (全功能修复与优化版) 就绪！', 'color:#ffa502;font-size:16px;font-weight:bold;');
});
