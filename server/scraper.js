const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
  );

  const results = [];

  for (let i = 1; i <= 5; i++) {
    const url = `https://kaspi.kz/shop/c/smartphones%20and%20gadgets/?page=${i}`;
    console.log(`[INFO] Загружаем: ${url}`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForSelector('.item-card__image-wrapper', { timeout: 15000 });
      await new Promise(resolve => setTimeout(resolve, 6000));// просто подождать, чтобы всё догрузилось

      const products = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.item-card'));
        return items.map(card => {
          const linkElement = card.querySelector('a.item-card__image-wrapper');
          const priceElement = card.querySelector('span.item-card__prices-price');
          const titleElement = card.querySelector('a.item-card__name-link');
          const imageElement = card.querySelector('img.item-card__image');
          const ratingSpan = card.querySelector('span.rating');
          const descElement = card.querySelector('div.item-card__rating');

          const link = linkElement ? 'https://kaspi.kz' + linkElement.getAttribute('href') : '';
          const price = priceElement ? priceElement.innerText.trim().replace(/\s/g, '') : '';
          const title = titleElement ? titleElement.innerText.trim() : '';

          let image = '';
          if (imageElement) {
            image = imageElement.getAttribute('src') || imageElement.getAttribute('data-src') || '';
          }

          const description = descElement ? descElement.innerText.trim() : '';

          let rating = null;
          if (ratingSpan) {
            const ratingClass = [...ratingSpan.classList].find(c => /^_\d{2}$/.test(c));
            if (ratingClass) {
              rating = parseInt(ratingClass.replace('_', '')) / 10;
            }
          }

          let productId = null;
          const match = link.match(/-(\d+)(?:\/|\?)/);
          if (match) {
             productId = match[1];
          }


          return {
            productId,
            title,
            price,
            link,
            image,
            rating,
            description
          };
        });
      });

      console.log(`[INFO] Найдено карточек: ${products.length}`);
      results.push(...products);

    } catch (error) {
      console.error(`[ERROR] Ошибка на странице ${url}:`, error.message);
    }
  }

  // Сохраняем результат
  try {
    const savePath = path.join(__dirname, '../data/kaspi_products.json');
    fs.writeFileSync(savePath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`[✅] Сохранено в: ${savePath}`);
  } catch (err) {
    console.error(`[❌] Ошибка при сохранении файла:`, err.message);
  }

  await browser.close();
})();
