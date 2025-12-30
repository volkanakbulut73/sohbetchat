
<div align="center">
  <h1 align="center">Workigom Chat</h1>
  <p align="center">Güvenli, Modern ve Nostaljik Sohbet Platformu</p>
</div>

## Proje Hakkında

Bu proje, **mIRC** kültürünü modern web teknolojileriyle birleştiren, yapay zeka destekli ve güvenli bir sohbet uygulamasıdır.

🔗 **Repository:** [https://github.com/volkanakbulut73/sohbetchat](https://github.com/volkanakbulut73/sohbetchat)

## Manuel GitHub Deployment (Terminal)

Platform üzerindeki "GitHub" butonu çalışmadığında terminalinizden şu komutları sırasıyla çalıştırın:

1. **Uzak Depoyu Yapılandır (Sadece ilk sefer):**
   ```bash
   git remote remove origin
   git remote add origin https://github.com/volkanakbulut73/sohbetchat.git
   ```

2. **Dosyaları Hazırla ve Commit Et:**
   ```bash
   git add .
   git commit -m "Deployment update"
   ```

3. **GitHub'a Gönder:**
   ```bash
   git push -u origin main
   ```

4. **Kısa Yol (package.json):**
   Uzak depo ayarlandıktan sonra sadece şunu yazmanız yeterlidir:
   ```bash
   npm run push
   ```

## Yayına Alma (Vercel)

GitHub'a push yaptıktan sonra Vercel (veya Netlify) üzerinden projenizi import edin. Vercel her push yaptığınızda siteyi otomatik güncelleyecektir.

---
Workigom Network System © 2024
