# Spire Lite — Ultra Low Web

Game thẻ bài roguelike HTML5 độc lập, tối ưu cho điện thoại Android và PC. **Không phải bản port Slay the Spire 2 và không chứa tài nguyên của game gốc.**

## Chạy

Mở `index.html` trên trình duyệt hoặc chạy `python -m http.server 8000` trong thư mục và truy cập `http://localhost:8000/`.

## Tạo repo và đăng GitHub Pages

1. Truy cập https://github.com/new, nhập tên `spire-lite-web`, chọn **Public**, không khởi tạo README (vì bộ file đã có README).
2. Mở repository mới > **Add file** > **Upload files**. Tải toàn bộ file/thư mục bên trong ZIP lên thư mục gốc. Đảm bảo `.github/workflows/pages.yml` được giữ nguyên đường dẫn.
3. Chọn **Commit changes** vào nhánh `main`.
4. Mở **Settings** > **Pages** > **Build and deployment** > **Source: GitHub Actions**.
5. Đợi workflow **Deploy static website** chạy thành công. Địa chỉ trang sẽ ở dạng `https://<username>.github.io/spire-lite-web/`.

Nếu upload qua trình duyệt không giữ được thư mục `.github`, có thể tạo `.github/workflows/pages.yml` bằng **Add file > Create new file** và dán nội dung trong bản ZIP; hoặc dùng tùy chọn Pages `Deploy from a branch` (`main` / root) mà không cần workflow.

## Thành phần

- `index.html`: màn hình game.
- `style.css`: giao diện mobile/PC.
- `game.js`: chiến đấu, bộ bài, bản đồ phân nhánh, save.
- `manifest.webmanifest`: metadata cho trình duyệt.
- `.github/workflows/pages.yml`: tự cập nhật website khi push lên `main`.

## Giới hạn

Bản Step 1 hiện có 5 tầng bản đồ, đường nối, combat theo lượt, phần thưởng và lưu qua localStorage. Chưa có relic/shop/event phức tạp. Save nằm trên mỗi trình duyệt, không tự đồng bộ thiết bị.

**Lưu ý:** GitHub Pages public không bảo vệ nội dung riêng tư. Muốn truy cập giới hạn người dùng, dùng hosting có xác thực server-side.

## Ironclad card pool (Step 3)

- Uses verified Ironclad card names and a playable subset of their mechanics: Strike, Defend, Bash, Anger, Armaments, Body Slam, Iron Wave, Pommel Strike, Shrug It Off, Twin Strike, Thunderclap and Inflame.
- Starting deck: 5 Strike, 4 Defend, 1 Bash; starting maximum HP: 80.
- Card reward pool includes only Ironclad cards. Legacy prototype cards are supported only for existing saved runs.
- Campfire: heal 18 or upgrade one card; upgraded cards use the `+` suffix and retain upgrades throughout the run.
- This is an independent fan prototype with original UI, not a port. Exact full-game content and multi-enemy targeting are not yet implemented.
- References: https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Ironclad and https://slaythespire-2.com/cards/character/ironclad

## Step 4 — Merchant, relics, potions

- Burning Blood starter relic: heal 6 HP after combat; Red Skull shop relic: +3 Strength at <=50% HP at combat entry.
- Blood Potion restores 20% of maximum HP; Strength Potion grants 2 Strength in combat. Up to 3 potion slots; use potion buttons only during battle.
- A merchant node may appear on floor 3. Spend Gold on Ironclad cards, relics, potions, or one card removal per shop (75 Gold plus 25 per previous removal).
- Inventory and shop stock persist in the existing localStorage save. The shop inventory and pricing are simplified for a small five-floor prototype, not fully faithful to STS2.
- References: https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Ironclad and https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:The_Merchant

## Step 5 — Overgrowth enemies, elites, bosses and event
- Overgrowth normal enemy name pool: Leaf Slime, Nibbit, Shrinker Beetle, Fuzzy Wurm Crawler.
- Elite pool: Phrog Parasite, Byrdonis, Bygone Effigy.
- Boss pool: Ceremonial Beast, The Kin, Vantom. These are the real named creatures in the wiki, but HP, single-target combat and AI intent patterns are simplified original prototype balancing, **not exact STS2 stats or enemy scripting**.
- Unknown room event Dense Vegetation: Trudge On (+75 Gold/-8 HP) or Rest (+15 HP then a **single** Wriggler fight, an approximation of the game's four-Wriggler encounter).
- Elite rewards grant extra gold and one not-yet-owned relic if available.
- Existing v2 saves load; new event rooms appear on newly generated maps only.
- References: https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Overgrowth and https://slaythespire.wiki.gg/wiki/Slay_the_Spire_2:Dense_Vegetation
