from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from sqlmodel import Session, select
from sqlalchemy import text


from app.database import get_db, engine
from app.models.todo import Todo, TodoSearch

router = APIRouter()

@router.get("/todos/search", response_model=List[Todo])
def search_todos(
    search_params: TodoSearch = Depends(),
    db: Session = Depends(get_db)
):
    # If we have a text search query, use SQLModel with text() for the search part
    if search_params.query:
        
        # Start building the query with SQLModel
        statement = select(Todo)
        
        # Add text search condition using text()
        search_condition = text("search @@ websearch_to_tsquery('english', :query)")
        statement = statement.where(search_condition)
        
        # Add other filters using SQLModel syntax
        if search_params.list_name:
            statement = statement.where(Todo.todo_list_name == search_params.list_name)
        
        if search_params.folder_name:
            statement = statement.where(Todo.todo_folder_name == search_params.folder_name)
        
        if search_params.status:
            statement = statement.where(Todo.todo_status == search_params.status)
        
        if search_params.completed is not None:
            completed_value = "1" if search_params.completed else "0"
            statement = statement.where(Todo.todo_status == completed_value)
        
        # Add ordering by rank using text()
        rank_order = text("ts_rank(search, websearch_to_tsquery('english', :query)) DESC")
        statement = statement.order_by(rank_order)
        
        # Add pagination
        statement = statement.offset((search_params.page - 1) * search_params.page_size)
        statement = statement.limit(search_params.page_size)
        
        # Execute the query with parameters
        params = {"query": search_params.query}
        results = db.exec(statement.params(**params)).all()
        
        return list(results)
    
    # If no text search, use SQLModel's ORM approach
    else:
        query = select(Todo)
        
        # Add filters
        if search_params.list_name:
            query = query.where(Todo.todo_list_name == search_params.list_name)
        
        if search_params.folder_name:
            query = query.where(Todo.todo_folder_name == search_params.folder_name)
        
        if search_params.status:
            query = query.where(Todo.todo_status == search_params.status)
        
        if search_params.completed is not None:
            completed_value = "1" if search_params.completed else "0"
            query = query.where(Todo.todo_status == completed_value)
        
        # Add pagination
        query = query.offset((search_params.page - 1) * search_params.page_size)
        query = query.limit(search_params.page_size)
        
        # Execute the query
        results = db.exec(query).all()
        
        return list(results)

@router.get("/todos/{todo_id}", response_model=Todo)
def get_todo(todo_id: str, db: Session = Depends(get_db)):
    statement = select(Todo).where(Todo.todo_id == todo_id)
    result = db.exec(statement).first()

    if not result:
        raise HTTPException(status_code=404, detail="Todo not found")

    return result