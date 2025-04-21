CREATE DATABASE ChatbotDB

USE ChatbotDB

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