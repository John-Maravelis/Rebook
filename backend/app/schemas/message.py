from pydantic import BaseModel


class MessageCreate(BaseModel):
    content: str


class MessageOut(BaseModel):
    id: int
    proposal_id: int
    sender_id: int
    content: str

    class Config:
        from_attributes = True
