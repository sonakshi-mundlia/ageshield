from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):

    company_name: str = Field(
        min_length=2,
        max_length=200,
    )

    name: str = Field(
        min_length=2,
        max_length=200,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
    )


class LoginRequest(BaseModel):

    email: EmailStr

    password: str = Field(
        min_length=1,
        max_length=128,
    )


class LoginResponse(BaseModel):

    access_token: str

    token_type: str = "bearer"

    user_id: int

    company_id: int

    name: str

    email: str

    role: str