# Danh sách trang chức năng theo nghiệp vụ

## Mục tiêu tài liệu

Tài liệu này trả lời 4 câu hỏi chính:
- Dự án cần có **những phân hệ nghiệp vụ nào**?
- Trong mỗi phân hệ, cần có **những trang nào**?
- Mỗi trang cần có **chức năng gì**?
- Trang nào đã có **UI**, trang nào đã có **API**, trang nào còn thiếu?

## Nguồn đối chiếu
- Yêu cầu đề tài **Quản lý đào tạo & điểm danh sinh viên**
- Frontend hiện có trong `frontend/src`
- Backend hiện có trong `backend/src/routes`

## Quy ước trạng thái
- **UI: Hoàn chỉnh**: đã có màn hình và xử lý chính
- **UI: Một phần**: đã có màn hình nhưng còn thiếu thao tác, thiếu dữ liệu thật, hoặc còn placeholder
- **UI: Chưa có**: chưa thấy màn hình phù hợp
- **API: Đầy đủ cơ bản**: đã có API cho luồng chính hoặc CRUD chính
- **API: Một phần**: đã có một phần endpoint nhưng chưa đủ toàn bộ nghiệp vụ
- **API: Chưa có**: chưa thấy module backend tương ứng

---

# 1) Phân hệ dùng chung

## 1.1. Trang đăng nhập hệ thống
- **Vai trò sử dụng**: Admin, Giảng viên, Cố vấn, Sinh viên
- **Mục đích**: xác thực tài khoản và vào hệ thống theo đúng vai trò
- **Chức năng cần có**:
  - Nhập tài khoản hoặc email
  - Nhập mật khẩu
  - Ghi nhớ đăng nhập
  - Hiển thị lỗi đăng nhập
  - Chuyển hướng theo trạng thái phiên đăng nhập
- **UI hiện tại**: **Hoàn chỉnh**
- **API hiện tại**: **Đầy đủ cơ bản**
- **Đối chiếu hiện trạng**:
  - UI: `frontend/src/pages/auth/LoginPage.tsx`
  - API: `backend/src/routes/auth.routes.ts`

## 1.2. Trang tổng quan sau đăng nhập
- **Vai trò sử dụng**: tất cả vai trò, nhưng nội dung cần khác nhau theo vai trò
- **Mục đích**: cung cấp điểm vào hệ thống và các chỉ số/tác vụ quan trọng
- **Chức năng cần có**:
  - Hiển thị thông tin người dùng đăng nhập
  - Hiển thị menu theo quyền
  - Hiển thị số liệu nghiệp vụ quan trọng
  - Hiển thị nhắc việc, cảnh báo, thông báo mới
  - Điều hướng nhanh đến các phân hệ chính
- **UI hiện tại**: **Một phần**
- **API hiện tại**: **Chưa có riêng cho dashboard**
- **Đối chiếu hiện trạng**:
  - UI shell: `frontend/src/pages/dashboard/DashboardPage.tsx`
  - Top bar: `frontend/src/pages/dashboard/DashboardTopBar.tsx`
- **Ghi chú**:
  - Đã có khung dashboard và menu
  - Nhiều số liệu vẫn là dữ liệu tĩnh, chưa có API dashboard thật

---

# 2) Phân hệ danh mục đào tạo

## 2.1. Trang quản lý môn học
- **Vai trò sử dụng**: Admin
- **Mục đích**: quản lý danh mục môn học dùng cho mở lớp, đăng ký, chấm điểm
- **Chức năng cần có**:
  - Xem danh sách môn học
  - Tìm kiếm theo mã môn, tên môn, bộ môn
  - Tạo môn học mới
  - Cập nhật thông tin môn học
  - Xem chi tiết môn học
  - Xoá hoặc ngừng sử dụng môn học
  - Quản lý số tín chỉ, bộ môn phụ trách, mô tả môn học
- **UI hiện tại**: **Một phần**
- **API hiện tại**: **Đầy đủ cơ bản**
- **Đối chiếu hiện trạng**:
  - UI: `frontend/src/pages/subjects/SubjectManagementSection.tsx`
  - API frontend gọi: `frontend/src/app/subjects/subject-api.ts`
  - Backend: `backend/src/routes/subject.routes.ts`
