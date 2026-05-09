/*
    ECommerce Database - Schema and Seed Data
    Run this against your SQL Server / LocalDB instance.
    Compatible with: SQL Server 2017+, Azure SQL, LocalDB.
*/

IF DB_ID('ECommerceDb') IS NULL
BEGIN
    CREATE DATABASE ECommerceDb;
END
GO

USE ECommerceDb;
GO

-- Drop tables if they exist (for re-runs). Order matters: FK children first.
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
    StockQuantity  INT            NOT NULL DEFAULT 0
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

-- Seed products (inspired by automationexercise.com)
INSERT INTO dbo.Products (Name, Category, Brand, Price, Description, ImageUrl, StockQuantity) VALUES
('Blue Top',                    'Women', 'Polo',         500.00, 'Comfortable casual blue top for everyday wear.',                'https://automationexercise.com/get_product_picture/1',  50),
('Men Tshirt',                  'Men',   'H&M',          400.00, 'Classic men''s t-shirt in soft cotton.',                        'https://automationexercise.com/get_product_picture/2',  75),
('Sleeveless Dress',            'Women', 'Madame',       1000.00,'Elegant sleeveless dress for special occasions.',               'https://automationexercise.com/get_product_picture/3',  30),
('Stylish Dress',               'Women', 'Mast & Harbour',1500.00,'Trendy stylish dress with a modern cut.',                       'https://automationexercise.com/get_product_picture/4',  20),
('Winter Top',                  'Women', 'Allen Solly Junior',600.00,'Warm winter top, perfect for cold days.',                   'https://automationexercise.com/get_product_picture/5',  40),
('Summer White Top',            'Women', 'Kookie Kids',  400.00, 'Light and breezy white top for the summer.',                    'https://automationexercise.com/get_product_picture/6',  60),
('Madame Top For Women',        'Women', 'Madame',       1000.00,'Premium top from Madame, ideal for any occasion.',              'https://automationexercise.com/get_product_picture/7',  25),
('Fancy Green Top',             'Women', 'Babyhug',      700.00, 'Fancy green top with a unique pattern.',                        'https://automationexercise.com/get_product_picture/8',  35),
('Sleeves Printed Top - White', 'Women', 'Allen Solly Junior',400.00,'Printed top with elegant sleeve detail.',                   'https://automationexercise.com/get_product_picture/9',  45),
('Half Sleeves Top Schiffli Detailing - Pink','Women','Kookie Kids',600.00,'Pink top with delicate schiffli detail.',             'https://automationexercise.com/get_product_picture/10', 30),
('Frozen Tops For Kids',        'Kids',  'Kookie Kids',  500.00, 'Cute Frozen-themed tops for kids.',                             'https://automationexercise.com/get_product_picture/11', 80),
('Full Sleeves Top Cherry - Pink','Kids','Kookie Kids',  900.00, 'Pink full-sleeve top with cherry print.',                       'https://automationexercise.com/get_product_picture/12', 50),
('Printed Off Shoulder Top - White', 'Women','Mast & Harbour',1200.00,'Stylish off-shoulder printed top.',                        'https://automationexercise.com/get_product_picture/13', 18),
('Sleeves Top and Short - Blue & Pink','Kids','Kookie Kids',1000.00,'Matching sleeves top and short set for kids.',                'https://automationexercise.com/get_product_picture/14', 40),
('Cotton Mull Embroidered Dress','Women','Mast & Harbour',2500.00,'Beautiful embroidered cotton mull dress.',                     'https://automationexercise.com/get_product_picture/15', 12);
GO

PRINT 'Database initialized successfully.';
GO
