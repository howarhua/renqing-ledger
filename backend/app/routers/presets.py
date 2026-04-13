"""
预设路由
"""
from fastapi import APIRouter, HTTPException, status

from app.database import get_database
from app.models.schemas import PresetValueRequest, PresetValueResponse
from app.services.preset_service import PresetService

router = APIRouter(prefix="/presets", tags=["预设"])


def _get_service() -> PresetService:
    return PresetService(get_database())


# ============== 礼品预设 ==============

@router.get("/gifts", response_model=list[PresetValueResponse])
async def list_gift_presets():
    """获取礼品预设列表"""
    service = _get_service()
    presets = await service.list_gifts()
    return [PresetValueResponse(**p) for p in presets]


@router.post(
    "/gifts",
    response_model=PresetValueResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_gift_preset(data: PresetValueRequest):
    """添加礼品预设"""
    service = _get_service()
    value = str(data.value)

    if await service.gift_exists(value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="预设已存在",
        )

    result = await service.add_gift(value)
    return PresetValueResponse(**result)


@router.delete("/gifts/{value}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gift_preset(value: str):
    """删除礼品预设"""
    service = _get_service()
    if not await service.remove_gift(value):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="预设不存在",
        )


# ============== 金额预设 ==============

@router.get("/amounts", response_model=list[PresetValueResponse])
async def list_amount_presets():
    """获取金额预设列表"""
    service = _get_service()
    presets = await service.list_amounts()
    return [PresetValueResponse(**p) for p in presets]


@router.post(
    "/amounts",
    response_model=PresetValueResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_amount_preset(data: PresetValueRequest):
    """添加金额预设"""
    service = _get_service()
    value = int(data.value)

    if value <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="金额必须大于0",
        )

    if await service.amount_exists(value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="预设已存在",
        )

    result = await service.add_amount(value)
    return PresetValueResponse(**result)


@router.delete("/amounts/{value}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_amount_preset(value: int):
    """删除金额预设"""
    service = _get_service()
    if not await service.remove_amount(value):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="预设不存在",
        )