- **Ghi chú**:
  - Đã có danh sách, tìm kiếm, tạo, xoá
  - Chưa thấy UI sửa môn học và trang chi tiết riêng

## 2.2. Trang quản lý khoa / bộ môn
- **Vai trò sử dụng**: Admin
- **Mục đích**: quản lý đơn vị chuyên môn phụ trách môn học
- **Chức năng cần có**:
  - Xem danh sách khoa/bộ môn
  - Tạo mới khoa/bộ môn
  - Cập nhật tên, mã đơn vị
  - Khoá/ngừng hoạt động đơn vị
  - Gán môn học cho đơn vị phụ trách
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Một phần**
- **Đối chiếu hiện trạng**:
  - Hiện chỉ thấy API lấy dữ liệu bộ môn trong `backend/src/routes/academic.routes.ts`
- **Ghi chú**:
  - Có dữ liệu tham chiếu nhưng chưa có module quản trị hoàn chỉnh

## 2.3. Trang quản lý năm học / niên khoá / học kỳ
- **Vai trò sử dụng**: Admin
- **Mục đích**: quản lý mốc thời gian học vụ toàn hệ thống
- **Chức năng cần có**:
  - Danh sách năm học
  - Danh sách niên khoá
  - Danh sách học kỳ
  - Tạo/cập nhật thông tin năm học, niên khoá
  - Xác định học kỳ hiện tại
  - Dùng làm dữ liệu đầu vào cho mở lớp, đăng ký, lịch học, bảng điểm
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Một phần**
- **Đối chiếu hiện trạng**:
  - Backend tham chiếu: `backend/src/routes/academic.routes.ts`
- **Ghi chú**:
  - Có API lấy dữ liệu học vụ, chưa thấy CRUD quản trị đầy đủ

## 2.4. Trang quản lý lớp hành chính
- **Vai trò sử dụng**: Admin
- **Mục đích**: quản lý lớp sinh hoạt, khoá học, sĩ số và cố vấn học tập
- **Chức năng cần có**:
  - Xem danh sách lớp hành chính
  - Tạo/cập nhật lớp hành chính
  - Gán cố vấn học tập
  - Xem danh sách sinh viên thuộc lớp
  - Theo dõi sĩ số hiện tại
  - Lọc theo khoá, ngành, niên khoá
- **UI hiện tại**: **Chưa có / mới ở mức menu placeholder**
- **API hiện tại**: **Một phần**
- **Đối chiếu hiện trạng**:
  - Sidebar có menu trong `frontend/src/pages/dashboard/DashboardPage.tsx`
  - Backend: `backend/src/routes/administrative-class.routes.ts`
- **Ghi chú**:
  - Chưa thấy màn hình frontend nghiệp vụ thật

---

# 3) Phân hệ tổ chức giảng dạy

## 3.1. Trang quản lý lớp học phần
- **Vai trò sử dụng**: Admin
- **Mục đích**: mở lớp học phần cho từng học kỳ và tổ chức giảng dạy
- **Chức năng cần có**:
  - Xem danh sách lớp học phần
  - Tạo lớp học phần mới
  - Cập nhật lớp học phần
  - Xem chi tiết lớp học phần
  - Gán môn học, giảng viên, học kỳ, năm học
  - Quản lý sĩ số tối đa và sĩ số hiện tại
  - Theo dõi trạng thái mở lớp
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Đầy đủ cơ bản**
- **Đối chiếu hiện trạng**:
  - Backend: `backend/src/routes/course-offering.routes.ts`
- **Ghi chú**:
  - Backend đã có list/detail/create/update
  - Chưa thấy UI quản lý lớp học phần

