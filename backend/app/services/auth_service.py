"""
认证服务层
"""
from datetime import datetime, timedelta
from typing import Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from passlib.context import CryptContext
from jose import JWTError, jwt

from app.config import settings

# 密码哈希上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT 配置
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 7  # 7 天过期


def hash_password(password: str) -> str:
    """哈希密码"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    """创建 JWT Token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """解码 JWT Token"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def doc_to_user(doc: dict) -> dict:
    """将 MongoDB 文档转换为用户响应"""
    created_at = doc.get("created_at")
    if isinstance(created_at, datetime):
        created_at = created_at.isoformat()
    last_login_at = doc.get("last_login_at")
    if isinstance(last_login_at, datetime):
        last_login_at = last_login_at.isoformat()
    return {
        "id": str(doc["_id"]),
        "username": doc["username"],
        "phone": doc.get("phone"),
        "created_at": created_at,
        "last_login_at": last_login_at,
    }


class AuthService:
    """认证服务"""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.users

    @staticmethod
    def get_collection(db: AsyncIOMotorDatabase):
        return db.users

    async def register(self, username: str, password: str) -> dict | None:
        """注册用户"""
        # 检查用户名是否已存在
        existing = await self.collection.find_one({"username": username})
        if existing:
            return None

        # 创建用户
        doc = {
            "username": username,
            "password_hash": hash_password(password),
            "created_at": datetime.utcnow(),
        }
        result = await self.collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc_to_user(doc)

    async def login(self, username: str, password: str) -> Optional[dict]:
        """登录用户，返回 Token 响应"""
        user = await self.collection.find_one({"username": username})
        if not user:
            return None

        if not verify_password(password, user["password_hash"]):
            return None

        # 更新最近登录时间
        await self.collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login_at": datetime.utcnow()}}
        )
        user["last_login_at"] = datetime.utcnow()

        # 创建 Token
        token = create_access_token({"sub": str(user["_id"]), "username": username})

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": doc_to_user(user),
        }

    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """通过 ID 获取用户"""
        if not ObjectId.is_valid(user_id):
            return None
        doc = await self.collection.find_one({"_id": ObjectId(user_id)})
        return doc_to_user(doc) if doc else None

    async def get_user_from_token(self, token: str) -> Optional[dict]:
        """从 Token 获取用户"""
        payload = decode_access_token(token)
        if not payload:
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
        return await self.get_user_by_id(user_id)

    async def update_user(self, user_id: str, phone: Optional[str] = None) -> Optional[dict]:
        """更新用户信息"""
        if not ObjectId.is_valid(user_id):
            return None
        update_data = {}
        if phone is not None:
            update_data["phone"] = phone
        if not update_data:
            return await self.get_user_by_id(user_id)
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": update_data},
            return_document=True
        )
        return doc_to_user(result) if result else None

    async def change_password(self, user_id: str, old_password: str, new_password: str) -> bool:
        """修改密码"""
        if not ObjectId.is_valid(user_id):
            return False
        user = await self.collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return False
        if not verify_password(old_password, user["password_hash"]):
            return False
        await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"password_hash": hash_password(new_password)}}
        )
        return True


def get_auth_service() -> AuthService:
    """获取 AuthService 实例"""
    from app.database import get_database
    return AuthService(get_database())