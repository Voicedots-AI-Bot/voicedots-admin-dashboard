from pydantic import BaseModel, EmailStr

class TicketCreateRequest(BaseModel):
    name: str
    email: EmailStr
    mobile: str
    category: str
    sub_category: str
    description: str    