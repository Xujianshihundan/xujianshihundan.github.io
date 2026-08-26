// 许健是混蛋 主页 - 装饰与画廊轮播脚本
document.addEventListener('DOMContentLoaded', () => {

  // ===== 1. 点击大字抖动动画 =====
  const chars = document.querySelectorAll('.declaration .char');
  chars.forEach((c, i) => {
    c.addEventListener('click', () => {
      c.style.animation = 'none';
      requestAnimationFrame(() => {
        c.style.animation = `wobble 0.4s ease-in-out ${i * 0.05}s`;
      });
    });
  });

  // ===== 2. 虚拟恶搞铁证画廊轮播系统 =====
  const galleryData = [
    {
      src: "许健是混蛋.jpg",
      title: "01. 经典原版铁证",
      caption: "📎 实拍铁证 01 · 许健是混蛋 经典原版铁证图"
    },
    {
      src: "虚拟恶搞图1_分布式海王翻车.jpg",
      title: "02. 分布式海王",
      caption: "🚨 虚拟铁证 02 · 8 线程高并发海王聊天翻车实录 (内存泄漏 MAX)"
    },
    {
      src: "虚拟恶搞图2_拼夕夕极简交付MVP.jpg",
      title: "03. 9.9安卓壳MVP",
      caption: "🎁 虚拟铁证 03 · 敏捷极简交付 MVP：给苹果用户送 9.9 安卓壳"
    },
    {
      src: "虚拟恶搞图3_峡谷0-12深情挽回.jpg",
      title: "04. 0-12深情长文",
      caption: "🎮 虚拟铁证 04 · 峡谷 0-12 狂送 & 挽回长文变量名未替换事故"
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
