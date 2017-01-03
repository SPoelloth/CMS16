-- --------------------------------------------------------
-- Host:                         localhost
-- Server Version:               10.1.16-MariaDB - mariadb.org binary distribution
-- Server Betriebssystem:        Win32
-- HeidiSQL Version:             9.4.0.5125
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Exportiere Datenbank Struktur für wms
CREATE DATABASE IF NOT EXISTS `wms` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_bin */;
USE `wms`;

-- Exportiere Struktur von Tabelle wms.element
CREATE TABLE IF NOT EXISTS `element` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8_bin NOT NULL,
  `html_code` text COLLATE utf8_bin NOT NULL,
  `default_value` text COLLATE utf8_bin NOT NULL,
  `is_type_input` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- Exportiere Daten aus Tabelle wms.element: ~6 rows (ungefähr)
DELETE FROM `element`;
/*!40000 ALTER TABLE `element` DISABLE KEYS */;
INSERT INTO `element` (`id`, `name`, `html_code`, `default_value`, `is_type_input`) VALUES
	(1, 'Text', '<div class=\'editableText editable\' contenteditable=true style=\'overflow: hidden;\'><%= element_value %></div>', 'Text', 0),
	(2, 'Input', '<div style="overflow: hidden;">\n  <input class="form-control editableInput" type="text" value="<%= element_value %>"></input></div>', '', 1),
	(3, 'Checkbox', '<input type="checkbox" class=\'editableCheckbox\' <%= element_value %>></input>', 'unchecked', 1),
	(4, 'IMG', '<img class=\'editableImg img-rounded\' src=\'<%= element_value %>\'></img>', 'uploads/default.jpg', 0),
	(5, 'Radiobutton', '<input class=\'editableRadiobutton\' type="radio" name="rbgroup" <%= element_value %>></input>', 'unchecked', 1),
	(8, 'Check Button', '<div class="buttonContainer"><button type="button" class="btn btn-primary checkButton"><span class="glyphicon glyphicon-check" aria-hidden="true"></span></button></div>', 'enabled', 0);
/*!40000 ALTER TABLE `element` ENABLE KEYS */;