## 3.2. Trang chi tiết lớp học phần
- **Vai trò sử dụng**: Admin, Giảng viên, Cố vấn
- **Mục đích**: xem toàn bộ thông tin của một lớp học phần cụ thể
- **Chức năng cần có**:
  - Xem thông tin lớp, môn, giảng viên, học kỳ
  - Xem danh sách sinh viên đăng ký
  - Xem lịch học, lịch thi
  - Đi đến trang điểm danh, điểm số, chuyên cần
  - Xem trạng thái đóng/mở đăng ký
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Một phần**
- **Đối chiếu hiện trạng**:
  - Backend đã có endpoint detail trong `backend/src/routes/course-offering.routes.ts`
- **Ghi chú**:
  - Chưa có màn hình detail ở frontend

## 3.3. Trang quản lý lịch học
- **Vai trò sử dụng**: Admin, Giảng viên
- **Mục đích**: tổ chức các buổi học cho lớp học phần
- **Chức năng cần có**:
  - Tạo lịch học theo lớp học phần
  - Cập nhật phòng học, thời gian, tuần học
  - Xem danh sách buổi học
  - Xử lý dời lịch, huỷ buổi, học bù
  - Hiển thị lịch theo ngày/tuần/tháng
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**
- **Ghi chú**:
  - Đây là phần bắt buộc theo đề tài nhưng chưa thấy module riêng

## 3.4. Trang quản lý lịch thi
- **Vai trò sử dụng**: Admin, Sinh viên, Giảng viên
- **Mục đích**: công bố và theo dõi lịch thi
- **Chức năng cần có**:
  - Tạo lịch thi theo môn/lớp học phần
  - Cập nhật thời gian, phòng thi, hình thức thi
  - Xem lịch thi theo học kỳ
  - Lọc theo lớp học phần hoặc sinh viên
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

---

# 4) Phân hệ đăng ký học phần

## 4.1. Trang quản lý đợt đăng ký học phần
- **Vai trò sử dụng**: Admin
- **Mục đích**: cấu hình thời gian và phạm vi đăng ký học phần
- **Chức năng cần có**:
  - Xem danh sách đợt đăng ký
  - Tạo đợt đăng ký mới
  - Cập nhật thông tin đợt đăng ký
  - Mở/đóng đợt đăng ký
  - Gắn lớp học phần vào đợt đăng ký
  - Xem danh sách lớp học phần đã mở đăng ký
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Đầy đủ cơ bản**
- **Đối chiếu hiện trạng**:
  - Backend: `backend/src/routes/registration-period.routes.ts`

## 4.2. Trang theo dõi đăng ký học phần của quản trị viên
- **Vai trò sử dụng**: Admin
- **Mục đích**: theo dõi tiến độ đăng ký và xử lý bất thường
- **Chức năng cần có**:
  - Xem số lượng sinh viên đăng ký theo lớp học phần
  - Xem danh sách sinh viên đã đăng ký
  - Lọc lớp học phần đông/chưa đủ sĩ số
  - Hỗ trợ rà soát đăng ký sai hoặc trùng
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Một phần**
- **Ghi chú**:
  - Hiện API chủ yếu phục vụ luồng sinh viên tự đăng ký

## 4.3. Trang đăng ký học phần cho sinh viên
- **Vai trò sử dụng**: Sinh viên
- **Mục đích**: cho sinh viên chọn lớp học phần trong thời gian đăng ký
- **Chức năng cần có**:
  - Xem danh sách học phần đang mở
  - Xem chi tiết lớp học phần có thể đăng ký
  - Chọn học phần
  - Huỷ đăng ký trong thời gian cho phép
  - Xem tổng tín chỉ đã đăng ký
  - Xem trạng thái đăng ký thành công/thất bại
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Đầy đủ cơ bản cho luồng chính**
- **Đối chiếu hiện trạng**:
  - Backend: `backend/src/routes/enrollment.routes.ts`
- **Ghi chú**:
  - Chưa có frontend cho sinh viên thao tác đăng ký

## 4.4. Trang kết quả đăng ký học phần của sinh viên
- **Vai trò sử dụng**: Sinh viên
- **Mục đích**: xem lại các học phần đã đăng ký
- **Chức năng cần có**:
  - Danh sách lớp học phần đã đăng ký
  - Thông tin tín chỉ, lịch học, trạng thái
  - Huỷ đăng ký nếu còn trong hạn
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Đầy đủ cơ bản**
- **Ghi chú**:
  - Có thể dùng chung API enrollments, nhưng chưa có UI riêng

