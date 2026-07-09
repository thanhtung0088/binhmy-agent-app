# Hướng dẫn triển khai — Trạm Điều Hành Số UBND Xã Bình Mỹ

Đây là ứng dụng **nội bộ, riêng biệt** với Cổng thông tin điện tử công khai
(ban-nhan-dan-ap8_CLAUDE2.html). App này dùng để vận hành 4 nhóm Agent:
Nhân sự, Điều phối công việc, Đánh giá KPI, Phân tích & dự báo.

## Cấu trúc file
```
binhmy-agent-app/
├── index.html          ← toàn bộ giao diện + logic (1 file)
├── api/
│   └── gemini.js        ← serverless function gọi Gemini API
└── README-DEPLOY.md
```

## Bước 1 — Tạo repo GitHub mới
Nên tạo **repo riêng**, ví dụ `thanhtung0088/binhmy-agent-app`, để tách biệt
với repo của Cổng thông tin công khai (vì đây là công cụ nội bộ, không nên
lẫn với trang public).

```bash
cd binhmy-agent-app
git init
git add .
git commit -m "Khởi tạo Trạm Điều Hành Số UBND Xã Bình Mỹ"
git branch -M main
git remote add origin https://github.com/thanhtung0088/binhmy-agent-app.git
git push -u origin main
```

## Bước 2 — Deploy lên Vercel
1. Vào vercel.com → **Add New Project** → chọn repo `binhmy-agent-app` vừa tạo.
2. Vercel tự nhận diện `/api/gemini.js` là serverless function, không cần cấu hình build đặc biệt.
3. Vào **Settings → Environment Variables**, thêm:
   - `GEMINI_API_KEY` = key lấy miễn phí tại https://aistudio.google.com/apikey
4. Deploy.

## Bước 3 — Cấu hình Firestore (để lưu dữ liệu thật thay vì dữ liệu mẫu)
Mở file `index.html`, tìm đoạn:
```js
const firebaseConfig = {
  apiKey: "ĐIỀN_API_KEY",
  authDomain: "ĐIỀN.firebaseapp.com",
  projectId: "ĐIỀN_PROJECT_ID",
  ...
};
```
Điền thông tin project Firebase đã dùng cho Cổng thông tin Bình Mỹ (có thể
dùng chung project, app này lưu dữ liệu riêng trong collection `binhmy_agent`
nên không đụng vào dữ liệu của Cổng thông tin công khai).

Nếu chưa điền, app vẫn chạy bình thường ở **chế độ demo** với dữ liệu mẫu có sẵn
(lưu tạm trong bộ nhớ trình duyệt, mất khi tải lại trang).

## Cách hoạt động của 4 Agent trong app

| Agent | Dữ liệu vào | Hành động |
|---|---|---|
| **Nhân sự** | Bảng chấm công, phép, hồ sơ cán bộ | Phát hiện cán bộ thiếu hồ sơ / nghỉ nhiều → soạn nhắc nhở |
| **Điều phối công việc** | Danh sách việc đã giao, hạn, tiến độ | Tổng hợp việc trễ/sắp trễ → soạn báo cáo tuần theo mẫu công văn |
| **Đánh giá KPI** | Tính từ dữ liệu công việc theo từng người | Tính tỉ lệ hoàn thành, viết nhận xét thi đua |
| **Phân tích & dự báo** | Số liệu dân số/hồ sơ nhập theo từng kỳ | Phân tích xu hướng, đưa khuyến nghị cho lãnh đạo xã |

Mỗi lần bấm **"▶ Chạy Agent"**, app sẽ gửi dữ liệu hiện có kèm hướng dẫn
(prompt) tới `/api/gemini`, nhận về văn bản do AI soạn, hiển thị ngay trong
bảng điều khiển agent tương ứng.

## Lưu ý bảo mật
- Không đưa dữ liệu Mật/nhạy cảm vào Ghi chú hoặc bất kỳ ô nhập liệu nào, vì
  nội dung sẽ được gửi qua Gemini API để xử lý.
- App này không có màn hình đăng nhập vì mặc định dùng nội bộ (không public
  URL cho dân). Nếu deploy công khai, nên thêm lớp xác thực trước khi dùng
  dữ liệu cán bộ thật.
