#!/bin/bash
# 人情簿后端启动脚本

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 激活虚拟环境
if [ -d ".venv" ]; then
    source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate 2>/dev/null
fi

# 启动服务
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