---

# 5) Phân hệ điểm danh và chuyên cần

## 5.1. Trang điểm danh theo buổi học
- **Vai trò sử dụng**: Giảng viên
- **Mục đích**: ghi nhận tình trạng tham gia học của sinh viên theo từng buổi
- **Chức năng cần có**:
  - Chọn lớp học phần và buổi học
  - Danh sách sinh viên theo lớp
  - Đánh dấu có mặt / vắng / đi trễ / có phép
  - Lưu kết quả điểm danh
  - Cập nhật lại nếu cần trong phạm vi cho phép
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

## 5.2. Trang tổng hợp chuyên cần lớp học phần
- **Vai trò sử dụng**: Giảng viên, Admin, Cố vấn
- **Mục đích**: theo dõi chuyên cần theo lớp hoặc theo sinh viên
- **Chức năng cần có**:
  - Tổng số buổi học
  - Số buổi vắng, trễ, có phép
  - Tỷ lệ chuyên cần
  - Danh sách sinh viên có nguy cơ vượt ngưỡng vắng
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

## 5.3. Trang chuyên cần cá nhân của sinh viên
- **Vai trò sử dụng**: Sinh viên
- **Mục đích**: để sinh viên tự theo dõi tình trạng chuyên cần
- **Chức năng cần có**:
  - Xem chuyên cần theo từng môn
  - Xem số buổi vắng, trễ
  - Xem cảnh báo vượt ngưỡng
  - Xem chi tiết theo từng buổi học
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

## 5.4. Trang cảnh báo chuyên cần
- **Vai trò sử dụng**: Admin, Cố vấn, Sinh viên
- **Mục đích**: phát hiện sớm sinh viên có nguy cơ cấm thi hoặc học lại vì chuyên cần
- **Chức năng cần có**:
  - Danh sách sinh viên vượt ngưỡng vắng
  - Lọc theo lớp, môn, học kỳ
  - Xem mức độ vi phạm
  - Gửi thông báo nhắc nhở
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

---

# 6) Phân hệ điểm số và kết quả học tập

## 6.1. Trang cấu hình đầu điểm và công thức tính điểm
- **Vai trò sử dụng**: Admin
- **Mục đích**: định nghĩa cách tính điểm cho môn học hoặc nhóm môn
- **Chức năng cần có**:
  - Cấu hình các cột điểm thành phần
  - Cấu hình trọng số
  - Cấu hình công thức tính điểm cuối kỳ
  - Áp dụng cấu hình cho lớp học phần hoặc môn học
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

## 6.2. Trang nhập điểm thành phần
- **Vai trò sử dụng**: Giảng viên
- **Mục đích**: nhập điểm cho sinh viên theo từng cột điểm
- **Chức năng cần có**:
  - Chọn lớp học phần
  - Nhập điểm quá trình, giữa kỳ, cuối kỳ
  - Lưu tạm hoặc chốt điểm
  - Kiểm tra dữ liệu không hợp lệ
  - Cập nhật điểm trong phạm vi được phép
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

## 6.3. Trang bảng điểm lớp học phần
- **Vai trò sử dụng**: Giảng viên, Admin
- **Mục đích**: xem toàn bộ điểm của lớp học phần
- **Chức năng cần có**:
  - Danh sách sinh viên và các cột điểm
  - Tính điểm tổng kết
  - Xem trạng thái đỗ/rớt
  - Chốt bảng điểm
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

## 6.4. Trang bảng điểm cá nhân của sinh viên
- **Vai trò sử dụng**: Sinh viên
- **Mục đích**: xem kết quả học tập cá nhân
- **Chức năng cần có**:
  - Xem điểm thành phần
  - Xem điểm cuối kỳ
  - Xem kết quả theo học kỳ
  - Lọc theo học kỳ/năm học
  - Xem môn học đạt/chưa đạt
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

