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
