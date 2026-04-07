# Checklist kiểm tra các trang đã nâng cấp

## ✅ Trang mới (8 trang)

### 1. Lab (`/lab`)
- [ ] Hiển thị danh sách phiếu xét nghiệm
- [ ] Tạo phiếu xét nghiệm mới
- [ ] Xóa phiếu xét nghiệm
- [ ] Tab "Danh mục XN" hiển thị
- [ ] Thêm xét nghiệm vào danh mục
- [ ] Xóa xét nghiệm khỏi danh mục

### 2. Pharmacy (`/pharmacy`)
- [ ] Hiển thị danh sách thuốc
- [ ] Thêm thuốc mới
- [ ] Sửa thông tin thuốc
- [ ] Xóa thuốc
- [ ] Điều chỉnh tồn kho (IN/OUT/ADJUST)
- [ ] Cảnh báo tồn kho thấp hiển thị đúng

### 3. Inventory (`/inventory`)
- [ ] Hiển thị danh sách vật tư
- [ ] Thêm vật tư mới
- [ ] Sửa vật tư
- [ ] Xóa vật tư
- [ ] Điều chỉnh số lượng
- [ ] Lọc theo danh mục hoạt động

### 4. Insurance (`/insurance`)
- [ ] Tab "Hợp đồng bảo hiểm" hiển thị
- [ ] Thêm hợp đồng mới
- [ ] Xóa hợp đồng
- [ ] Tab "Yêu cầu bồi thường" hiển thị
- [ ] Tạo yêu cầu bồi thường
- [ ] Duyệt yêu cầu
- [ ] Từ chối yêu cầu
- [ ] Xóa yêu cầu

### 5. Referrals (`/referrals`)
- [ ] Hiển thị danh sách chuyển viện
- [ ] Tạo chuyển viện mới
- [ ] Sửa thông tin chuyển viện
- [ ] Xóa chuyển viện
- [ ] Trạng thái hiển thị đúng (pending/accepted/rejected/completed)

### 6. Telemedicine (`/telemedicine`)
- [ ] Hiển thị danh sách lịch khám
- [ ] Tạo lịch khám mới
- [ ] Sửa lịch khám
- [ ] Xóa lịch khám
- [ ] Bắt đầu phiên khám
- [ ] Kết thúc phiên khám
- [ ] Trạng thái cập nhật đúng

### 7. Consent (`/consent`)
- [ ] Hiển thị danh sách phiếu đồng ý
- [ ] Tạo phiếu đồng ý mới
- [ ] Sửa phiếu đồng ý
- [ ] Xóa phiếu đồng ý
- [ ] Ký phiếu đồng ý
- [ ] Trạng thái "signed" hiển thị đúng

### 8. Doctors (`/doctors`)
- [ ] Hiển thị danh sách bác sĩ
- [ ] Thêm bác sĩ mới
- [ ] Sửa thông tin bác sĩ
- [ ] Xóa bác sĩ
- [ ] Tìm kiếm bác sĩ

## ✅ Trang đã nâng cấp (3 trang)

### 9. Equipment (`/equipment`)
- [ ] Nút "Sửa" hiển thị
- [ ] Nút "Xóa" hiển thị
- [ ] Sửa thiết bị hoạt động
- [ ] Xóa thiết bị hoạt động

### 10. Procurement (`/procurement`)
- [ ] Nút "Sửa" nhà cung cấp hiển thị
- [ ] Nút "Xóa" nhà cung cấp hiển thị
- [ ] Sửa nhà cung cấp hoạt động
- [ ] Xóa nhà cung cấp hoạt động

### 11. Staff (`/staff`)
- [ ] Đã có đầy đủ CRUD từ trước

## Kiểm tra chung

### UI/UX
- [ ] Tất cả Modal mở/đóng đúng
- [ ] Toast notifications hiển thị khi thành công
- [ ] Toast error hiển thị khi thất bại
- [ ] Loading states hiển thị khi đang xử lý
- [ ] Confirm dialog hiển thị trước khi xóa

