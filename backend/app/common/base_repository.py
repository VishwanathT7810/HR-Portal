from typing import Any, Dict, Generic, List, Optional, Sequence, Tuple, Type, TypeVar

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    model: Type[ModelType]

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, entity_id: Any) -> Optional[ModelType]:
        return self.db.get(self.model, entity_id)

    def list(self, *, skip: int = 0, limit: int = 100) -> List[ModelType]:
        stmt = select(self.model)
        if hasattr(self.model, "created_at"):
            stmt = stmt.order_by(self.model.created_at.desc())
        elif hasattr(self.model, "id"):
            stmt = stmt.order_by(self.model.id.desc())
        stmt = stmt.offset(skip).limit(limit)
        return list(self.db.scalars(stmt).all())

    def create(self, obj_in: Dict[str, Any]) -> ModelType:
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        self.db.flush()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: ModelType, obj_in: Dict[str, Any]) -> ModelType:
        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        self.db.flush()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, db_obj: ModelType) -> None:
        self.db.delete(db_obj)
        self.db.flush()

    def count(self) -> int:
        stmt = select(func.count()).select_from(self.model)
        result = self.db.execute(stmt).scalar_one()
        return int(result or 0)

    def paginate(self, *, page: int = 1, size: int = 20) -> Tuple[List[ModelType], int, int]:
        page = max(page, 1)
        size = max(min(size, 200), 1)
        total = self.count()
        total_pages = (total + size - 1) // size if total > 0 else 0
        skip = (page - 1) * size
        items = self.list(skip=skip, limit=size)
        return items, total, total_pages
