# 📡 API 接口文档

## 基础信息

- **基础 URL**: `https://api.museum.com/v1`
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON
- **字符编码**: UTF-8

---

## 统一响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": { },
  "timestamp": 1709481600000
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "errors": [],
  "timestamp": 1709481600000
}
```

### 状态码说明
| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token 过期 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 认证模块

### 1. 用户注册
```
POST /auth/register
```

**请求体**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "phone": "string"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": "string",
    "token": "string"
  }
}
```

### 2. 用户登录
```
POST /auth/login
```

**请求体**:
```json
{
  "username": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "userId": "string",
    "username": "string",
    "token": "string",
    "expiresIn": 7200
  }
}
```

### 3. 刷新 Token
```
POST /auth/refresh
```

**请求头**: `Authorization: Bearer <refreshToken>`

**响应**:
```json
{
  "code": 200,
  "message": "刷新成功",
  "data": {
    "token": "string",
    "expiresIn": 7200
  }
}
```

---

## 展品模块

### 1. 获取展品列表
```
GET /exhibits
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 10 |
| keyword | string | 否 | 搜索关键词 |
| category | string | 否 | 分类筛选 |
| location | string | 否 | 位置筛选 |

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "_id": "string",
        "name": "展品名称",
        "description": "展品描述",
        "imageUrl": "https://...",
        "location": "A 区 1 号展厅",
        "category": "历史文物",
        "tags": ["tag1", "tag2"],
        "createdAt": "2026-03-03T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### 2. 获取展品详情
```
GET /exhibits/:id
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "_id": "string",
    "name": "展品名称",
    "description": "详细描述",
    "imageUrl": "https://...",
    "images": ["url1", "url2"],
    "location": "A 区 1 号展厅",
    "category": "历史文物",
    "tags": ["tag1", "tag2"],
    "audioGuide": "https://...",
    "videoUrl": "https://...",
    "historicalBackground": "历史背景",
    "createdAt": "2026-03-03T00:00:00Z",
    "updatedAt": "2026-03-03T00:00:00Z"
  }
}
```

### 3. 创建展品 (管理员)
```
POST /exhibits
```

**请求头**: `Authorization: Bearer <token>`

**请求体**:
```json
{
  "name": "string",
  "description": "string",
  "imageUrl": "string",
  "images": ["string"],
  "location": "string",
  "category": "string",
  "tags": ["string"],
  "audioGuide": "string",
  "videoUrl": "string",
  "historicalBackground": "string"
}
```

### 4. 更新展品 (管理员)
```
PUT /exhibits/:id
```

**请求头**: `Authorization: Bearer <token>`

### 5. 删除展品 (管理员)
```
DELETE /exhibits/:id
```

**请求头**: `Authorization: Bearer <token>`

---

## 预约模块

### 1. 创建预约
```
POST /reservations
```

**请求头**: `Authorization: Bearer <token>`

**请求体**:
```json
{
  "exhibitId": "string",
  "date": "2026-03-10",
  "timeSlot": "09:00-10:00",
  "visitorCount": 2,
  "contactName": "string",
  "contactPhone": "string",
  "remark": "string"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "预约成功",
  "data": {
    "reservationId": "string",
    "status": "pending",
    "qrCode": "https://..."
  }
}
```

### 2. 获取我的预约
```
GET /reservations/my
```

**请求头**: `Authorization: Bearer <token>`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 状态筛选 (pending/confirmed/cancelled) |

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "_id": "string",
        "exhibitId": "string",
        "exhibitName": "展品名称",
        "date": "2026-03-10",
        "timeSlot": "09:00-10:00",
        "visitorCount": 2,
        "status": "confirmed",
        "qrCode": "https://...",
        "createdAt": "2026-03-03T00:00:00Z"
      }
    ],
    "total": 10
  }
}
```

### 3. 取消预约
```
DELETE /reservations/:id
```

**请求头**: `Authorization: Bearer <token>`

### 4. 获取可预约时段
```
GET /reservations/available-slots
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| date | string | 是 | 日期 (YYYY-MM-DD) |
| exhibitId | string | 否 | 展品 ID |

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "date": "2026-03-10",
    "slots": [
      { "time": "09:00-10:00", "available": true, "remaining": 20 },
      { "time": "10:00-11:00", "available": true, "remaining": 15 },
      { "time": "11:00-12:00", "available": false, "remaining": 0 }
    ]
  }
}
```

---

## 用户模块

### 1. 获取用户信息
```
GET /users/profile
```

**请求头**: `Authorization: Bearer <token>`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "phone": "string",
    "avatar": "https://...",
    "role": "user",
    "createdAt": "2026-03-03T00:00:00Z"
  }
}
```

### 2. 更新用户信息
```
PUT /users/profile
```

**请求头**: `Authorization: Bearer <token>`

**请求体**:
```json
{
  "username": "string",
  "phone": "string",
  "avatar": "string"
}
```

### 3. 修改密码
```
PUT /users/password
```

**请求头**: `Authorization: Bearer <token>`

**请求体**:
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

---

## 访问记录模块

### 1. 记录访问
```
POST /visits
```

**请求头**: `Authorization: Bearer <token>`

**请求体**:
```json
{
  "exhibitId": "string",
  "duration": 300
}
```

### 2. 获取访问历史
```
GET /visits/my
```

**请求头**: `Authorization: Bearer <token>`

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 1001 | 参数验证失败 |
| 1002 | Token 无效 |
| 1003 | Token 过期 |
| 1004 | 权限不足 |
| 2001 | 资源不存在 |
| 2002 | 资源已存在 |
| 3001 | 预约时段已满 |
| 3002 | 预约时间已过 |
| 3003 | 重复预约 |

---

**最后更新**: 2026-03-03  
**维护人**: 后端开发 / 架构师