### API Integration
- [ ] Tất cả GET requests hoạt động
- [ ] Tất cả POST requests hoạt động
- [ ] Tất cả PUT/PATCH requests hoạt động
- [ ] Tất cả DELETE requests hoạt động
- [ ] Error handling đúng khi API fail

### Data Validation
- [ ] Required fields được validate
- [ ] Date fields format đúng
- [ ] Number fields chỉ nhận số
- [ ] Foreign keys được kiểm tra

## Lỗi thường gặp và cách fix

### Modal không mở
**Nguyên nhân:** State `showModal` không được set đúng
**Fix:** Kiểm tra `onClick={() => setShowModal(true)}`

### Không thêm được dữ liệu
**Nguyên nhân:** Thiếu required fields hoặc foreign key không tồn tại
**Fix:** 
1. Mở Console (F12) xem lỗi
2. Kiểm tra Network tab xem response từ API
3. Đảm bảo tất cả required fields đã điền
4. Đảm bảo patientId, doctorId, etc. tồn tại trong DB

### Không xóa được
**Nguyên nhân:** Foreign key constraint
**Fix:** Xóa các bản ghi liên quan trước

### Toast không hiển thị
**Nguyên nhân:** Chưa import Toaster trong _app.tsx
**Fix:** Kiểm tra `<Toaster />` đã được thêm vào _app.tsx

### API trả về 401 Unauthorized
**Nguyên nhân:** Token hết hạn hoặc chưa login
**Fix:** Login lại

### API trả về 404 Not Found
**Nguyên nhân:** Backend chưa chạy hoặc route sai
**Fix:** 
1. Kiểm tra backend đang chạy tại port 5000
2. Kiểm tra URL trong axios config

## Test scenarios

### Scenario 1: Thêm bệnh nhân và tạo phiếu xét nghiệm
1. Vào `/patients` → Thêm bệnh nhân mới
2. Lưu lại `patientId`
3. Vào `/lab` → Tab "Phiếu xét nghiệm"
4. Thêm phiếu XN với `patientId` vừa tạo
5. Kiểm tra phiếu hiển thị trong danh sách

### Scenario 2: Quản lý tồn kho thuốc
1. Vào `/pharmacy` → Thêm thuốc mới
2. Set `minStock = 10`, `stock = 5`
3. Kiểm tra cảnh báo tồn kho thấp hiển thị
4. Điều chỉnh tồn kho: Nhập thêm 20
5. Kiểm tra `stock` cập nhật thành 25
6. Cảnh báo tồn kho thấp biến mất

### Scenario 3: Quy trình bảo hiểm
1. Vào `/insurance` → Tab "Hợp đồng"
2. Thêm hợp đồng bảo hiểm cho bệnh nhân
3. Tạo hóa đơn tại `/billing`
4. Quay lại `/insurance` → Tab "Yêu cầu bồi thường"
5. Tạo claim với `billId` vừa tạo
6. Duyệt claim
7. Kiểm tra status = "approved"

### Scenario 4: Khám từ xa
1. Vào `/telemedicine` → Tạo lịch khám
2. Chọn bệnh nhân, bác sĩ, thời gian
3. Khi đến giờ, click "Bắt đầu"
4. Status chuyển sang "in_progress"
5. Click "Kết thúc"
6. Status chuyển sang "completed"

## Kết quả mong đợi

Sau khi hoàn thành checklist:
- ✅ Tất cả 11 trang hoạt động đầy đủ CRUD
- ✅ Không có lỗi console
- ✅ Không có lỗi API
- ✅ UI/UX mượt mà, không lag
- ✅ Data được lưu đúng vào database
- ✅ Toast notifications hoạt động
- ✅ Loading states hiển thị đúng

## Ghi chú

- Các lỗi TypeScript trong IDE (màu đỏ) không ảnh hưởng đến chức năng
- Chạy `npm install` và restart TypeScript server để fix
- Ứng dụng vẫn chạy bình thường dù có lỗi TypeScript trong IDE