## 6.5. Trang cảnh báo học lại / kết quả yếu
- **Vai trò sử dụng**: Admin, Cố vấn, Sinh viên
- **Mục đích**: theo dõi sinh viên có nguy cơ học lại hoặc học lực yếu
- **Chức năng cần có**:
  - Danh sách môn không đạt
  - Danh sách sinh viên cần học lại
  - Phân loại theo học kỳ/lớp/ngành
  - Điều hướng sang bảng điểm hoặc cảnh báo
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

## 6.6. Trang audit sửa điểm
- **Vai trò sử dụng**: Admin
- **Mục đích**: kiểm soát thay đổi điểm theo yêu cầu NFR
- **Chức năng cần có**:
  - Xem lịch sử sửa điểm
  - Biết ai sửa, lúc nào, sửa trường nào
  - So sánh giá trị cũ và mới
  - Lọc theo sinh viên, lớp học phần, người sửa
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có theo nghiệp vụ điểm**
- **Ghi chú**:
  - Hệ thống hiện chỉ mới thấy audit cho auth

---

# 7) Phân hệ phúc khảo

## 7.1. Trang tạo đơn phúc khảo
- **Vai trò sử dụng**: Sinh viên
- **Mục đích**: gửi yêu cầu xem xét lại điểm
- **Chức năng cần có**:
  - Chọn môn/lớp học phần cần phúc khảo
  - Nhập lý do phúc khảo
  - Gửi đơn
  - Kiểm tra điều kiện được phép gửi đơn
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

## 7.2. Trang theo dõi đơn phúc khảo của sinh viên
- **Vai trò sử dụng**: Sinh viên
- **Mục đích**: xem tình trạng xử lý đơn
- **Chức năng cần có**:
  - Danh sách đơn đã gửi
  - Trạng thái chờ duyệt / đang xử lý / đã có kết quả / từ chối
  - Xem phản hồi xử lý
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

## 7.3. Trang xử lý phúc khảo
- **Vai trò sử dụng**: Admin, Giảng viên được phân quyền
- **Mục đích**: duyệt và xử lý đơn phúc khảo
- **Chức năng cần có**:
  - Danh sách đơn phúc khảo
  - Xem chi tiết đơn
  - Duyệt / từ chối / cập nhật kết quả
  - Ghi nhận kết luận xử lý
  - Nếu thay đổi điểm thì ghi audit
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

---

# 8) Phân hệ thông báo

## 8.1. Trang quản lý thông báo
- **Vai trò sử dụng**: Admin
- **Mục đích**: gửi thông báo học vụ cho đúng đối tượng
- **Chức năng cần có**:
  - Tạo thông báo
  - Chọn đối tượng nhận: toàn trường, theo lớp, theo vai trò, theo sinh viên
  - Lên lịch hoặc gửi ngay
  - Xem lịch sử gửi
  - Theo dõi trạng thái gửi
- **UI hiện tại**: **Chưa có / mới ở mức menu placeholder**
- **API hiện tại**: **Chưa có**

## 8.2. Trang danh sách thông báo của sinh viên
- **Vai trò sử dụng**: Sinh viên
- **Mục đích**: nhận thông tin học vụ và cảnh báo liên quan
- **Chức năng cần có**:
  - Danh sách thông báo
  - Xem chi tiết thông báo
  - Đánh dấu đã đọc
  - Lọc thông báo mới / cũ / quan trọng
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

---

# 9) Phân hệ báo cáo

## 9.1. Trang báo cáo phân phối điểm
- **Vai trò sử dụng**: Admin
- **Mục đích**: theo dõi chất lượng kết quả học tập theo môn/lớp
- **Chức năng cần có**:
  - Biểu đồ phân phối điểm
  - Lọc theo môn, lớp học phần, học kỳ
  - Xuất báo cáo
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

## 9.2. Trang báo cáo tỷ lệ qua môn
- **Vai trò sử dụng**: Admin
- **Mục đích**: đánh giá tỷ lệ hoàn thành môn học
- **Chức năng cần có**:
  - Tỷ lệ đỗ/rớt theo môn
  - So sánh theo học kỳ, lớp, ngành
  - Xuất báo cáo
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

