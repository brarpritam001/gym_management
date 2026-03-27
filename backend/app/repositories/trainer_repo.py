"""Trainer repository."""

from typing import Optional
from sqlmodel import Session, select
from app.models.trainer import Trainer


class TrainerRepository:
    def __init__(self, session: Session, gym_id: Optional[int] = None):
        self.session = session
        self.gym_id = gym_id

    def _base_query(self):
        stmt = select(Trainer)
        if self.gym_id is not None:
            stmt = stmt.where(Trainer.gym_id == self.gym_id)
        return stmt

    def get_all(self) -> list[Trainer]:
        return list(self.session.exec(self._base_query()).all())

    def get_by_id(self, trainer_id: int) -> Optional[Trainer]:
        trainer = self.session.get(Trainer, trainer_id)
        if trainer and self.gym_id is not None and trainer.gym_id != self.gym_id:
            return None
        return trainer

    def create(self, trainer: Trainer) -> Trainer:
        if self.gym_id is not None:
            trainer.gym_id = self.gym_id
        self.session.add(trainer)
        self.session.commit()
        self.session.refresh(trainer)
        return trainer

    def update(self, trainer: Trainer, data: dict) -> Trainer:
        for key, value in data.items():
            if value is not None:
                setattr(trainer, key, value)
        self.session.add(trainer)
        self.session.commit()
        self.session.refresh(trainer)
        return trainer

    def delete(self, trainer: Trainer) -> None:
        self.session.delete(trainer)
        self.session.commit()

    def count_active(self) -> int:
        stmt = self._base_query().where(Trainer.is_active == True)
        return len(self.session.exec(stmt).all())
