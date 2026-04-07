# Test Data Entry - Hướng dẫn test thêm dữ liệu

## 🧪 Test Plan

### Chuẩn bị
1. Chạy backend: `cd de_qlbv_server && npm run dev`
2. Chạy frontend: `cd de_qlbv_client && npm run dev`
3. Mở browser: http://localhost:3000
4. Login vào hệ thống
5. Mở DevTools (F12) để xem console logs

## ✅ Test từng trang

### 1. Lab Page (`/lab`)

**Test Thêm Xét Nghiệm:**
```
1. Click tab "Danh mục XN"
2. Click "Thêm xét nghiệm"
3. Nhập:
   - Mã: XN001
   - Tên: Xét nghiệm máu
   - Danh mục: Hematology
   - Giá: 100000
   - Đơn vị: g/L
   - Giá trị bình thường: 4.5-5.5
4. Click "Thêm"
5. ✅ Kiểm tra: Xét nghiệm hiển thị trong danh sách
```

**Test Tạo Phiếu XN:**
```
1. Click tab "Phiếu xét nghiệm"
2. Click "Tạo phiếu XN"
3. Nhập:
   - Mã bệnh nhân: (nhập ID có sẵn từ /patients)
   - Chọn xét nghiệm: XN001
   - Ghi chú: Test
4. Click "Tạo"
5. ✅ Kiểm tra: Phiếu hiển thị trong danh sách
```

**Test Error Handling:**
```
1. Click "Tạo phiếu XN"
2. Để trống mã bệnh nhân
3. Click "Tạo"
4. ✅ Kiểm tra: Toast error "Vui lòng nhập mã bệnh nhân"
```

### 2. Pharmacy Page (`/pharmacy`)

**Test Thêm Thuốc:**
```
1. Click "Thêm thuốc"
2. Nhập:
   - Mã: MED001
   - Tên: Paracetamol
   - Danh mục: Giảm đau
   - Đơn vị: Viên
   - Giá: 5000
   - Tồn kho: 100
   - Tồn kho tối thiểu: 20
3. Click "Thêm"
4. ✅ Kiểm tra: Thuốc hiển thị trong danh sách
```

**Test Điều Chỉnh Tồn Kho:**
```
1. Click "Điều chỉnh" trên thuốc vừa tạo
2. Chọn:
   - Loại: Nhập kho
   - Số lượng: 50
   - Lý do: Nhập thêm
3. Click "Xác nhận"
4. ✅ Kiểm tra: Tồn kho tăng lên 150
```

### 3. Inventory Page (`/inventory`)

**Test Thêm Vật Tư:**
```
1. Click "Thêm vật tư"
2. Nhập:
   - Mã: INV001
   - Tên: Băng gạc
   - Danh mục: Y te
   - Đơn vị: Hộp
   - Số lượng: 50
   - Số lượng tối thiểu: 10
3. Click "Thêm"
4. ✅ Kiểm tra: Vật tư hiển thị trong danh sách
```

### 4. Insurance Page (`/insurance`)

**Test Thêm Hợp Đồng:**
```
1. Click tab "Hợp đồng bảo hiểm"
2. Click "Thêm bảo hiểm"
3. Nhập:
   - Mã bệnh nhân: (ID có sẵn)
   - Nhà cung cấp: Bảo Việt
   - Số hợp đồng: BV123456
   - Loại: BHYT
   - Số tiền: 50000000
   - Hiệu lực từ: 2024-01-01
   - Đến: 2024-12-31
4. Click "Thêm"
5. ✅ Kiểm tra: Hợp đồng hiển thị trong danh sách
```

**Test Tạo Yêu Cầu Bồi Thường:**
```
1. Click tab "Yêu cầu bồi thường"
2. Click "Tạo yêu cầu bồi thường"
3. Nhập:
   - Mã hóa đơn: (ID có sẵn từ /billing)
   - Số tiền yêu cầu: 1000000
   - Chẩn đoán: Viêm phổi
   - Ghi chú: Test
4. Click "Tạo"
5. ✅ Kiểm tra: Yêu cầu hiển thị trong danh sách
```

### 5. Consent Page (`/consent`)

**Test Tạo Phiếu Đồng Ý:**
```
1. Click "Tạo phiếu đồng ý"
2. Nhập:
   - Mã bệnh nhân: (ID có sẵn)
   - Loại: Phẫu thuật
   - Tiêu đề: Đồng ý phẫu thuật
   - Nội dung: Tôi đồng ý...
   - Rủi ro: Có thể gây biến chứng
   - Lợi ích: Cải thiện sức khỏe
3. Click "Tạo"
4. ✅ Kiểm tra: Phiếu hiển thị trong danh sách
```

### 6. Referrals Page (`/referrals`)

