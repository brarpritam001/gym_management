"""Trainer service."""

from typing import Optional
from fastapi import HTTPException
from sqlmodel import Session
from app.models.trainer import Trainer
from app.repositories.trainer_repo import TrainerRepository
from app.schemas.trainer import TrainerCreate, TrainerUpdate, TrainerResponse
from app.services.notification_service import NotificationService


class TrainerService:
    def __init__(self, session: Session, gym_id: Optional[int] = None):
        self.repo = TrainerRepository(session, gym_id)
        self.notifications = NotificationService(session, gym_id)

    def list_trainers(self) -> list[TrainerResponse]:
        return [TrainerResponse.model_validate(t, from_attributes=True) for t in self.repo.get_all()]

    def get_trainer(self, trainer_id: int) -> TrainerResponse:
        t = self.repo.get_by_id(trainer_id)
        if not t:
            raise HTTPException(status_code=404, detail="Trainer not found")
        return TrainerResponse.model_validate(t, from_attributes=True)

    def create_trainer(self, data: TrainerCreate) -> TrainerResponse:
        trainer = Trainer(**data.model_dump())
        trainer = self.repo.create(trainer)
        self.notifications.trainer_assigned(trainer.full_name, trainer.id)
        return TrainerResponse.model_validate(trainer, from_attributes=True)

    def update_trainer(self, trainer_id: int, data: TrainerUpdate) -> TrainerResponse:
        t = self.repo.get_by_id(trainer_id)
        if not t:
            raise HTTPException(status_code=404, detail="Trainer not found")
        t = self.repo.update(t, data.model_dump(exclude_unset=True))
        return TrainerResponse.model_validate(t, from_attributes=True)

    def delete_trainer(self, trainer_id: int) -> dict:
        t = self.repo.get_by_id(trainer_id)
        if not t:
            raise HTTPException(status_code=404, detail="Trainer not found")
        self.repo.delete(t)
        return {"detail": "Trainer deleted"}
