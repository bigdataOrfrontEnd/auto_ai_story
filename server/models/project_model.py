# models/project_model.py
from pydantic import BaseModel
from typing import List

class ScriptRequest(BaseModel):
    content: str