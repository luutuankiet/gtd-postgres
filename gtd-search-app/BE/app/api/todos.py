from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from sqlmodel import Session, select

from app.database import get_db, engine
from app.models.todo import Todo, TodoSearch

router = APIRouter()

@router.get("/todos/search", response_model=List[Todo])
def search_todos(
    search_params: TodoSearch = Depends(),
    db: Session = Depends(get_db)
):
    # If we have a text search query, use the raw SQL approach
    if search_params.query:
        # Start with a base query
        query = """
        SELECT * FROM prod.fact_todos
        WHERE 1=1
        """
        params = {}
        
        # Add text search
        query += """
        AND search @@ websearch_to_tsquery('english', :query)
        ORDER BY ts_rank(search, websearch_to_tsquery('english', :query)) DESC
        """
        params["query"] = search_params.query
        
        # Add other filters
        if search_params.list_name:
            query += " AND todo_list_name = :list_name"
            params["list_name"] = search_params.list_name
        
        if search_params.folder_name:
            query += " AND todo_folder_name = :folder_name"
            params["folder_name"] = search_params.folder_name
        
        if search_params.status:
            query += " AND status_id = :status"
            params["status"] = search_params.status
        
        if search_params.completed is not None:
            query += " AND todo_status = :completed"
            params["completed"] = "1" if search_params.completed else "0"
        
        # Add pagination
        query += " LIMIT :limit OFFSET :offset"
        params["limit"] = search_params.page_size
        params["offset"] = (search_params.page - 1) * search_params.page_size
        
        from sqlalchemy import text
        result = db.execute(text(query), params).fetchall()
        
        # Convert to Todo objects
        todos = []
        for row in result:
            todo_dict = dict(row._mapping)
            todos.append(Todo.model_validate(todo_dict))
        
        return todos
    
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
    with Session(engine) as session:
        statement = select(Todo).where(Todo.todo_id == todo_id)
        result = session.exec(statement).first()
    
        if not result:
            raise HTTPException(status_code=404, detail="Todo not found")
    
        return result