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
