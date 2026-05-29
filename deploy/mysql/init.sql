SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'admin',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'blog'@'localhost' IDENTIFIED BY 'blog_password';
GRANT ALL PRIVILEGES ON blog.* TO 'blog'@'localhost';
FLUSH PRIVILEGES;

CREATE TABLE IF NOT EXISTS projects (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title_i18n JSON NOT NULL,
  slug VARCHAR(220) NOT NULL,
  summary_i18n JSON NOT NULL,
  description_i18n JSON NOT NULL,
  cover_url VARCHAR(500) NULL,
  project_url VARCHAR(500) NULL,
  repo_url VARCHAR(500) NULL,
  role_i18n JSON NULL,
  tags_i18n JSON NULL,
  is_featured TINYINT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'published',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_projects_slug (slug),
  KEY idx_projects_status_sort (status, sort_order),
  KEY idx_projects_featured (is_featured, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title_i18n JSON NOT NULL,
  slug VARCHAR(220) NOT NULL,
  summary_i18n JSON NOT NULL,
  content_i18n JSON NOT NULL,
  cover_url VARCHAR(500) NULL,
  tags_i18n JSON NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'published',
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_posts_slug (slug),
  KEY idx_posts_status_published (status, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  config_key VARCHAR(100) NOT NULL,
  config_value JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_settings_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO projects
  (title_i18n, slug, summary_i18n, description_i18n, project_url, role_i18n, tags_i18n, is_featured, sort_order, status)
VALUES
  (
    JSON_OBJECT('zh-CN', '恩特学术', 'en-US', 'EnterScholar'),
    'enterscholar',
    JSON_OBJECT('zh-CN', 'AI 时代下的学术互助平台，包含展示前台、后台管理端和上下游同步中间件。', 'en-US', 'An academic collaboration platform for the AI era, covering the public site, admin console, and upstream/downstream sync middleware.'),
    JSON_OBJECT('zh-CN', '负责展示前台、后台管理端，以及同步上下游数据的中间件，把内容、运营和数据流转连成一套可维护的系统。', 'en-US', 'Built the public frontend, admin console, and middleware that synchronizes upstream and downstream data into a maintainable workflow.'),
    'https://enterscholar.com/',
    JSON_OBJECT('zh-CN', '前台 / 后台 / 中间件', 'en-US', 'Frontend / Admin / Middleware'),
    JSON_OBJECT('zh-CN', JSON_ARRAY('主项目', '开源项目', '全链路实现'), 'en-US', JSON_ARRAY('Featured', 'Open Source', 'Full Stack')),
    1,
    10,
    'published'
  ),
  (
    JSON_OBJECT('zh-CN', '开源社学习平台', 'en-US', 'OSH Learning Platform'),
    'osh-learning-platform',
    JSON_OBJECT('zh-CN', '课程、支付、社群和后台运营的一体化学习产品。', 'en-US', 'A learning product integrating courses, payments, communities, and admin operations.'),
    JSON_OBJECT('zh-CN', '围绕课程、订单、权限和后台运营做完整链路设计。', 'en-US', 'Designed the full workflow around courses, orders, permissions, and admin operations.'),
    NULL,
    JSON_OBJECT('zh-CN', '学习产品 / 全栈', 'en-US', 'Learning Product / Full Stack'),
    JSON_OBJECT('zh-CN', JSON_ARRAY('学习产品', '全栈'), 'en-US', JSON_ARRAY('Learning', 'Full Stack')),
    0,
    20,
    'published'
  ),
  (
    JSON_OBJECT('zh-CN', '迁移执行手册', 'en-US', 'Migration Runbook'),
    'migration-runbook',
    JSON_OBJECT('zh-CN', '把服务器迁移拆成备份、同步、验证、回滚四个阶段。', 'en-US', 'A practical runbook splitting server migration into backup, sync, verification, and rollback.'),
    JSON_OBJECT('zh-CN', '把复杂迁移流程整理成可执行清单，每一步都有判断点。', 'en-US', 'Turned a complex migration into an executable checklist with clear decision points.'),
    NULL,
    JSON_OBJECT('zh-CN', '运维流程 / 容器', 'en-US', 'Ops Workflow / Containers'),
    JSON_OBJECT('zh-CN', JSON_ARRAY('运维流程', '容器'), 'en-US', JSON_ARRAY('Ops', 'Containers')),
    0,
    30,
    'published'
  ),
  (
    JSON_OBJECT('zh-CN', '反馈处理系统', 'en-US', 'Feedback System'),
    'feedback-system',
    JSON_OBJECT('zh-CN', '围绕用户反馈建立分类、状态流转和运营闭环。', 'en-US', 'A feedback workflow with categorization, state transitions, and operational follow-up.'),
    JSON_OBJECT('zh-CN', '让问题从提交、分类、处理到复盘形成闭环。', 'en-US', 'Builds a closed loop from submission and categorization to handling and review.'),
    NULL,
    JSON_OBJECT('zh-CN', '产品体验 / 管理端', 'en-US', 'Product UX / Admin'),
    JSON_OBJECT('zh-CN', JSON_ARRAY('产品体验', '管理端'), 'en-US', JSON_ARRAY('Product UX', 'Admin')),
    0,
    40,
    'published'
  )
ON DUPLICATE KEY UPDATE slug = VALUES(slug);

INSERT INTO posts
  (title_i18n, slug, summary_i18n, content_i18n, tags_i18n, status, published_at)
VALUES
  (
    JSON_OBJECT('zh-CN', '把一次服务器迁移写成真正可执行的手册', 'en-US', 'Turning a Server Migration into an Executable Runbook'),
    'server-migration-runbook',
    JSON_OBJECT('zh-CN', '真正有用的迁移手册，不是把命令堆在一起，而是把前置条件、成功标准和回退方案写清楚。', 'en-US', 'A useful migration runbook captures prerequisites, success criteria, and rollback plans, not just commands.'),
    JSON_OBJECT('zh-CN', '真正有用的迁移手册，不是把命令堆在一起，而是把前置条件、成功标准和回退方案写清楚。\n\n我会先把环境差异列出来，再按数据、服务、网关、验证四条线拆分执行。\n\n当流程能被别人复述并执行时，它才从个人经验变成团队资产。', 'en-US', 'A useful migration runbook captures prerequisites, success criteria, and rollback plans, not just commands.\n\nI start by listing environment differences, then split the work into data, service, gateway, and verification tracks.\n\nA process becomes team knowledge only when another person can repeat and execute it.'),
    JSON_OBJECT('zh-CN', JSON_ARRAY('运维复盘'), 'en-US', JSON_ARRAY('Ops Review')),
    'published',
    NOW()
  ),
  (
    JSON_OBJECT('zh-CN', '课程支付系统从 25 到 67 的迁移记录', 'en-US', 'Migrating a Course Payment System from 25 to 67'),
    'course-payment-migration',
    JSON_OBJECT('zh-CN', '记录课程支付链路迁移中的配置、验证和回退策略。', 'en-US', 'Notes on configuration, verification, and rollback strategy during a course payment migration.'),
    JSON_OBJECT('zh-CN', '支付链路迁移最怕状态不一致。迁移前需要明确订单、支付、权限开通和后台核验之间的关系。', 'en-US', 'Payment migration is risky when states drift. Before moving anything, clarify the relationship between orders, payments, permissions, and admin verification.'),
    JSON_OBJECT('zh-CN', JSON_ARRAY('后端实践'), 'en-US', JSON_ARRAY('Backend')),
    'published',
    NOW()
  )
ON DUPLICATE KEY UPDATE slug = VALUES(slug);
