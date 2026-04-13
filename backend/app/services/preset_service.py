"""
预设服务层 - 业务逻辑
"""


class PresetService:
    """预设服务"""

    def __init__(self, db):
        self.gift_collection = db.gift_presets
        self.amount_collection = db.amount_presets

    # ============== 礼品预设 ==============

    async def list_gifts(self) -> list[dict]:
        """获取礼品预设列表"""
        presets = await self.gift_collection.find().to_list(length=1000)
        return [{"value": p["value"]} for p in presets]

    async def add_gift(self, value: str) -> dict:
        """添加礼品预设"""
        await self.gift_collection.insert_one({"value": value})
        return {"value": value}

    async def remove_gift(self, value: str) -> bool:
        """删除礼品预设"""
        result = await self.gift_collection.delete_one({"value": value})
        return result.deleted_count > 0

    async def gift_exists(self, value: str) -> bool:
        """检查礼品预设是否存在"""
        doc = await self.gift_collection.find_one({"value": value})
        return doc is not None

    # ============== 金额预设 ==============

    async def list_amounts(self) -> list[dict]:
        """获取金额预设列表"""
        presets = (
            await self.amount_collection.find()
            .sort("value", 1)
            .to_list(length=1000)
        )
        return [{"value": p["value"]} for p in presets]

    async def add_amount(self, value: int) -> dict:
        """添加金额预设"""
        await self.amount_collection.insert_one({"value": value})
        return {"value": value}

    async def remove_amount(self, value: int) -> bool:
        """删除金额预设"""
        result = await self.amount_collection.delete_one({"value": int(value)})
        return result.deleted_count > 0

    async def amount_exists(self, value: int) -> bool:
        """检查金额预设是否存在"""
        doc = await self.amount_collection.find_one({"value": value})
        return doc is not None
