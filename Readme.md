# QLDA Script tool
Đây là dự án cá nhân để chạy các tasks được giao trên trang quản lý dự án.
# Chức năng chính
Hiện tại gồm các chức năng:

<ol>
    <li>Đăng nhập để lấy token (login)</li>
    <li>Lấy danh sách các dự án đang tham gia (board)</li>
    <li>Hiển thị danh sách các tasks đang có (list)</li>
    <li>Hiển thị chi tiết task (detail)</li>
    <li>Bắt đầu chạy task (update)</li>
    <li>Viết báo cáo (report)</li>
    <li>Đánh dấu hoàn thành task (mark)</li>
    <li>Kéo task vào vị trí task đã kết thúc (endStep)</li>
    <li>Chạy tự động task gồm bắt đầu task, viết báo cáo, đánh dấu hoàn thành và kéo task vào vị trị kêt thúc(auto)</li>
</ol>

# Chạy phần mềm
Vì đây là phần mềm được viết trên môi trường dev, và sử dụng ngôn ngữ Javascript nên sẽ yêu cầu cài đặt [NodeJs] (https://nodejs.org/en/download).
Sau khi cài đặt bạn hãy install các gói tin trong souce trên terminal
```bash
npm install
```
Nếu có lỗi liên quan tới version cũ thì hãy thêm tag <code>--legacy-peer-deps</code>
```bash
npm install --legacy-peer-deps
```
Sau khi cài đặt xong hãy tạo 3 file
<ul>
    <li>.env (để ghi và sử dụng tham số)</li>
    <li>log.txt (để ghi lại log nếu có lỗi - <b>có thể để trống<b>)</li>
    <li>account.json (để ghi lại cache thông tin tài khoản - <b>có thể để trống<b>)</li>
</ul>

Với file <code>.env</code> sẽ gồm 4 loại tham số bắt buộc như sau
<ul>
    <li>BASE_URL</li>
    <li>IGNORE_ACTIONS_NAME</li>
    <li>USERNAME</li>
    <li>PASSWORD</li>
</ul>

<b>-BASE URL</b>: là đường dẫn để lấy api trên trang quản trị data
<b>-IGNORE_ACTIONS_NAME</b>: là các hành động trong task không cần liệt kê để tránh lấy các dữ liệu không cần thiết. Thường sẽ được ghi như sau:

```javascript
IGNORE_ACTIONS_NAME=["Đóng", "DONE", "Đã hoàn thành", "Đã đóng", "Đã xong", "Hoàn thành", "Đã xử lý", "Xong", "Completed"]
```

<b>-USERNAME</b>: là tài khoản đăng nhập trên trang quản trị data
<b>-PASSWORD</b>: là mật khẩu đăng nhập trên trang quản trị data

Sau khi đã bổ xung 3 files được đề cập trên thì bạn đã có thể chạy phần mềm rồi đó!.
Hãy vào terminal và gõ npm start để có thể sử dụng phần mềm
```bash
npm start
```
