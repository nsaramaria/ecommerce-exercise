/*
    ECommerce Database - Schema and Seed Data
    Run this against your SQL Server / LocalDB instance.
*/

IF DB_ID('ECommerceDb') IS NULL
BEGIN
    CREATE DATABASE ECommerceDb;
END
GO

USE ECommerceDb;
GO

IF OBJECT_ID('dbo.OrderItems', 'U') IS NOT NULL DROP TABLE dbo.OrderItems;
IF OBJECT_ID('dbo.Orders',     'U') IS NOT NULL DROP TABLE dbo.Orders;
IF OBJECT_ID('dbo.Products',   'U') IS NOT NULL DROP TABLE dbo.Products;
IF OBJECT_ID('dbo.Users',      'U') IS NOT NULL DROP TABLE dbo.Users;
GO

CREATE TABLE dbo.Users (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    Email         NVARCHAR(256) NOT NULL UNIQUE,
    PasswordHash  NVARCHAR(512) NOT NULL,
    FirstName     NVARCHAR(100) NOT NULL,
    LastName      NVARCHAR(100) NOT NULL,
    CreatedAt     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.Products (
    Id             INT IDENTITY(1,1) PRIMARY KEY,
    Name           NVARCHAR(200)  NOT NULL,
    Category       NVARCHAR(100)  NOT NULL,
    Brand          NVARCHAR(100)  NOT NULL,
    Price          DECIMAL(10, 2) NOT NULL,
    Description    NVARCHAR(1000) NOT NULL,
    ImageUrl       NVARCHAR(500)  NOT NULL,
    StockQuantity  INT            NOT NULL DEFAULT 0,
    TubeColor      NVARCHAR(20)   NOT NULL DEFAULT '#D4A89B',
    CardBgColor    NVARCHAR(20)   NOT NULL DEFAULT '#EFD9CC'
);
GO

CREATE TABLE dbo.Orders (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    UserId          INT            NOT NULL,
    OrderDate       DATETIME2      NOT NULL,
    TotalAmount     DECIMAL(12, 2) NOT NULL,
    ShippingAddress NVARCHAR(500)  NOT NULL,
    City            NVARCHAR(100)  NOT NULL,
    Country         NVARCHAR(100)  NOT NULL,
    ZipCode         NVARCHAR(20)   NOT NULL,
    Status          NVARCHAR(50)   NOT NULL DEFAULT 'Pending',
    CONSTRAINT FK_Orders_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
);
GO

CREATE TABLE dbo.OrderItems (
    Id           INT IDENTITY(1,1) PRIMARY KEY,
    OrderId      INT            NOT NULL,
    ProductId    INT            NOT NULL,
    ProductName  NVARCHAR(200)  NOT NULL,
    Quantity     INT            NOT NULL,
    UnitPrice    DECIMAL(10, 2) NOT NULL,
    CONSTRAINT FK_OrderItems_Orders   FOREIGN KEY (OrderId)   REFERENCES dbo.Orders(Id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id)
);
GO

CREATE INDEX IX_Orders_UserId ON dbo.Orders(UserId);
CREATE INDEX IX_OrderItems_OrderId ON dbo.OrderItems(OrderId);
GO

-- Seed: 5 peptide lip tints
INSERT INTO dbo.Products (Name, Category, Brand, Price, Description, ImageUrl, StockQuantity, TubeColor, CardBgColor) VALUES
('Vanilla Glaze',    'Lip Tint', 'glow', 18.00, 'warm, sweet, soft',     '/assets/products/vanilla.png',    100, '#D4A89B', '#EFD9CC'),
('Strawberry Glaze', 'Lip Tint', 'glow', 18.00, 'juicy, fresh, dreamy',  '/assets/products/strawberry.png', 100, '#F4C4C9', '#F8DEE0'),
('Espresso Glaze',   'Lip Tint', 'glow', 18.00, 'cozy, rich, smooth',    '/assets/products/espresso.png',   100, '#6B4538', '#A88A7A'),
('Raspberry Jelly',  'Lip Tint', 'glow', 18.00, 'bold, bright, playful', '/assets/products/raspberry.png',  100, '#B85970', '#D88FA0'),
('Lavender Mist',    'Lip Tint', 'glow', 18.00, 'soft, dreamy, sheer',   '/assets/products/lavender.png',   100, '#E8B8D4', '#F2D2E2');
GO

PRINT 'Database initialized successfully.';
GO
