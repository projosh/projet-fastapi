from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
import re

class LogEntry(BaseModel):
    timestamp: str = Field(..., description="Timestamp in ISO 8601 format")
    level: str = Field(..., description="Log level")
    message: str = Field(..., description="Log message")
    service: str = Field(..., description="Service name")
    
    @validator('level')
    def validate_level(cls, v):
        valid_levels = ["INFO", "WARNING", "ERROR", "DEBUG"]
        if v not in valid_levels:
            raise ValueError(f"Level must be one of {valid_levels}")
        return v
    
    @validator('timestamp')
    def validate_timestamp(cls, v):
        try:
            datetime.fromisoformat(v.replace('Z', '+00:00'))
        except ValueError:
            raise ValueError("Timestamp must be in ISO 8601 format")
        return v

class LogResponse(BaseModel):
    id: str
    timestamp: str
    level: str
    message: str
    service: str

class LogSearchParams(BaseModel):
    q: Optional[str] = None
    level: Optional[str] = None
    service: Optional[str] = None
    size: Optional[int] = 20
    from_: Optional[int] = Field(default=0, alias="from")

class LogSearchResponse(BaseModel):
    logs: List[LogResponse]
    total: int
    took: int