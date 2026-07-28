CREATE TABLE sources (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  type ENUM('rss','api','manual','sports_data') NOT NULL,
  feed_url VARCHAR(500) NULL,
  api_endpoint VARCHAR(500) NULL,
  trust_score TINYINT UNSIGNED NOT NULL DEFAULT 50,
  allow_fetch TINYINT(1) NOT NULL DEFAULT 1,
  allow_translate TINYINT(1) NOT NULL DEFAULT 1,
  allow_display TINYINT(1) NOT NULL DEFAULT 1,
  status ENUM('active','paused','error') NOT NULL DEFAULT 'active',
  notes TEXT NULL,
  created_at INT UNSIGNED NOT NULL,
  updated_at INT UNSIGNED NOT NULL,
  UNIQUE KEY uq_sources_slug (slug),
  KEY idx_sources_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE raw_articles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  source_id BIGINT UNSIGNED NOT NULL,
  original_url VARCHAR(700) NOT NULL,
  url_hash CHAR(64) NOT NULL,
  title_raw VARCHAR(700) NOT NULL,
  body_raw MEDIUMTEXT NULL,
  content_hash CHAR(64) NULL,
  published_at INT UNSIGNED NULL,
  fetch_status ENUM('fetched','duplicate','failed') NOT NULL DEFAULT 'fetched',
  created_at INT UNSIGNED NOT NULL,
  UNIQUE KEY uq_raw_articles_url_hash (url_hash),
  KEY idx_raw_articles_source (source_id),
  KEY idx_raw_articles_content_hash (content_hash),
  CONSTRAINT fk_raw_articles_source FOREIGN KEY (source_id) REFERENCES sources(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL,
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE articles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(220) NOT NULL,
  title_th VARCHAR(500) NOT NULL,
  summary_th TEXT NOT NULL,
  body_th MEDIUMTEXT NOT NULL,
  category_id BIGINT UNSIGNED NULL,
  status ENUM('draft','pending_review','published','rejected') NOT NULL DEFAULT 'draft',
  published_at INT UNSIGNED NULL,
  seo_title VARCHAR(500) NULL,
  seo_description VARCHAR(700) NULL,
  og_image_url VARCHAR(700) NULL,
  created_at INT UNSIGNED NOT NULL,
  updated_at INT UNSIGNED NOT NULL,
  UNIQUE KEY uq_articles_slug (slug),
  KEY idx_articles_status_published (status, published_at),
  KEY idx_articles_category (category_id),
  CONSTRAINT fk_articles_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE article_sources (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  article_id BIGINT UNSIGNED NOT NULL,
  source_id BIGINT UNSIGNED NOT NULL,
  original_url VARCHAR(700) NOT NULL,
  source_credit_text VARCHAR(700) NOT NULL,
  KEY idx_article_sources_article (article_id),
  KEY idx_article_sources_source (source_id),
  CONSTRAINT fk_article_sources_article FOREIGN KEY (article_id) REFERENCES articles(id),
  CONSTRAINT fk_article_sources_source FOREIGN KEY (source_id) REFERENCES sources(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
