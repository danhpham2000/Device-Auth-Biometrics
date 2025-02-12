from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base


URL_DATABASE = "postgresql://danhpham:David2022!pcd@localhost:5432/biometrics-auth"

engine = create_engine(URL_DATABASE)

SessionLocal = sessionmaker(autoflush=False, bind=engine)

Base = declarative_base()