## 9.3. Trang báo cáo chuyên cần
- **Vai trò sử dụng**: Admin, Cố vấn
- **Mục đích**: đánh giá tình hình tham gia học tập
- **Chức năng cần có**:
  - Tỷ lệ chuyên cần theo lớp, môn, học kỳ
  - Danh sách sinh viên vắng nhiều
  - Xuất báo cáo
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

---

# 10) Phân hệ nhập liệu và tích hợp

## 10.1. Trang import danh sách sinh viên từ Excel
- **Vai trò sử dụng**: Admin
- **Mục đích**: nhập dữ liệu sinh viên hàng loạt theo yêu cầu NFR
- **Chức năng cần có**:
  - Upload file Excel
  - Kiểm tra cấu trúc file
  - Preview dữ liệu trước khi import
  - Báo lỗi từng dòng
  - Thực hiện import
  - Xuất danh sách lỗi
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

## 10.2. Trang lịch sử import dữ liệu
- **Vai trò sử dụng**: Admin
- **Mục đích**: quản lý các đợt nhập dữ liệu trước đó
- **Chức năng cần có**:
  - Danh sách lần import
  - Kết quả thành công/thất bại
  - Xem chi tiết lỗi
  - Tải file lỗi nếu có
- **UI hiện tại**: **Chưa có**
- **API hiện tại**: **Chưa có**

---

# 11) Các trang hiện đã có rõ trong code frontend

## 11.1. Trang đã có UI thật
1. **Trang đăng nhập**
   - File: `frontend/src/pages/auth/LoginPage.tsx`
   - Mức độ: dùng được

2. **Dashboard shell sau đăng nhập**
   - File: `frontend/src/pages/dashboard/DashboardPage.tsx`
   - Mức độ: có khung, chưa hoàn chỉnh theo nghiệp vụ

3. **Trang quản lý môn học**
   - File: `frontend/src/pages/subjects/SubjectManagementSection.tsx`
   - Mức độ: đã nối API danh sách/tạo/xoá, còn thiếu sửa/chi tiết

## 11.2. Mới ở mức menu hoặc placeholder
1. `Lớp hành chính`
2. `Cố vấn học tập`
3. `Thông báo`

---

# 12) Các nhóm API backend hiện đã có

## 12.1. Đã có API tương đối rõ
1. **Auth**
   - `backend/src/routes/auth.routes.ts`
2. **Academic reference data**
   - `backend/src/routes/academic.routes.ts`
3. **Subjects**
   - `backend/src/routes/subject.routes.ts`
4. **Administrative classes**
   - `backend/src/routes/administrative-class.routes.ts`
5. **Course offerings**
   - `backend/src/routes/course-offering.routes.ts`
6. **Registration periods**
   - `backend/src/routes/registration-period.routes.ts`
7. **Student enrollments**
   - `backend/src/routes/enrollment.routes.ts`

## 12.2. Chưa thấy API cho các phân hệ bắt buộc
1. Schedule / lịch học / lịch thi
2. Attendance / điểm danh
3. Grades / nhập điểm / bảng điểm
4. Appeals / phúc khảo
5. Notifications / gửi thông báo
6. Reports / báo cáo
7. Excel import sinh viên
8. Audit nghiệp vụ sửa điểm

---

# 13) Route frontend + endpoint backend + RBAC + ưu tiên

> Ghi chú:
> - `Frontend route` là route đề xuất để tổ chức app rõ ràng theo nghiệp vụ.
> - `Backend endpoint` là endpoint hiện có nếu đã thấy trong code; nếu chưa có sẽ ghi `Chưa có`.
> - `RBAC` là vai trò nên được phép truy cập.
> - `Ưu tiên` là mức nên làm tiếp trong giai đoạn tới.

## 13.1. Nhóm trang đang có hoặc có backend rõ nhất

