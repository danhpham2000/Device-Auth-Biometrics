from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Annotated
from models import AuthUser
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder



app = FastAPI()
models.Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:5173" 
]

app.add_middleware(
    CORSMiddleware, 
    allow_origins=origins, 
    allow_methods=["*"], 
    allow_headers=["*"], 
    allow_credentials=True)

class AuthUserBase(BaseModel):
    email: str
    deviceID: str
    tokenExpires: datetime


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]


@app.post("/register")
async def registerEmail(authUser: AuthUserBase, db: db_dependency):
    existingUser = db.query(AuthUser).filter(AuthUser.email == authUser.email).first()

    if existingUser:
        if datetime.now() > existingUser.tokenExpires:
            existingUser.tokenExpires = datetime.now() + timedelta(minutes=3)

            db.commit()
            db.refresh(existingUser)
        return "Updated user"
    
    newUser = models.AuthUser(
        email=authUser.email, 
        deviceID=authUser.deviceID,
        tokenExpires=authUser.tokenExpires + timedelta(minutes=3))
    
    db.add(newUser)
    db.commit()
    db.refresh(newUser)
    return newUser



class LoginRequest(BaseModel):
    email: str
    deviceID: str


@app.post("/login")
async def loginEmail(request: LoginRequest, db: db_dependency):
    if request.email == None:
        return "error"
    if request.deviceID == None:
        return "error"
    
    existingUser = db.query(AuthUser).filter(AuthUser.email == request.email).first()

    if not existingUser:
        return HTTPException(status_code=404, detail="Email not found")

    if request.deviceID != existingUser.deviceID:
        return HTTPException(status_code=401, detail="Unauthorized device")
    
    if datetime.now() < existingUser.tokenExpires:
        return JSONResponse(content="grant access")
    else:
        return HTTPException(status_code=401, detail=JSONResponse(content="access denied because your token is expired"))
    
    
    

    
