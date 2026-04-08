"""
数据模型 - Pydantic Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ============== 宴会模型 ==============

class BanquetCreate(BaseModel):
    """创建宴会请求"""
    name: str = Field(..., min_length=1, max_length=100)
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    location: str = Field(default="")
    type: str = Field(
        ...,
        pattern="^(婚礼|满月宴|乔迁宴|寿宴|升学宴|其他)$"
    )


class BanquetUpdate(BaseModel):
    """更新宴会请求"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    date: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    location: Optional[str] = None
    type: Optional[str] = Field(
        None,
        pattern="^(婚礼|满月宴|乔迁宴|寿宴|升学宴|其他)$"
    )


class BanquetResponse(BaseModel):
    """宴会响应"""
    id: str
    name: str
    date: str
    location: str
    type: str
    frozen: bool
    created_at: str
    deleted_at: Optional[str] = None


# ============== 礼金记录模型 ==============

class GiftRecordCreate(BaseModel):
    """创建礼金记录请求"""
    guest_name: str = Field(..., min_length=1, max_length=50)
    amount: int = Field(..., ge=0)
    gifts: list[str] = Field(default_factory=list)
    note: str = Field(default="")


class GiftRecordUpdate(BaseModel):
    """更新礼金记录请求"""
    guest_name: Optional[str] = Field(None, min_length=1, max_length=50)
    amount: Optional[int] = Field(None, ge=0)
    gifts: Optional[list[str]] = None
    note: Optional[str] = None


class GiftRecordResponse(BaseModel):
    """礼金记录响应"""
    id: str
    banquet_id: str
    guest_name: str
    amount: int
    gifts: list[str]
    note: str
    created_at: str
    deleted_at: Optional[str] = None


# ============== 预设模型 ==============

class PresetValueRequest(BaseModel):
    """预设值请求"""
    value: str | int


class PresetValueResponse(BaseModel):
    """预设值响应"""
    value: str | int


# ============== 统计模型 ==============

class StatisticsResponse(BaseModel):
    """统计数据响应"""
    total_amount: int
    guest_count: int
    avg_amount: int
    gift_types_count: int
    top_guests: list[dict]
    gift_stats: list[dict]
