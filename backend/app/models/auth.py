"""
用户认证相关 Pydantic Schemas
"""
from typing import Optional

from pydantic import BaseModel, Field


class UserRegisterRequest(BaseModel):
    """用户注册请求"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)


class UserLoginRequest(BaseModel):
    """用户登录请求"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)


class UserResponse(BaseModel):
    """用户响应"""
    id: str
    username: str
    phone: Optional[str] = None
    created_at: str
    last_login_at: Optional[str] = None


class TokenResponse(BaseModel):
    """Token 响应"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UpdateUserRequest(BaseModel):
    """更新用户信息请求"""
    phone: Optional[str] = Field(None, min_length=11, max_length=11)


class ChangePasswordRequest(BaseModel):
    """修改密码请求"""
    old_password: str = Field(..., min_length=6, max_length=100)
    new_password: str = Field(..., min_length=6, max_length=100)
