from pydantic import BaseModel, Field

class TicketCreateRequest(BaseModel):
    student_id: str = Field(alias="studentId")
    name: str
    email: str
    mobile: str
    category: str
    sub_category: str = Field(alias="subCategory")
    description: str 
    user_id: str = Field(alias="userId")   

class DemoRequest(BaseModel):
    student_id: str