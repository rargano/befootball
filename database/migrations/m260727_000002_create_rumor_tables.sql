CREATE TABLE rumor_sources (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  platform ENUM('x','rss','api','manual','official') NOT NULL,
  handle VARCHAR(180) NULL,
  trust_score TINYINT UNSIGNED NOT NULL DEFAULT 50,
  historical_accuracy TINYINT UNSIGNED NOT NULL DEFAULT 50,
  status ENUM('active','paused','blocked') NOT NULL DEFAULT 'active',
  created_at INT UNSIGNED NOT NULL,
  updated_at INT UNSIGNED NOT NULL,
  KEY idx_rumor_sources_platform (platform),
  KEY idx_rumor_sources_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE raw_social_posts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rumor_source_id BIGINT UNSIGNED NOT NULL,
  platform_post_id VARCHAR(220) NOT NULL,
  post_url VARCHAR(700) NOT NULL,
  text_raw TEXT NOT NULL,
  engagement_count INT UNSIGNED NOT NULL DEFAULT 0,
  posted_at INT UNSIGNED NOT NULL,
  created_at INT UNSIGNED NOT NULL,
  UNIQUE KEY uq_raw_social_posts_platform_post (platform_post_id),
  KEY idx_raw_social_posts_source (rumor_source_id),
  KEY idx_raw_social_posts_posted (posted_at),
  CONSTRAINT fk_raw_social_posts_source FOREIGN KEY (rumor_source_id) REFERENCES rumor_sources(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rumors (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(220) NOT NULL,
  title_th VARCHAR(500) NOT NULL,
  summary_th TEXT NOT NULL,
  status ENUM('new','monitoring','heating_up','reliable','confirmed','denied','expired','fake','duplicate') NOT NULL DEFAULT 'new',
  confidence_score TINYINT UNSIGNED NOT NULL DEFAULT 0,
  heat_score TINYINT UNSIGNED NOT NULL DEFAULT 0,
  disclaimer VARCHAR(700) NOT NULL,
  published_at INT UNSIGNED NULL,
  created_at INT UNSIGNED NOT NULL,
  updated_at INT UNSIGNED NOT NULL,
  UNIQUE KEY uq_rumors_slug (slug),
  KEY idx_rumors_status (status),
  KEY idx_rumors_confidence (confidence_score),
  KEY idx_rumors_heat (heat_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rumor_posts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rumor_id BIGINT UNSIGNED NOT NULL,
  raw_social_post_id BIGINT UNSIGNED NOT NULL,
  relation_type ENUM('primary','supporting','contradicting') NOT NULL DEFAULT 'supporting',
  UNIQUE KEY uq_rumor_posts_pair (rumor_id, raw_social_post_id),
  CONSTRAINT fk_rumor_posts_rumor FOREIGN KEY (rumor_id) REFERENCES rumors(id),
  CONSTRAINT fk_rumor_posts_post FOREIGN KEY (raw_social_post_id) REFERENCES raw_social_posts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rumor_score_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rumor_id BIGINT UNSIGNED NOT NULL,
  confidence_score TINYINT UNSIGNED NOT NULL,
  heat_score TINYINT UNSIGNED NOT NULL,
  reason_json JSON NOT NULL,
  created_at INT UNSIGNED NOT NULL,
  KEY idx_rumor_score_logs_rumor (rumor_id),
  CONSTRAINT fk_rumor_score_logs_rumor FOREIGN KEY (rumor_id) REFERENCES rumors(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
