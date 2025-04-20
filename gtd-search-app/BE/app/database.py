from sqlmodel import SQLModel, Field, Session, create_engine
from typing import Generator
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/ticktick_db")

engine = create_engine(DATABASE_URL)

# Function to get DB session
def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        try: 
            yield session
        finally:
            session.close()