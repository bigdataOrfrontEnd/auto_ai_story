# models/project_model.py
from pydantic import BaseModel
from typing import Optional
class ScriptRequest(BaseModel):
    story: str
    projectId: Optional[str] = None