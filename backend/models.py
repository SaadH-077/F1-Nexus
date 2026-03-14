from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(String, unique=True, index=True) # e.g. "max_verstappen"
    permanent_number = Column(Integer, nullable=True)
    code = Column(String, index=True) # e.g. "VER"
    first_name = Column(String)
    last_name = Column(String)
    nationality = Column(String)

class Constructor(Base):
    __tablename__ = "constructors"

    id = Column(Integer, primary_key=True, index=True)
    constructor_id = Column(String, unique=True, index=True) # e.g. "red_bull"
    name = Column(String, index=True)
    nationality = Column(String)

class Race(Base):
    __tablename__ = "races"

    id = Column(Integer, primary_key=True, index=True)
    season = Column(Integer, index=True)
    round = Column(Integer, index=True)
    race_name = Column(String)
    circuit_name = Column(String)
    date = Column(DateTime)
    
class RaceResult(Base):
    __tablename__ = "race_results"

    id = Column(Integer, primary_key=True, index=True)
    race_id = Column(Integer, ForeignKey("races.id"))
    driver_id = Column(Integer, ForeignKey("drivers.id"))
    constructor_id = Column(Integer, ForeignKey("constructors.id"))

    number = Column(Integer)
    position = Column(Integer)
    points = Column(Float)
    grid = Column(Integer)
    laps = Column(Integer)
    status = Column(String)
    time_str = Column(String) # For display "+0.725s"

    # Relationships
    race = relationship("Race")
    driver = relationship("Driver")
    constructor = relationship("Constructor")


class Subscriber(Base):
    __tablename__ = "subscribers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    subscribed_at = Column(DateTime, default=datetime.datetime.utcnow)
