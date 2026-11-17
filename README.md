# DeutschFlow — German Grammar Academy

Web app tự học tiếng Đức theo hướng **Grammar First**, giải thích bằng tiếng Việt.

## Nội dung MVP
- 7 chuyên đề A1 (mạo từ/giống danh từ, Akkusativ, Präsens, trật tự câu, phủ định, yêu cầu lịch sự, tổng ôn).
- 36 câu luyện tập có chấm điểm và giải thích từng câu.
- 30 flashcards theo chủ đề gọi món, bổ trợ cho Duolingo Section 2 Unit 6.
- Lưu bài đã học, ghi chú, điểm và lỗi sai bằng localStorage.
- Xuất/nhập bản sao lưu JSON.
- Giao diện responsive cho điện thoại và desktop.

## Triển khai GitHub Pages
1. Trong repository mở **Settings → Pages**.
2. Chọn **Build and deployment → Source: Deploy from a branch**.
3. Chọn **Branch: main**, **Folder: /(root)**, bấm **Save**.
4. Khi deployment thành công, mở: https://anhnmdpl.github.io/deutschflow/

## Giới hạn hiện tại
- Chưa tích hợp Supabase: dữ liệu lưu trên **mỗi trình duyệt**; chưa đồng bộ tiến độ tự động giữa các thiết bị.
- Có thể chuyển dữ liệu thủ công bằng chức năng xuất/nhập JSON trong phần Cài đặt.
- Không có API kết nối Duolingo. Từ vựng được biên soạn theo chủ đề, không đảm bảo trùng tuyệt đối với từ trong từng Unit của tài khoản.
- Chưa có lịch gửi email nhắc tự động hay kho giáo trình B1 đầy đủ.
- Khi bổ sung cloud sync, tuyệt đối không đưa secret/service-role key vào frontend công khai; bật RLS và dùng đăng nhập từng người.

## Định hướng phát triển
1. Supabase Auth + PostgreSQL + RLS và xử lý xung đột đồng bộ.
2. Bài luyện điền từ, sắp xếp câu, viết câu tự do.
3. Mở rộng từ A1 lên A2/B1 với lời giải chi tiết bằng tiếng Việt.
4. Ôn tập giãn cách và nhắc học mỗi ngày.

Ứng dụng được viết gọn trong `index.html`; có thể phục vụ trực tiếp từ GitHub Pages mà không cần npm/build.

## Supabase cloud sync (setup required)
Project: `emrbvdnvobosgcqpdwua`

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/emrbvdnvobosgcqpdwua/sql/new), paste and run **[supabase/schema.sql](supabase/schema.sql)**. Review the SQL before running; it creates `public.learning_progress`, enables RLS, revokes anonymous access and grants access only to each user's row.
2. In [Authentication → URL Configuration](https://supabase.com/dashboard/project/emrbvdnvobosgcqpdwua/auth/url-configuration), set **Site URL** to `https://anhnmdpl.github.io/deutschflow/` and add `https://anhnmdpl.github.io/deutschflow/` to Redirect URLs.
3. In [Authentication → Providers](https://supabase.com/dashboard/project/emrbvdnvobosgcqpdwua/auth/providers), ensure **Email** login is enabled.
4. Open the GitHub Pages website, choose **Cài đặt**, enter an email and request a login link. Open the email link, then use **Đồng bộ ngay**.
5. Sign in with the same email on another device and test a new lesson completion or note. Confirm the update appears after **Đồng bộ ngay** or refreshing the page.

### Sync limitations
- **The SQL setup and email authentication have not been executed or verified in your Supabase project.** Do not assume multi-device sync is functioning until steps 1–5 pass.
- While logged out, progress remains local in the browser. While logged in, progress is copied locally and periodically synced to the per-user row.
- If two devices edit the same exact note simultaneously, later sync can overwrite that field. The MVP does not yet implement revision-based conflict resolution.
- Supabase publishable key (in `cloud.js`) is safe to expose **only with correctly configured RLS**. Never store database passwords, secret keys or service role keys in GitHub or the browser.
