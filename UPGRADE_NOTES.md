# Ghi chú nâng cấp hệ thống HMS

## Tóm tắt nâng cấp

### Backend API - Đã hoàn thành ✅

**Thêm các API DELETE:**
- Bill, Doctor, Medicine, Staff, Insurance (Policy & Claim)
- Inventory, Encounter, Lab (Test & Order), Surgery
- Consent, Telemedicine

**Thêm các API UPDATE:**
- Staff, Inventory, Consent

**Tất cả controllers đã có đầy đủ CRUD operations**

### Frontend - Trang mới ✅

1. **Lab** (`/lab`) - Quản lý xét nghiệm
2. **Pharmacy** (`/pharmacy`) - Quản lý nhà thuốc  
3. **Inventory** (`/inventory`) - Quản lý kho vật tư
4. **Insurance** (`/insurance`) - Quản lý bảo hiểm
5. **Referrals** (`/referrals`) - Quản lý chuyển viện
6. **Telemedicine** (`/telemedicine`) - Khám từ xa
7. **Consent** (`/consent`) - Đồng ý điều trị
8. **Doctors** (`/doctors`) - Quản lý bác sĩ (CRUD đầy đủ)

### Frontend - Nâng cấp trang hiện có ✅

- **Equipment** - Thêm Edit & Delete
- **Procurement** - Thêm Edit & Delete cho suppliers
- **Staff** - Đã có sẵn

## Hướng dẫn kiểm tra

### 1. Kiểm tra Backend

```bash
cd de_qlbv_server

# Cài đặt dependencies
npm install

# Chạy migrations
npx prisma migrate dev

# Seed dữ liệu mẫu (nếu có)
npx prisma db seed

# Chạy server
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

### 2. Kiểm tra Frontend

```bash
cd de_qlbv_client

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

### 3. Test các trang mới

**Lab (`/lab`):**
- Tab "Phiếu xét nghiệm": Tạo phiếu XN mới
- Tab "Danh mục XN": Thêm/Xóa xét nghiệm

**Pharmacy (`/pharmacy`):**
- Thêm thuốc mới
- Sửa thông tin thuốc
- Điều chỉnh tồn kho (IN/OUT/ADJUST)
- Xóa thuốc
- Cảnh báo tồn kho thấp

**Inventory (`/inventory`):**
- Thêm vật tư
- Sửa vật tư
- Điều chỉnh số lượng
- Xóa vật tư
- Lọc theo danh mục

**Insurance (`/insurance`):**
- Tab "Hợp đồng bảo hiểm": Thêm/Xóa policy
- Tab "Yêu cầu bồi thường": Tạo/Duyệt/Từ chối claim

**Referrals (`/referrals`):**
- Tạo chuyển viện
- Sửa thông tin
- Xóa
- Theo dõi trạng thái

**Telemedicine (`/telemedicine`):**
- Tạo lịch khám từ xa
- Bắt đầu/Kết thúc phiên
- Sửa/Xóa lịch

**Consent (`/consent`):**
- Tạo phiếu đồng ý
- Ký phiếu
- Sửa/Xóa

**Doctors (`/doctors`):**
- Thêm bác sĩ
- Sửa thông tin
- Xóa bác sĩ
- Tìm kiếm

## Lưu ý quan trọng

### Nếu không thêm được dữ liệu:

1. **Kiểm tra Console Browser (F12)**
   - Xem có lỗi API không
   - Kiểm tra network tab

2. **Kiểm tra Backend logs**
   - Xem có lỗi validation không
   - Kiểm tra database connection

3. **Kiểm tra dữ liệu bắt buộc:**
   - Một số trường có thể required
   - Foreign keys phải tồn tại (patientId, doctorId, etc.)

4. **Kiểm tra Authentication:**
   - Đảm bảo đã login
   - Token còn hiệu lực

### Các trường thường bắt buộc:

**Lab:**
- `patientId` - Phải có bệnh nhân trong DB
- `testId` - Phải có xét nghiệm trong danh mục

**Pharmacy:**
- `code`, `name`, `unit`, `price`, `stock`, `minStock`

**Inventory:**
- `code`, `name`, `category`, `unit`, `quantity`, `minQuantity`

**Insurance:**
- Policy: `patientId`, `provider`, `policyNumber`, `validFrom`, `validTo`
- Claim: `billId`, `claimAmount`

**Referrals:**
- `patientId`, `toFacility`, `reason`

**Telemedicine:**
- `patientId`, `doctorId`, `scheduledAt`, `duration`

**Consent:**
- `patientId`, `type`, `title`, `content`

**Doctors:**
- `userId` - Phải tạo User trước

## API Endpoints mới