-- Exportiere Struktur von Tabelle wms.module
CREATE TABLE IF NOT EXISTS `module` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8_bin NOT NULL,
  `order_to_show` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `OrderToShow` (`order_to_show`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- Exportiere Daten aus Tabelle wms.module: ~29 rows (ungefähr)
DELETE FROM `module`;
/*!40000 ALTER TABLE `module` DISABLE KEYS */;
INSERT INTO `module` (`id`, `name`, `order_to_show`) VALUES
	(1, 'Text', 10),
	(2, 'Text+Text', 20),
	(3, 'Text+Text+Text', 30),
	(4, 'Text+Text+Text+Text', 40),
	(5, 'Text+Checkbox+Check', 50),
	(6, 'Text+Checkbox+Text+Checkbox+Check', 60),
	(7, 'Text+Checkbox+Text+Checkbox+Input+Check', 70),
	(8, 'Text+Input+Text+Checkbox+Check', 80),
	(9, 'Text+Input+Text+Input+Check', 90),
	(10, 'Text+Input+Check', 100),
	(11, 'Text+Text+Input+Check', 110),
	(12, 'Radio+Text+Radio+Text+Check', 120),
	(13, 'Text+Radio+Text+Radio+Check', 130),
	(14, 'Text+Radio+Text+Radio+Text+Check', 140),
	(15, 'Text+Text+Radio+Text+Radio+Text+Check', 150),
	(16, 'Text+Radio+Text+Radio+Text+Checkbox+Check', 160),
	(17, 'Text+Checkbox+Text+Radio+Text+Radio+Check', 170),
	(18, 'Picture+Picture', 180),
	(19, 'Picture+Text', 190),
	(20, 'Picture+Text+Checkbox+Check', 200),
	(21, 'Picture+Text+Radio+Text+Radio+Check', 210),
	(22, 'Input+Input+Input+Input+Check', 111),
	(23, 'Text+Input+Input+Input+Check', 112),
	(24, 'Text+Text+Text+Text+Text', 41),
	(25, 'Text+Text+Input+Text+Input+Check', 91),
	(26, 'Text+Input+Text+Text+Check', 71),
	(27, 'Text+Text+Text+Input+Check', 72),
	(28, 'Input+Input+Input+Text+Check', 113),
	(29, 'Text+Radio+Text+Radio+Text+Radio+Check', 151);
/*!40000 ALTER TABLE `module` ENABLE KEYS */;

-- Exportiere Struktur von Tabelle wms.module_column
CREATE TABLE IF NOT EXISTS `module_column` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `position` tinyint(3) unsigned NOT NULL,
  `size` tinyint(3) unsigned NOT NULL,
  `module_id` int(11) unsigned NOT NULL,
  `element_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ModuleId` (`module_id`),
  KEY `ElementId` (`element_id`),
  CONSTRAINT `ModuleColumnElementFk` FOREIGN KEY (`element_id`) REFERENCES `element` (`Id`),
  CONSTRAINT `ModuleColumnModuleFk` FOREIGN KEY (`module_id`) REFERENCES `module` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=141 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- Exportiere Daten aus Tabelle wms.module_column: ~135 rows (ungefähr)
DELETE FROM `module_column`;
/*!40000 ALTER TABLE `module_column` DISABLE KEYS */;
INSERT INTO `module_column` (`id`, `position`, `size`, `module_id`, `element_id`) VALUES
	(1, 1, 100, 1, 1),
	(2, 1, 50, 2, 1),
	(3, 2, 50, 2, 1),
	(4, 1, 33, 3, 1),
	(5, 2, 33, 3, 1),
	(6, 3, 34, 3, 1),
	(7, 1, 25, 4, 1),
	(8, 2, 25, 4, 1),
	(9, 3, 25, 4, 1),
	(10, 4, 25, 4, 1),
	(11, 1, 90, 5, 1),
	(12, 2, 5, 5, 3),
	(13, 3, 5, 5, 8),
	(19, 1, 42, 6, 1),
	(20, 2, 5, 6, 3),
	(21, 3, 43, 6, 1),
	(22, 4, 5, 6, 3),
	(23, 8, 5, 6, 8),
	(24, 1, 25, 7, 1),
	(25, 2, 5, 7, 3),
	(26, 3, 25, 7, 1),
	(27, 4, 5, 7, 3),
	(28, 5, 35, 7, 2),
	(29, 6, 5, 7, 8),
	(30, 1, 30, 8, 1),
	(31, 2, 30, 8, 2),
	(32, 3, 30, 8, 1),
	(33, 4, 5, 8, 3),
	(34, 5, 5, 8, 8),
	(35, 1, 23, 9, 1),
	(36, 2, 24, 9, 2),
	(37, 3, 24, 9, 1),
	(38, 4, 24, 9, 2),
	(39, 5, 5, 9, 8),
	(40, 1, 45, 10, 1),
	(41, 2, 50, 10, 2),
	(42, 6, 5, 10, 8),
	(43, 1, 30, 11, 1),
	(44, 2, 30, 11, 1),
	(45, 3, 35, 11, 2),
	(46, 4, 5, 11, 8),
	(47, 1, 5, 12, 5),
	(48, 2, 42, 12, 1),
	(49, 3, 5, 12, 5),
	(50, 4, 43, 12, 1),
	(51, 5, 5, 12, 8),
	(52, 1, 42, 13, 1),
	(53, 2, 5, 13, 5),
	(54, 3, 43, 13, 1),
	(55, 4, 5, 13, 5),
	(56, 5, 5, 13, 8),
	(57, 1, 28, 14, 1),
	(58, 2, 5, 14, 5),
	(59, 3, 28, 14, 1),
	(60, 4, 5, 14, 5),
	(61, 5, 29, 14, 1),
	(62, 6, 5, 14, 8),
	(63, 1, 20, 15, 1),
	(64, 2, 20, 15, 1),
	(65, 3, 5, 15, 5),
	(66, 4, 20, 15, 1),
	(67, 5, 5, 15, 5),
	(68, 6, 25, 15, 1),
	(69, 7, 5, 15, 8),
	(70, 1, 26, 16, 1),
	(71, 2, 5, 16, 5),
	(72, 3, 26, 16, 1),
	(73, 4, 5, 16, 5),
	(74, 5, 28, 16, 1),
	(75, 6, 5, 16, 3),
	(76, 7, 5, 16, 8),
	(77, 1, 30, 17, 1),
	(78, 2, 5, 17, 3),
	(79, 3, 25, 17, 1),
	(80, 4, 5, 17, 5),
	(81, 5, 25, 17, 1),
	(82, 6, 5, 17, 5),
	(83, 7, 5, 17, 8),
	(84, 1, 50, 18, 4),
	(85, 2, 50, 18, 4),
	(86, 1, 50, 19, 4),
	(87, 2, 50, 19, 1),
	(88, 1, 50, 20, 4),
	(89, 2, 40, 20, 1),
	(90, 3, 5, 20, 3),
	(91, 4, 5, 20, 8),
	(92, 1, 39, 21, 4),
	(93, 2, 23, 21, 1),
	(94, 3, 5, 21, 5),
	(95, 4, 23, 21, 1),
	(96, 5, 5, 21, 5),
	(97, 6, 5, 21, 8),
	(98, 1, 20, 24, 1),
	(99, 2, 20, 24, 1),
	(100, 3, 20, 24, 1),
	(101, 4, 20, 24, 1),
	(102, 5, 20, 24, 1),
	(103, 1, 24, 26, 1),
	(104, 2, 24, 26, 2),
	(105, 3, 24, 26, 1),
	(106, 4, 23, 26, 1),
	(107, 5, 5, 26, 8),
	(108, 1, 24, 27, 1),
	(109, 2, 24, 27, 1),
	(110, 3, 24, 27, 1),
	(111, 4, 23, 27, 2),
	(112, 5, 5, 27, 8),
	(113, 1, 19, 25, 1),
	(114, 2, 19, 25, 1),
	(115, 3, 19, 25, 2),
	(116, 4, 19, 25, 1),
	(117, 5, 19, 25, 2),
	(118, 6, 5, 25, 8),
	(119, 1, 24, 22, 2),
	(120, 2, 24, 22, 2),
	(121, 3, 24, 22, 2),
	(122, 4, 23, 22, 2),
	(123, 5, 5, 22, 8),
	(124, 1, 24, 23, 1),
	(125, 2, 24, 23, 2),
	(126, 3, 24, 23, 2),
	(127, 4, 23, 23, 2),
	(128, 5, 5, 23, 8),
	(129, 1, 24, 28, 2),
	(130, 2, 24, 28, 2),
	(131, 3, 24, 28, 2),
	(132, 4, 23, 28, 1),
	(133, 5, 5, 28, 8),
	(134, 1, 27, 29, 1),
	(135, 2, 5, 29, 5),
	(136, 3, 27, 29, 1),
	(137, 4, 5, 29, 5),
	(138, 5, 26, 29, 1),
	(139, 6, 5, 29, 5),
	(140, 7, 5, 29, 8);
/*!40000 ALTER TABLE `module_column` ENABLE KEYS */;

-- Exportiere Struktur von Tabelle wms.template
CREATE TABLE IF NOT EXISTS `template` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8_bin NOT NULL,
  `template_created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `author_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Author` (`author_id`),
  CONSTRAINT `TemplateUserFk` FOREIGN KEY (`author_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- Exportiere Daten aus Tabelle wms.template: ~0 rows (ungefähr)
DELETE FROM `template`;
/*!40000 ALTER TABLE `template` DISABLE KEYS */;
/*!40000 ALTER TABLE `template` ENABLE KEYS */;

-- Exportiere Struktur von Tabelle wms.template_row
CREATE TABLE IF NOT EXISTS `template_row` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `color_code` varchar(7) COLLATE utf8_bin DEFAULT NULL,
  `row_num` int(11) unsigned NOT NULL,
  `template_id` int(11) unsigned NOT NULL,
  `module_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `TemplateId` (`template_id`),
  KEY `ModuleId` (`module_id`),
  CONSTRAINT `TemplateRowModuleFK` FOREIGN KEY (`module_id`) REFERENCES `module` (`id`),
  CONSTRAINT `TemplateRowTemplateFk` FOREIGN KEY (`template_id`) REFERENCES `template` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- Exportiere Daten aus Tabelle wms.template_row: ~0 rows (ungefähr)
DELETE FROM `template_row`;
/*!40000 ALTER TABLE `template_row` DISABLE KEYS */;
/*!40000 ALTER TABLE `template_row` ENABLE KEYS */;

-- Exportiere Struktur von Tabelle wms.template_row_content
CREATE TABLE IF NOT EXISTS `template_row_content` (
  `template_row_id` int(11) unsigned NOT NULL,
  `module_column_id` int(11) unsigned NOT NULL,
  `value` text COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`template_row_id`,`module_column_id`),
  KEY `TemplateRowId` (`template_row_id`),
  KEY `ModuleColumnId` (`module_column_id`),
  CONSTRAINT `TemplateRowContentModuleColumnFk` FOREIGN KEY (`module_column_id`) REFERENCES `module_column` (`id`),
  CONSTRAINT `TemplateRowContentTemplateRowFk` FOREIGN KEY (`template_row_id`) REFERENCES `template_row` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- Exportiere Daten aus Tabelle wms.template_row_content: ~0 rows (ungefähr)
DELETE FROM `template_row_content`;
/*!40000 ALTER TABLE `template_row_content` DISABLE KEYS */;
/*!40000 ALTER TABLE `template_row_content` ENABLE KEYS */;

-- Exportiere Struktur von Tabelle wms.user
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(65) COLLATE utf8_bin NOT NULL,
  `password` varchar(65) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `salt` varchar(65) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `first_name` varchar(65) COLLATE utf8_bin NOT NULL,
  `last_name` varchar(65) COLLATE utf8_bin NOT NULL,
  `user_group_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `QtbNumberIndex` (`username`(11)),
  KEY `UserGroupId` (`user_group_id`),
  CONSTRAINT `UserUserGroupFk` FOREIGN KEY (`user_group_id`) REFERENCES `user_group` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- Exportiere Daten aus Tabelle wms.user: ~5 rows (ungefähr)
DELETE FROM `user`;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` (`id`, `username`, `password`, `salt`, `first_name`, `last_name`, `user_group_id`) VALUES
	(12, 'jerpro', 'JbliMZ/gTbxPQ', 'JbcgiMvvGpFaAYF9mSjRpw==', 'Jeremy', 'Probst', 6),
	(13, 'tobnic', '5xxJpU7kv6Xgk', '5xQ0PJd.LpaEi6VN2ruK0Q==', 'Tobias', 'Nickl', 6),
	(14, 'Stef', 'Ud/w24WvHiWi6', 'Udb./vEZQdsjmoIlYTbRhw==', 'Stef', 'PÃ¶lloth', 6),
	(15, 'jwies', 'zqyfkbQ8iW326', 'zqDHAdwabmDuGSx5fjOoQg==', 'Johannes', 'Wiesneth', 6),
	(16, 'User', '2I4txJ99UByko', '2InJKHBd/ZOrtdKROhEotw==', 'Vorname', 'Nachname', 7);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;

-- Exportiere Struktur von Tabelle wms.user_group
CREATE TABLE IF NOT EXISTS `user_group` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `group_name` varchar(65) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- Exportiere Daten aus Tabelle wms.user_group: ~2 rows (ungefähr)
DELETE FROM `user_group`;
/*!40000 ALTER TABLE `user_group` DISABLE KEYS */;
INSERT INTO `user_group` (`id`, `group_name`) VALUES
	(6, 'admin'),
	(7, 'normal');
/*!40000 ALTER TABLE `user_group` ENABLE KEYS */;

-- Exportiere Struktur von Tabelle wms.website
CREATE TABLE IF NOT EXISTS `website` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` text COLLATE utf8_bin NOT NULL,
  `creation_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creator_id` int(11) unsigned NOT NULL,
  `template_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `creator_id` (`creator_id`),
  KEY `template_id` (`template_id`),
  CONSTRAINT `WebsiteTemplateFK` FOREIGN KEY (`template_id`) REFERENCES `template` (`id`),
  CONSTRAINT `WebsiteUserFK` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- Exportiere Daten aus Tabelle wms.website: ~0 rows (ungefähr)
DELETE FROM `website`;
/*!40000 ALTER TABLE `website` DISABLE KEYS */;
/*!40000 ALTER TABLE `website` ENABLE KEYS */;

-- Exportiere Struktur von Tabelle wms.website_content
CREATE TABLE IF NOT EXISTS `website_content` (
  `responsible_person_id` int(11) unsigned NOT NULL,
  `website_id` int(11) unsigned NOT NULL,
  `template_row_id` int(11) unsigned NOT NULL,
  `module_column_id` int(11) unsigned NOT NULL,
  `value` text COLLATE utf8_bin NOT NULL,
  `timstamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`responsible_person_id`,`website_id`,`template_row_id`,`module_column_id`),
  KEY `Schlüssel 2` (`responsible_person_id`),
  KEY `Schlüssel 3` (`website_id`),
  KEY `Schlüssel 4` (`template_row_id`),
  KEY `Schlüssel 5` (`module_column_id`),
  CONSTRAINT `WebsiteContentModuleColumnFK` FOREIGN KEY (`module_column_id`) REFERENCES `module_column` (`id`),
  CONSTRAINT `WebsiteContentTemplateRowFK` FOREIGN KEY (`template_row_id`) REFERENCES `template_row` (`id`),
  CONSTRAINT `WebsiteContentUserFK` FOREIGN KEY (`responsible_person_id`) REFERENCES `user` (`id`),
  CONSTRAINT `WebsiteContentWebsiteFK` FOREIGN KEY (`website_id`) REFERENCES `website` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- Exportiere Daten aus Tabelle wms.website_content: ~0 rows (ungefähr)
DELETE FROM `website_content`;
/*!40000 ALTER TABLE `website_content` DISABLE KEYS */;
/*!40000 ALTER TABLE `website_content` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
