from sqlmodel import SQLModel, Field
from typing import Optional, List
from pydantic import BaseModel, computed_field
from datetime import datetime
import re

# Basic Todo model for responses
class Todo(SQLModel, table=True):
    __tablename__ = "fact_todos"
    __table_args__ = {"schema": "prod"}
    todo_id: str = Field(primary_key=True)
    todo_title: str
    todo_content: Optional[str] = None
    todo_list_name: Optional[str] = None
    todo_folder_name: Optional[str] = None
    todo_status: Optional[str] = None
    todo_duedate: Optional[datetime] = None
    todo_tags: Optional[str]
    


    @computed_field
    @property
    def todo_tags_list(self) -> list:
        matches = re.findall(r"'([^']*)'", self.todo_tags)
        return matches
       

# Search parameters model
class TodoSearch(SQLModel):
    query: Optional[str] = None
    list_name: Optional[str] = None
    folder_name: Optional[str] = None
    status: Optional[str] = None
    completed: Optional[bool] = None
    page: int = 1
    page_size: int = 20
    status: Optional[str] = None