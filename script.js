// 许健是混蛋 主页 - 装饰脚本
document.addEventListener('DOMContentLoaded', () => {
  // 点击大字时整字抖一下
  const chars = document.querySelectorAll('.declaration .char');
  chars.forEach((c, i) => {
    c.addEventListener('click', () => {
      c.style.animation = 'none';
      requestAnimationFrame(() => {
        c.style.animation = `wobble 0.4s ease-in-out ${i * 0.05}s`;
      });
    });
  });

  // 图片点击放大切换
  const img = document.querySelector('.photo-frame img');
  const frame = document.querySelector('.photo-frame');
  if (img && frame) {
    frame.addEventListener('click', () => {
      img.style.maxHeight = img.style.maxHeight === 'none' ? '80vh' : 'none';
    });
  }

  console.log('%c😤 许健是混蛋', 'font-size:32px;font-weight:900;color:#ff4757;text-shadow:0 0 10px #ffa502;');
  console.log('%c本站纯属朋友间恶搞娱乐，请勿对号入座。', 'color:#ffa502;font-size:13px;');
});
