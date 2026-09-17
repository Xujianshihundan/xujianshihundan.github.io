// 许健是混蛋 主页 - 装饰与画廊轮播脚本
document.addEventListener('DOMContentLoaded', () => {

  // ===== 1. 点击大字抖动动画与绝密彩蛋 (连续点击5次触发语音心路与视频) =====
  const declaration = document.querySelector('.declaration');
  const chars = document.querySelectorAll('.declaration .char');
  const eggModal = document.getElementById('egg-modal');
  const eggBackdrop = document.getElementById('egg-backdrop');
  const eggCloseBtn = document.getElementById('egg-close-btn');
  const eggVideo = document.getElementById('egg-video');
  const eggToast = document.getElementById('egg-toast');

  // 许健心路历程 4 阶段语音
  const eggAudios = [
    new Audio('audio/click_1.mp3'),
    new Audio('audio/click_2.mp3'),
    new Audio('audio/click_3.mp3'),
    new Audio('audio/click_4.mp3')
  ];
  let currentEggAudio = null;

  function stopEggAudio() {
    if (currentEggAudio) {
      currentEggAudio.pause();
      currentEggAudio.currentTime = 0;
      currentEggAudio = null;
    }
  }

  function playEggStepAudio(stepIndex) {
    stopEggAudio();
    if (eggAudios[stepIndex]) {
      const audio = eggAudios[stepIndex];
      audio.currentTime = 0;
      currentEggAudio = audio;
      audio.play().catch(err => {
        console.log('点击语音播放受阻:', err);
      });
    }
  }

  let eggClickCount = 0;
  let eggResetTimer = null;
  let toastTimer = null;

  function showEggToast(text) {
    if (!eggToast) return;
    eggToast.textContent = text;
    eggToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      eggToast.classList.remove('show');
    }, 2400);
  }

  function openEggModal() {
    stopEggAudio();
    if (!eggModal || !eggVideo) return;
    eggModal.classList.add('active');
    eggModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // 播放视频
    eggVideo.currentTime = 0;
    const playPromise = eggVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.log('自动播放需要用户交互:', err);
      });
    }
  }

  function closeEggModal() {
    if (!eggModal || !eggVideo) return;
    eggModal.classList.remove('active');
    eggModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    eggVideo.pause();
    eggVideo.currentTime = 0;
    stopEggAudio();
  }

  // 大字单字抖动动效
  chars.forEach((c, i) => {
    c.addEventListener('click', () => {
      c.style.animation = 'none';
      requestAnimationFrame(() => {
        c.style.animation = `wobble 0.4s ease-in-out ${i * 0.05}s`;
      });
    });
  });

  // 大字整体点击彩蛋计数与阶梯语音
  if (declaration) {
    declaration.addEventListener('click', () => {
      eggClickCount++;
      clearTimeout(eggResetTimer);

      // 12 秒未继续点击则重置计数并停止语音
      eggResetTimer = setTimeout(() => {
        eggClickCount = 0;
        stopEggAudio();
      }, 12000);

      if (eggClickCount === 1) {
        playEggStepAudio(0);
        showEggToast('🎙️ 许健急了：“我对天发誓我真不是混蛋！(1/5)”');
      } else if (eggClickCount === 2) {
        playEggStepAudio(1);
        showEggToast('🎙️ 许健动摇：“我真没她们说的那么坏啊！(2/5)”');
      } else if (eggClickCount === 3) {
        playEggStepAudio(2);
        showEggToast('🎙️ 许健心虚认错：“我确实有大问题行了吧！(3/5)”');
      } else if (eggClickCount === 4) {
        playEggStepAudio(3);
        showEggToast('🔥 许健气急败坏：“既然这样，有本事再点一下试试？！(4/5)”');
      } else if (eggClickCount >= 5) {
        eggClickCount = 0;
        clearTimeout(eggResetTimer);
        showEggToast('🎉 绝密铁证视频已解锁！');
        openEggModal();
      }
    });
  }

  // 模态框关闭交互
  if (eggCloseBtn) {
    eggCloseBtn.addEventListener('click', closeEggModal);
  }
  if (eggBackdrop) {
    eggBackdrop.addEventListener('click', closeEggModal);
  }

  // 键盘 ESC 键关闭视频模态框
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && eggModal && eggModal.classList.contains('active')) {
      closeEggModal();
    }
  });

  // ===== 2. 虚拟恶搞铁证画廊轮播系统 =====
  const galleryData = [
    {
      src: "虚拟恶搞图1_分布式海王翻车.jpg",
      title: "分布式海王",
      caption: "🚨 虚拟铁证 · 分布式海王聊天翻车实录"
    },
    {
      src: "虚拟恶搞图2_拼夕夕极简交付MVP.jpg",
      title: "9.9安卓壳MVP",
      caption: "🎁 虚拟铁证 · 极简拼夕夕礼物：给苹果用户送 9.9 安卓壳"
    },
    {
      src: "虚拟恶搞图3_峡谷0-12深情挽回.jpg",
      title: "0-12深情长文",
      caption: "🎮 虚拟铁证 · 峡谷 0-12 狂送 & 挽回长文叫错名字翻车"
    }
  ];

  let currentIndex = 0;
  let autoPlayTimer = null;

  const galleryImg = document.getElementById('gallery-img');
  const galleryCaption = document.getElementById('gallery-caption');
  const photoFrame = document.getElementById('photo-frame');
  const btnPrev = document.getElementById('gallery-prev');
  const btnNext = document.getElementById('gallery-next');
  const dots = document.querySelectorAll('.gallery-dots .dot');
  const thumbs = document.querySelectorAll('.thumb-list .thumb-item');

  function showSlide(index) {
    if (index < 0) index = galleryData.length - 1;
    if (index >= galleryData.length) index = 0;
    currentIndex = index;

    // 淡入淡出切换图片
    galleryImg.style.opacity = '0';
    setTimeout(() => {
      galleryImg.src = galleryData[currentIndex].src;
      galleryImg.alt = galleryData[currentIndex].title;
      galleryCaption.textContent = galleryData[currentIndex].caption;
      galleryImg.style.opacity = '1';
    }, 150);

    // 更新指示圆点
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === currentIndex);
    });

    // 更新缩略图高亮
    thumbs.forEach((t, i) => {
      t.classList.toggle('active', i === currentIndex);
    });
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  // 左右箭头切换
  if (btnNext) btnNext.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });
  if (btnPrev) btnPrev.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });

  // 圆点点击切换
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      showSlide(parseInt(dot.dataset.index, 10));
      resetAutoPlay();
    });
  });

  // 缩略图点击切换
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      showSlide(parseInt(thumb.dataset.index, 10));
      resetAutoPlay();
    });
  });

  // 自动轮播（每 5 秒一次）
  function startAutoPlay() {
    autoPlayTimer = setInterval(nextSlide, 5000);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  // 鼠标悬停在大图区域时暂停轮播
  if (photoFrame) {
    photoFrame.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    photoFrame.addEventListener('mouseleave', () => startAutoPlay());
    
    // 点击图片放大查看
    photoFrame.addEventListener('click', () => {
      if (galleryImg.style.maxHeight === 'none') {
        galleryImg.style.maxHeight = '68vh';
        photoFrame.style.maxWidth = '580px';
      } else {
        galleryImg.style.maxHeight = 'none';
        photoFrame.style.maxWidth = '90vw';
      }
    });
  }

  // 键盘左右方向键切换画廊
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { prevSlide(); resetAutoPlay(); }
    if (e.key === 'ArrowRight') { nextSlide(); resetAutoPlay(); }
  });

  startAutoPlay();

  console.log('%c😤 许健是混蛋 · 虚拟恶搞铁证画廊就绪', 'font-size:26px;font-weight:900;color:#ff4757;text-shadow:0 0 10px #ffa502;');
  console.log('%c本站所有图片与文案纯属朋友间恶搞娱乐，请勿对号入座。', 'color:#ffa502;font-size:13px;');
});
