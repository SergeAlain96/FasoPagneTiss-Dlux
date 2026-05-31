CREATE DATABASE IF NOT EXISTS fasopagnes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fasopagnes;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  type VARCHAR(50) NOT NULL,
  price VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  client_name VARCHAR(190) NOT NULL,
  client_phone VARCHAR(50) NOT NULL,
  note TEXT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'en attente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  phone VARCHAR(50) NOT NULL UNIQUE,
  orders_count INT NOT NULL DEFAULT 0,
  first_order_at TIMESTAMP NULL DEFAULT NULL,
  last_order_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(64) NOT NULL,
  product_name VARCHAR(190) NOT NULL,
  product_type VARCHAR(50) NOT NULL,
  qty INT NOT NULL,
  price VARCHAR(50) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Mot de passe initial de migration (sera automatiquement hashé après la première connexion réussie)
INSERT INTO admins (username, password)
VALUES ('admin', 'Faso2026!')
ON DUPLICATE KEY UPDATE password = VALUES(password);

INSERT INTO products (id, name, type, price, description) VALUES
('prod-bogolan-premium', 'Pagne Bogolan Premium', 'tisse', '18 000', 'Motifs géométriques traditionnels. Colorants naturels.'),
('prod-faso-dan-fani', 'Pagne Faso Dan Fani', 'tisse', '12 000', 'Tissé à la main par des artisans de Koudougou.'),
('prod-batik-tremblant', 'Batik Tremblant', 'batiks', '9 500', 'Batik tremblant aux couleurs vives, parfait pour des tenues élégantes.'),
('prod-batik-coton', 'Batik Coton', 'batiks', '8 000', 'Batik en coton confortable, idéal pour un usage quotidien.'),
('prod-kokodonda-bleu-royal', 'Kokodonda Bleu Royal', 'kokodonda', '25 000', 'Kokodonda de qualité supérieure, teinture artisanale durable.'),
('prod-kokodonda-dore-brode', 'Kokodonda Doré Brodé', 'kokodonda', '30 000', 'Kokodonda premium avec finitions raffinées pour grandes occasions.'),
('prod-bogolla-prestige', 'Bogolla Prestige', 'bogolla', '16 000', 'Bogolla authentique au style moderne, coupe polyvalente.'),
('prod-galani-signature', 'Galani Signature', 'galani', '14 000', 'Galani traditionnel avec motifs élégants et résistants.'),
('prod-echarpe-tissee', 'Écharpe Tissée', 'accessoire', '5 000', 'Accessoire en tissu tissé, idéal comme cadeau.'),
('prod-sac-pagne-traditionnel', 'Sac Pagne Traditionnel', 'accessoire', '8 000', 'Sac artisanal fabriqué à partir de pagnes tissés.')
ON DUPLICATE KEY UPDATE
name = VALUES(name),
type = VALUES(type),
price = VALUES(price),
description = VALUES(description);