### Lab
- `GET /api/lab/tests` - Danh sách xét nghiệm
- `POST /api/lab/tests` - Thêm xét nghiệm
- `DELETE /api/lab/tests/:id` - Xóa xét nghiệm
- `GET /api/lab/orders` - Danh sách phiếu XN
- `POST /api/lab/orders` - Tạo phiếu XN
- `DELETE /api/lab/orders/:id` - Xóa phiếu XN

### Pharmacy
- `GET /api/pharmacy/medicines` - Danh sách thuốc
- `POST /api/pharmacy/medicines` - Thêm thuốc
- `PUT /api/pharmacy/medicines/:id` - Sửa thuốc
- `DELETE /api/pharmacy/medicines/:id` - Xóa thuốc
- `POST /api/pharmacy/medicines/:id/stock` - Điều chỉnh tồn kho

### Inventory
- `GET /api/inventory` - Danh sách vật tư
- `POST /api/inventory` - Thêm vật tư
- `PUT /api/inventory/:id` - Sửa vật tư
- `DELETE /api/inventory/:id` - Xóa vật tư
- `POST /api/inventory/:id/adjust` - Điều chỉnh số lượng

### Insurance
- `GET /api/insurance/policies` - Danh sách hợp đồng
- `POST /api/insurance/policies` - Thêm hợp đồng
- `DELETE /api/insurance/policies/:id` - Xóa hợp đồng
- `GET /api/insurance/claims` - Danh sách yêu cầu
- `POST /api/insurance/claims` - Tạo yêu cầu
- `PATCH /api/insurance/claims/:id/status` - Cập nhật trạng thái
- `DELETE /api/insurance/claims/:id` - Xóa yêu cầu

### Referrals
- `GET /api/referrals` - Danh sách chuyển viện
- `POST /api/referrals` - Tạo chuyển viện
- `PUT /api/referrals/:id` - Sửa
- `DELETE /api/referrals/:id` - Xóa

### Telemedicine
- `GET /api/telemedicine` - Danh sách lịch khám
- `POST /api/telemedicine` - Tạo lịch
- `PUT /api/telemedicine/:id` - Sửa
- `DELETE /api/telemedicine/:id` - Xóa
- `POST /api/telemedicine/:id/start` - Bắt đầu phiên
- `POST /api/telemedicine/:id/end` - Kết thúc phiên

### Consent
- `GET /api/consent` - Danh sách phiếu đồng ý
- `POST /api/consent` - Tạo phiếu
- `PUT /api/consent/:id` - Sửa
- `PUT /api/consent/:id/sign` - Ký phiếu
- `DELETE /api/consent/:id` - Xóa

### Doctors
- `GET /api/doctors` - Danh sách bác sĩ
- `POST /api/doctors` - Thêm bác sĩ
- `PUT /api/doctors/:id` - Sửa
- `DELETE /api/doctors/:id` - Xóa

## Troubleshooting

### Lỗi TypeScript "Cannot find module 'react'" hoặc JSX errors
Đây là lỗi cấu hình TypeScript/IDE, không ảnh hưởng đến chức năng thực tế:

**Giải pháp:**
```bash
cd de_qlbv_client

# 1. Cài đặt dependencies
npm install

# 2. Restart TypeScript server trong VS Code
# Nhấn Ctrl+Shift+P (hoặc Cmd+Shift+P trên Mac)
# Gõ: "TypeScript: Restart TS Server"

# 3. Nếu vẫn lỗi, xóa cache và cài lại
rm -rf node_modules package-lock.json .next
npm install
```

**Lưu ý:** Các lỗi TypeScript trong IDE không ngăn cản ứng dụng chạy. Bạn vẫn có thể chạy `npm run dev` bình thường.

### Lỗi "Cannot find module" khi chạy ứng dụng
- Chạy `npm install` lại
- Xóa `node_modules` và `package-lock.json`, rồi `npm install`

### Lỗi "Network Error"
- Kiểm tra backend có đang chạy không
- Kiểm tra URL trong `de_qlbv_client/src/lib/axios.ts`

### Lỗi "Unauthorized"
- Login lại
- Kiểm tra token trong localStorage

### Lỗi "Foreign key constraint"
- Tạo dữ liệu phụ thuộc trước (Patient, Doctor, User, etc.)
- Kiểm tra ID có tồn tại không

### Lỗi "Validation failed"
- Kiểm tra tất cả trường bắt buộc đã điền
- Kiểm tra format dữ liệu (date, number, etc.)

## Liên hệ

Nếu gặp vấn đề, hãy kiểm tra:
1. Console log (F12)
2. Network tab
3. Backend terminal logs
4. Database có dữ liệu không

Chúc bạn test thành công! 🎉