| Trang | Frontend route đề xuất | Backend endpoint chính | RBAC | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|
| Đăng nhập hệ thống | `/login` | `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout` | Tất cả | UI có, API có | Cao |
| Dashboard tổng quan | `/dashboard` | Chưa có endpoint dashboard riêng | Admin, Giảng viên, Cố vấn, Sinh viên | UI một phần, API chưa có riêng | Cao |
| Quản lý môn học | `/dashboard/subjects` | `GET /subjects`, `GET /subjects/:id`, `POST /subjects`, `PUT /subjects/:id`, `DELETE /subjects/:id` | Admin (quản trị), các vai trò khác có thể xem tuỳ policy hiện tại | UI một phần, API có | Cao |
| Quản lý lớp hành chính | `/dashboard/administrative-classes` | Có backend module `administrative-class` | Admin, Cố vấn | UI chưa có, API một phần | Cao |
| Quản lý năm học / niên khoá / học kỳ | `/dashboard/academic-settings` | `GET /academic/reference-data`, `GET /academic/academic-years`, `GET /academic/school-years`, `GET /academic/semesters/metadata` | Admin | UI chưa có, API một phần | Trung bình |
| Quản lý lớp học phần | `/dashboard/course-offerings` | `GET /course-offerings`, `GET /course-offerings/:id`, `POST /course-offerings`, `PUT /course-offerings/:id` | Admin, Giảng viên, Cố vấn | UI chưa có, API có | Cao |
| Chi tiết lớp học phần | `/dashboard/course-offerings/:id` | `GET /course-offerings/:id` | Admin, Giảng viên, Cố vấn, Sinh viên (nếu là lớp đã đăng ký) | UI chưa có, API một phần | Cao |
| Quản lý đợt đăng ký học phần | `/dashboard/registration-periods` | `GET /registration-periods`, `POST /registration-periods`, `PUT /registration-periods/:id`, `POST /registration-periods/:id/open`, `POST /registration-periods/:id/close`, `POST /registration-periods/:id/classes`, `DELETE /registration-periods/:id/classes/:classId` | Admin | UI chưa có, API có | Cao |
| Theo dõi đăng ký học phần (Admin) | `/dashboard/enrollments` | `GET /registration-periods/:id/course-offerings` + cần bổ sung API admin tổng hợp đăng ký | Admin | UI chưa có, API một phần | Cao |
| Đăng ký học phần (Sinh viên) | `/student/enrollments` hoặc `/dashboard/enrollments` | `GET /me/enrollments`, `POST /me/enrollments`, `DELETE /me/enrollments/:id`, `GET /registration-periods/current` | Sinh viên | UI chưa có, API có luồng chính | Cao |

## 13.2. Nhóm trang bắt buộc theo đề tài nhưng chưa có backend

