"""Trainer routes."""

from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database.session import get_session
from app.services.trainer_service import TrainerService
from app.schemas.trainer import TrainerCreate, TrainerUpdate, TrainerResponse
from app.core.dependencies import get_current_user, get_current_gym_id

router = APIRouter(prefix="/trainers", tags=["Trainers"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=list[TrainerResponse])
def list_trainers(session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return TrainerService(session, gym_id).list_trainers()


@router.get("/{trainer_id}", response_model=TrainerResponse)
def get_trainer(trainer_id: int, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return TrainerService(session, gym_id).get_trainer(trainer_id)


@router.post("/", response_model=TrainerResponse)
def create_trainer(data: TrainerCreate, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return TrainerService(session, gym_id).create_trainer(data)


@router.put("/{trainer_id}", response_model=TrainerResponse)
def update_trainer(trainer_id: int, data: TrainerUpdate, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return TrainerService(session, gym_id).update_trainer(trainer_id, data)


@router.delete("/{trainer_id}")
def delete_trainer(trainer_id: int, session: Session = Depends(get_session), gym_id: int = Depends(get_current_gym_id)):
    return TrainerService(session, gym_id).delete_trainer(trainer_id)
