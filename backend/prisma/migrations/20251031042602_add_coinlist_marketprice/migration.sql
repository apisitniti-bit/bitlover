-- CreateTable
CREATE TABLE "CoinList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coinId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MarketPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coinId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currentPrice" REAL NOT NULL,
    "marketCap" REAL,
    "volume24h" REAL,
    "priceChange24h" REAL,
    "priceChangePerc24h" REAL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "CoinList_coinId_key" ON "CoinList"("coinId");

-- CreateIndex
CREATE INDEX "CoinList_coinId_idx" ON "CoinList"("coinId");

-- CreateIndex
CREATE INDEX "CoinList_symbol_idx" ON "CoinList"("symbol");

-- CreateIndex
CREATE INDEX "CoinList_isActive_idx" ON "CoinList"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "MarketPrice_coinId_key" ON "MarketPrice"("coinId");

-- CreateIndex
CREATE INDEX "MarketPrice_coinId_idx" ON "MarketPrice"("coinId");

-- CreateIndex
CREATE INDEX "MarketPrice_symbol_idx" ON "MarketPrice"("symbol");

-- CreateIndex
CREATE INDEX "MarketPrice_lastUpdated_idx" ON "MarketPrice"("lastUpdated");