| Trang | Frontend route đề xuất | Backend endpoint chính | RBAC | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|
| Quản lý lịch học | `/dashboard/schedules` | Chưa có | Admin, Giảng viên | UI chưa có, API chưa có | Cao |
| Quản lý lịch thi | `/dashboard/exam-schedules` | Chưa có | Admin, Giảng viên, Sinh viên | UI chưa có, API chưa có | Trung bình |
| Điểm danh theo buổi | `/lecturer/attendance` hoặc `/dashboard/attendance` | Chưa có | Giảng viên | UI chưa có, API chưa có | Cao |
| Tổng hợp chuyên cần lớp học phần | `/dashboard/attendance-summary` | Chưa có | Admin, Giảng viên, Cố vấn | UI chưa có, API chưa có | Cao |
| Chuyên cần cá nhân sinh viên | `/student/attendance` | Chưa có | Sinh viên | UI chưa có, API chưa có | Trung bình |
| Cảnh báo chuyên cần | `/dashboard/attendance-alerts` | Chưa có | Admin, Cố vấn, Sinh viên | UI chưa có, API chưa có | Cao |
| Cấu hình đầu điểm / công thức tính điểm | `/dashboard/grading-policies` | Chưa có | Admin | UI chưa có, API chưa có | Cao |
| Nhập điểm thành phần | `/lecturer/grades` hoặc `/dashboard/grades-entry` | Chưa có | Giảng viên | UI chưa có, API chưa có | Cao |
| Bảng điểm lớp học phần | `/dashboard/course-offerings/:id/grades` | Chưa có | Admin, Giảng viên | UI chưa có, API chưa có | Cao |
| Bảng điểm cá nhân sinh viên | `/student/transcript` | Chưa có | Sinh viên | UI chưa có, API chưa có | Cao |
| Cảnh báo học lại / học lực yếu | `/dashboard/academic-alerts` | Chưa có | Admin, Cố vấn, Sinh viên | UI chưa có, API chưa có | Trung bình |
| Audit sửa điểm | `/dashboard/grade-audit-logs` | Chưa có theo nghiệp vụ điểm | Admin | UI chưa có, API chưa có | Cao |
| Tạo đơn phúc khảo | `/student/appeals/new` | Chưa có | Sinh viên | UI chưa có, API chưa có | Trung bình |
| Theo dõi đơn phúc khảo | `/student/appeals` | Chưa có | Sinh viên | UI chưa có, API chưa có | Trung bình |
| Xử lý phúc khảo | `/dashboard/appeals` | Chưa có | Admin, Giảng viên được phân quyền | UI chưa có, API chưa có | Trung bình |
| Quản lý thông báo | `/dashboard/notifications` | Chưa có | Admin | UI chưa có, API chưa có | Trung bình |
| Danh sách thông báo sinh viên | `/student/notifications` | Chưa có | Sinh viên | UI chưa có, API chưa có | Trung bình |
| Báo cáo phân phối điểm | `/dashboard/reports/grade-distribution` | Chưa có | Admin | UI chưa có, API chưa có | Thấp |
| Báo cáo tỷ lệ qua môn | `/dashboard/reports/pass-rate` | Chưa có | Admin | UI chưa có, API chưa có | Thấp |
| Báo cáo chuyên cần | `/dashboard/reports/attendance` | Chưa có | Admin, Cố vấn | UI chưa có, API chưa có | Thấp |
| Import sinh viên từ Excel | `/dashboard/import/students` | Chưa có | Admin | UI chưa có, API chưa có | Trung bình |
| Lịch sử import dữ liệu | `/dashboard/import/history` | Chưa có | Admin | UI chưa có, API chưa có | Thấp |

## 13.3. Gợi ý chuẩn hoá route frontend

### Khu vực dùng chung
- `/login`
- `/dashboard`

### Khu vực admin
- `/dashboard/subjects`
- `/dashboard/administrative-classes`
- `/dashboard/academic-settings`
- `/dashboard/course-offerings`
- `/dashboard/course-offerings/:id`
- `/dashboard/registration-periods`
- `/dashboard/enrollments`
- `/dashboard/schedules`
- `/dashboard/exam-schedules`
- `/dashboard/attendance-summary`
- `/dashboard/attendance-alerts`
- `/dashboard/grading-policies`
- `/dashboard/grades-entry`
- `/dashboard/grade-audit-logs`
- `/dashboard/appeals`
- `/dashboard/notifications`
- `/dashboard/reports/grade-distribution`
- `/dashboard/reports/pass-rate`
- `/dashboard/reports/attendance`
- `/dashboard/import/students`
- `/dashboard/import/history`

### Khu vực giảng viên
- `/lecturer/attendance`
- `/lecturer/grades`

### Khu vực sinh viên
- `/student/enrollments`
- `/student/attendance`
- `/student/transcript`
- `/student/appeals`
- `/student/appeals/new`
- `/student/notifications`

---

# 14) Kết luận ngắn

## Phần đang gần hoàn chỉnh nhất
- Đăng nhập và phân quyền
- Quản lý môn học
- Dữ liệu học vụ tham chiếu
- Backend cho lớp học phần / đợt đăng ký / đăng ký học phần

## Các phân hệ còn thiếu nhiều nhất
- Lịch học / lịch thi
- Điểm danh / chuyên cần
- Điểm số / bảng điểm
- Phúc khảo
- Thông báo
- Báo cáo
- Import Excel
- Audit sửa điểm

## Thứ tự ưu tiên nên làm tiếp
1. Quản lý lớp học phần
2. Quản lý đợt đăng ký học phần
3. UI sinh viên đăng ký học phần
4. Lịch học / lịch thi
5. Điểm danh / chuyên cần
6. Điểm số + audit sửa điểm
7. Bảng điểm + phúc khảo
8. Thông báo + báo cáo + import Excel