**Test Tạo Chuyển Viện:**
```
1. Click "Tạo chuyển viện"
2. Nhập:
   - Mã bệnh nhân: (ID có sẵn)
   - Chuyển đến: Bệnh viện Trung ương
   - Bác sĩ tiếp nhận: BS. Nguyễn Văn A
   - Lý do: Cần phẫu thuật chuyên sâu
   - Chẩn đoán: U não
   - Mức độ: Khẩn cấp
   - Trạng thái: Chờ xử lý
3. Click "Tạo"
4. ✅ Kiểm tra: Chuyển viện hiển thị trong danh sách
```

### 7. Telemedicine Page (`/telemedicine`)

**Test Tạo Lịch Khám:**
```
1. Click "Tạo lịch khám"
2. Nhập:
   - Mã bệnh nhân: (ID có sẵn)
   - Mã bác sĩ: (ID có sẵn)
   - Thời gian: 2024-12-01 10:00
   - Thời lượng: 30
   - Lý do: Tái khám
   - Link cuộc họp: https://meet.google.com/abc
3. Click "Tạo"
4. ✅ Kiểm tra: Lịch khám hiển thị trong danh sách
```

### 8. Doctors Page (`/doctors`)

**Test Thêm Bác Sĩ:**
```
1. Click "Thêm bác sĩ"
2. Nhập:
   - Mã người dùng: (ID user có sẵn)
   - Chuyên khoa: Tim mạch
   - Kinh nghiệm: 10
   - Phòng khám: P101
   - Giới thiệu: Bác sĩ chuyên khoa tim mạch
3. Click "Thêm"
4. ✅ Kiểm tra: Bác sĩ hiển thị trong danh sách
```

## 🐛 Common Issues & Solutions

### Issue 1: "patientId is required"
**Nguyên nhân:** Chưa có bệnh nhân trong DB
**Giải pháp:**
```
1. Vào /patients
2. Tạo bệnh nhân mới
3. Copy ID bệnh nhân
4. Dùng ID này để test các trang khác
```

### Issue 2: "Foreign key constraint failed"
**Nguyên nhân:** ID không tồn tại trong DB
**Giải pháp:**
```
1. Kiểm tra ID có tồn tại không
2. Tạo dữ liệu phụ thuộc trước
3. Dùng ID đúng
```

### Issue 3: "Validation failed"
**Nguyên nhân:** Thiếu required fields
**Giải pháp:**
```
1. Kiểm tra tất cả fields có dấu *
2. Điền đầy đủ thông tin
3. Kiểm tra format đúng (date, number, etc.)
```

### Issue 4: "Network Error"
**Nguyên nhân:** Backend không chạy
**Giải pháp:**
```
1. Kiểm tra backend: cd de_qlbv_server && npm run dev
2. Kiểm tra port 5000 có đang chạy không
3. Kiểm tra axios config
```

### Issue 5: Toast không hiển thị
**Nguyên nhân:** Chưa có Toaster component
**Giải pháp:**
```
1. Kiểm tra _app.tsx có <Toaster /> không
2. Nếu chưa có, thêm vào
```

## 📊 Test Results Template

```
Trang: _____________
Ngày test: _____________
Người test: _____________

[ ] Thêm mới - Pass/Fail
    Lỗi (nếu có): _____________
    
[ ] Sửa - Pass/Fail
    Lỗi (nếu có): _____________
    
[ ] Xóa - Pass/Fail
    Lỗi (nếu có): _____________
    
[ ] Validation - Pass/Fail
    Lỗi (nếu có): _____________
    
[ ] Error handling - Pass/Fail
    Lỗi (nếu có): _____________
    
[ ] Loading states - Pass/Fail
    Lỗi (nếu có): _____________

Ghi chú: _____________
```

## 🎯 Success Criteria

Một trang được coi là PASS khi:
- ✅ Thêm mới thành công
- ✅ Sửa thành công (nếu có)
- ✅ Xóa thành công với confirm dialog
- ✅ Validation hoạt động đúng
- ✅ Error messages hiển thị rõ ràng
- ✅ Success messages hiển thị
- ✅ Loading states hoạt động
- ✅ Data hiển thị đúng trong table

## 📝 Test Report

Sau khi test xong tất cả trang, tạo report:

```markdown
# Test Report - Data Entry

## Summary
- Total pages tested: 11
- Passed: X
- Failed: Y
- Pass rate: Z%

## Details

### Passed Pages
1. Lab - ✅
2. Pharmacy - ✅
3. ...

### Failed Pages
1. Page name - ❌
   - Issue: Description
   - Fix: Solution

## Recommendations
- ...
```

## 🚀 Automation (Optional)

Có thể tạo automated tests với Cypress hoặc Playwright:

```javascript
// Example Cypress test
describe('Lab Page', () => {
  it('should create new test', () => {
    cy.visit('/lab');
    cy.contains('Thêm xét nghiệm').click();
    cy.get('input[name="code"]').type('XN001');
    cy.get('input[name="name"]').type('Xét nghiệm máu');
    cy.contains('Thêm').click();
    cy.contains('Thành công').should('be.visible');
  });
});
```

Nhưng hiện tại manual testing là đủ.
