from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from db import Base


class User(Base):
    """
    ORM model for `users` table
    """
    
    __tablename__ = "users"

    # Fields
    # pkey: unique id for each user
    uid = Column(Integer, primary_key=True, autoincrement=True)
    # user name
    name = Column(String, nullable=False)
    # plain text password for now 
    #TODO: changed to hashed
    password_text = Column(String, nullable=False)

    # Replationships
    # messages a user has sent
    sent_messages = relationship(
        "ChatHistory",
        foreign_keys="ChatHistory.sender_id",
        back_populates="sender",
    )
    # messages a user has received
    received_messages = relationship(
        "ChatHistory",
        foreign_keys="ChatHistory.receiver_id",
        back_populates="receiver",
    )


class ChatHistory(Base):
    """ORM model for the `chat_history` table."""
    __tablename__ = "chat_history"

    # Fields
    # pkey: unique id for each message
    message_id = Column(Integer, primary_key=True, autoincrement=True)
    # original message text
    message = Column(Text, nullable=False)
    # translated message text (optional)
    translation = Column(Text)
    # fkey: who sends this message
    sender_id = Column(Integer, ForeignKey("users.uid"), nullable=False)
    # fkey: who receives this message
    receiver_id = Column(Integer, ForeignKey("users.uid"), nullable=False)

    # Relationships
    sender = relationship(
        "User",
        foreign_keys=[sender_id],
        back_populates="sent_messages",
    )
    receiver = relationship(
        "User",
        foreign_keys=[receiver_id],
        back_populates="received_messages",
    )
