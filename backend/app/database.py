"""
MongoDB 数据库连接
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import AsyncGenerator
from typing import Optional

from app.config import settings


class Database:
    """数据库单例"""

    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None


db_instance = Database()


async def connect_to_mongo():
    """连接 MongoDB"""
    db_instance.client = AsyncIOMotorClient(settings.mongodb_uri)
    db_instance.db = db_instance.client[settings.database_name]

    # 创建索引
    await db_instance.db.banquets.create_index("created_at")
    await db_instance.db.gift_records.create_index("banquet_id")
    await db_instance.db.gift_records.create_index("created_at")


async def close_mongo_connection():
    """关闭 MongoDB 连接"""
    if db_instance.client:
        db_instance.client.close()


def get_database() -> AsyncIOMotorDatabase:
    """获取数据库实例"""
    if db_instance.db is None:
        raise RuntimeError("Database not initialized")
    return db_instance.db


async def lifespan_manager(app) -> AsyncGenerator[None, None]:
    """应用生命周期管理"""
    await connect_to_mongo()
    yield
    await close_mongo_connection()
