"""
礼金记录路由
"""
from fastapi import APIRouter, HTTPException, status

from app.database import get_database
from app.models.schemas import (
    GiftRecordCreate,
    GiftRecordUpdate,
    GiftRecordResponse,
    StatisticsResponse,
)
from app.services.banquet_service import BanquetService
from app.services.record_service import RecordService, StatisticsService

router = APIRouter(tags=["礼金记录"])


def _get_banquet_service() -> BanquetService:
    return BanquetService(get_database())


def _get_record_service() -> RecordService:
    return RecordService(get_database())


def _get_stats_service() -> StatisticsService:
    return StatisticsService(get_database())


@router.get(
    "/banquets/{banquet_id}/records",
    response_model=list[GiftRecordResponse],
)
async def list_records(banquet_id: str):
    """获取宴会下的所有记录"""
    service = _get_record_service()
    return await service.list_by_banquet(banquet_id)


@router.post(
    "/banquets/{banquet_id}/records",
    response_model=GiftRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_record(banquet_id: str, data: GiftRecordCreate):
    """新增礼金记录"""
    banquet_service = _get_banquet_service()

    # 检查宴会是否存在
    if not await banquet_service.exists(banquet_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="宴会不存在",
        )

    # 检查宴会是否已归档
    if await banquet_service.is_frozen(banquet_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="宴会已归档，无法添加记录",
        )

    service = _get_record_service()
    return await service.create(banquet_id, data)


@router.put("/records/{record_id}", response_model=GiftRecordResponse)
async def update_record(record_id: str, data: GiftRecordUpdate):
    """更新记录"""
    record_service = _get_record_service()
    banquet_service = _get_banquet_service()

    # 检查记录是否存在
    record = await record_service.get(record_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="记录不存在",
        )

    # 检查宴会是否已归档
    if await banquet_service.is_frozen(record.banquet_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="宴会已归档，无法修改记录",
        )

    updated = await record_service.update(record_id, data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="没有需要更新的字段",
        )
    return updated


@router.delete("/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_record(record_id: str):
    """删除记录"""
    record_service = _get_record_service()
    banquet_service = _get_banquet_service()

    # 检查记录是否存在
    record = await record_service.get(record_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="记录不存在",
        )

    # 检查宴会是否已归档
    if await banquet_service.is_frozen(record.banquet_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="宴会已归档，无法删除记录",
        )

    await record_service.delete(record_id)


@router.get(
    "/banquets/{banquet_id}/statistics",
    response_model=StatisticsResponse,
)
async def get_statistics(banquet_id: str):
    """获取宴会统计数据"""
    service = _get_stats_service()
    return await service.get_banquet_stats(banquet_id)
