CREATE DATABASE ChatbotDB

USE ChatbotDB

--ChatHistory Schema (Stores the chat history along with scores for all users)
CREATE TABLE ChatHistory (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId VARCHAR(100),
    UserMessage TEXT,
    BotResponse TEXT,
    DistressScore FLOAT,
    AvgDistress FLOAT,
    Timestamp DATETIME DEFAULT GETDATE()
)
SELECT * FROM ChatHistory

--Users Schema (Stores user information for Login)
CREATE TABLE Users (
    UserId VARCHAR(100) PRIMARY KEY,
    PasswordHash VARCHAR(256)
)
INSERT INTO Users (UserId, PasswordHash)
VALUES ('doe@gmail.come', 'Password')
SELECT * FROM Users