CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Theme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "creatorName" TEXT NOT NULL,
    "themeJson" TEXT NOT NULL,
    "category" TEXT,
    "previewData" TEXT,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ThemeLike" (
    "id" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "userToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ThemeLike_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ThemeView" (
    "id" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "userToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ThemeView_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "ThemeLike_themeId_userToken_key" ON "ThemeLike"("themeId", "userToken");
CREATE INDEX "ThemeLike_themeId_idx" ON "ThemeLike"("themeId");
CREATE UNIQUE INDEX "ThemeView_themeId_userToken_key" ON "ThemeView"("themeId", "userToken");
CREATE INDEX "ThemeView_themeId_idx" ON "ThemeView"("themeId");
