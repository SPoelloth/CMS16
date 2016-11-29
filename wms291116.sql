-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Erstellungszeit: 29. Nov 2016 um 15:03
-- Server-Version: 10.1.10-MariaDB
-- PHP-Version: 5.6.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `wms`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `action`
--

CREATE TABLE `action` (
  `Id` int(11) UNSIGNED NOT NULL,
  `TemplateRowId` int(11) UNSIGNED NOT NULL,
  `TriggerElementModuleColumnId` int(11) UNSIGNED NOT NULL,
  `TriggerValueOperatorId` int(11) UNSIGNED DEFAULT NULL,
  `TriggerValue` text COLLATE utf8_bin,
  `ActionCreatorId` int(11) UNSIGNED NOT NULL,
  `ActionName` varchar(100) COLLATE utf8_bin NOT NULL DEFAULT 'ActionName',
  `CreationDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `action_result_element`
--

CREATE TABLE `action_result_element` (
  `ActionId` int(11) UNSIGNED NOT NULL,
  `ActionResultModuleColumnId` int(11) UNSIGNED NOT NULL,
  `ActionResultTemplateRowId` int(11) UNSIGNED NOT NULL,
  `OrderNo` int(8) UNSIGNED NOT NULL COMMENT 'Order in which affected elements or rows are computed',
  `ActionResult` varchar(50) COLLATE utf8_bin NOT NULL,
  `ActionResultInputValue` varchar(250) COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `action_result_row`
--

CREATE TABLE `action_result_row` (
  `ActionId` int(11) UNSIGNED NOT NULL,
  `ActionResultTemplateRowId` int(11) UNSIGNED NOT NULL,
  `OrderNo` int(8) UNSIGNED NOT NULL COMMENT 'Order in which affected elements or rows are computed',
  `ActionResultRowValue` varchar(65) COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `category`
--

CREATE TABLE `category` (
  `Id` int(11) UNSIGNED NOT NULL,
  `Name` varchar(65) COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Daten für Tabelle `category`
--

INSERT INTO `category` (`Id`, `Name`) VALUES
(1, 'COP'),
(2, 'IUVP'),
(3, 'RD'),
(4, 'OBD');

-- --------------------------------------------------------

--
-- Stellvertreter-Struktur des Views `current_input_counts`
--
CREATE TABLE `current_input_counts` (
);

-- --------------------------------------------------------

--
-- Stellvertreter-Struktur des Views `current_input_counts_not_empty`
--
CREATE TABLE `current_input_counts_not_empty` (
);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `element`
--

CREATE TABLE `element` (
  `Id` int(11) UNSIGNED NOT NULL,
  `Name` text COLLATE utf8_bin NOT NULL,
  `HtmlCode` text COLLATE utf8_bin NOT NULL,
  `DefaultValue` text COLLATE utf8_bin NOT NULL,
  `isTypeInput` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Daten für Tabelle `element`
--

INSERT INTO `element` (`Id`, `Name`, `HtmlCode`, `DefaultValue`, `isTypeInput`) VALUES
(1, 'Text', '<div class=''editableText editable'' contenteditable=true style=''overflow: hidden;''>[VALUE]</div>', 'Text', 0),
(2, 'Input', '<div style="overflow: hidden;">\n  <input class="form-control editableInput" type="text" value="[VALUE]"></input></div>', '', 1),
(3, 'Checkbox', '<input type="checkbox" class=''editableCheckbox''[VALUE]></input>', 'unchecked', 1),
(4, 'IMG', '<img class=''editableImg img-rounded'' src=''[VALUE]''></img>', 'uploads/default.jpg', 0),
(5, 'Radiobutton', '<input class=''editableRadiobutton'' type="radio" name="rbgroup" [VALUE]></input>', 'unchecked', 1),
(8, 'Check Button', '<div class="buttonContainer"><button type="button" class="btn btn-primary checkButton"><span class="glyphicon glyphicon-check" aria-hidden="true"></span></button></div>', 'enabled', 0),
(9, 'Text_Fuel_40', '<div class=''editableText editable'' contenteditable=false style=''overflow: hidden;''>[VALUE]</div>', 'Drain fuel and refuel with 40% ([633] gal) [121] fuel', 0),
(10, 'Text_Fuel_10', '<div class=''editableText editable'' contenteditable=false style=''overflow: hidden;''>[VALUE]</div>', 'Drain fuel and refuel with 10% ([634] gal) [121] fuel', 0),
(11, 'Text_Fuel_V', '<div class=''editableText editable'' contenteditable=false style=''overflow: hidden;''>[VALUE]</div>', 'V (gal)', 0),
(12, 'Text_Fuel_Batch', '<div class=''editableText editable'' contenteditable=false style=''overflow: hidden;''>[VALUE]</div>', 'Batch #', 0),
(13, 'Text_Fuel_Until_Full', '<div class=''editableText editable'' contenteditable=false style=''overflow: hidden;''>[VALUE]</div>', 'Refuel until click-off or 95% with [121] fuel', 0),
(14, 'Text_Fuel_With_xx_GAL_Fuel_1', '<div class=''editableText editable'' contenteditable=false style=''overflow: hidden;''>[VALUE]</div>', 'Drain fuel and refuel with', 0),
(15, 'Text_Fuel_With_xx_GAL_Fuel_2', '<div class=''editableText editable'' contenteditable=false style=''overflow: hidden;''>[VALUE]</div>', 'gal [121]', 0);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `module`
--

CREATE TABLE `module` (
  `Id` int(11) UNSIGNED NOT NULL,
  `Name` text COLLATE utf8_bin NOT NULL COMMENT 'Don''t change the fuel until names!',
  `InputCounts` tinyint(3) UNSIGNED NOT NULL,
  `OrderToShow` int(11) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Daten für Tabelle `module`
--

INSERT INTO `module` (`Id`, `Name`, `InputCounts`, `OrderToShow`) VALUES
(1, 'Text', 0, 10),
(2, 'Text+Text', 0, 20),
(3, 'Text+Text+Text', 0, 30),
(4, 'Text+Text+Text+Text', 0, 40),
(5, 'Text+Checkbox+Check', 1, 50),
(6, 'Text+Checkbox+Text+Checkbox+Check', 1, 60),
(7, 'Text+Checkbox+Text+Checkbox+Input+Check', 1, 70),
(8, 'Text+Input+Text+Checkbox+Check', 1, 80),
(9, 'Text+Input+Text+Input+Check', 1, 90),
(10, 'Text+Input+Check', 1, 100),
(11, 'Text+Text+Input+Check', 1, 110),
(12, 'Radio+Text+Radio+Text+Check', 1, 120),
(13, 'Text+Radio+Text+Radio+Check', 1, 130),
(14, 'Text+Radio+Text+Radio+Text+Check', 1, 140),
(15, 'Text+Text+Radio+Text+Radio+Text+Check', 1, 150),
(16, 'Text+Radio+Text+Radio+Text+Checkbox+Check', 1, 160),
(17, 'Text+Checkbox+Text+Radio+Text+Radio+Check', 1, 170),
(18, 'Picture+Picture', 0, 180),
(19, 'Picture+Text', 0, 190),
(20, 'Picture+Text+Checkbox+Check', 1, 200),
(21, 'Picture+Text+Radio+Text+Radio+Check', 1, 210),
(22, 'Input+Input+Input+Input+Check', 1, 111),
(23, 'Text+Input+Input+Input+Check', 1, 112),
(24, 'Text+Text+Text+Text+Text', 0, 41),
(25, 'Text+Text+Input+Text+Input+Check', 1, 91),
(26, 'Text+Input+Text+Text+Check', 1, 71),
(27, 'Text+Text+Text+Input+Check', 1, 72),
(28, 'Input+Input+Input+Text+Check', 1, 113),
(29, 'Text+Radio+Text+Radio+Text+Radio+Check', 1, 151),
(31, 'Fuel module 40%', 1, 44),
(32, 'Fuel module 10%', 1, 43),
(33, 'Fuel until click-off or 100%', 1, 45),
(34, 'Fuel with xx gal', 1, 46);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `module_column`
--

CREATE TABLE `module_column` (
  `Id` int(11) UNSIGNED NOT NULL,
  `Position` tinyint(3) UNSIGNED NOT NULL,
  `Size` tinyint(3) UNSIGNED NOT NULL,
  `ModuleId` int(11) UNSIGNED NOT NULL,
  `ElementId` int(11) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Relation between table module and element';

--
-- Daten für Tabelle `module_column`
--

INSERT INTO `module_column` (`Id`, `Position`, `Size`, `ModuleId`, `ElementId`) VALUES
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
(140, 7, 5, 29, 8),
(141, 1, 53, 31, 9),
(144, 2, 8, 31, 11),
(145, 3, 10, 31, 2),
(146, 4, 8, 31, 12),
(147, 5, 16, 31, 2),
(148, 1, 53, 32, 10),
(149, 2, 8, 32, 11),
(150, 3, 10, 32, 2),
(151, 4, 8, 32, 12),
(152, 5, 16, 32, 2),
(153, 1, 53, 33, 13),
(154, 2, 8, 33, 11),
(155, 3, 10, 33, 2),
(156, 4, 8, 33, 12),
(157, 5, 16, 33, 2),
(158, 1, 20, 34, 14),
(159, 2, 11, 34, 1),
(160, 3, 22, 34, 15),
(161, 4, 8, 34, 11),
(162, 5, 10, 34, 2),
(163, 6, 8, 34, 12),
(164, 7, 16, 34, 2),
(165, 6, 5, 32, 8),
(166, 6, 5, 31, 8),
(167, 6, 5, 33, 8),
(168, 8, 5, 34, 8);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `template`
--

CREATE TABLE `template` (
  `Id` int(11) UNSIGNED NOT NULL,
  `Name` text COLLATE utf8_bin NOT NULL,
  `TemplateCreated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `No` varchar(65) COLLATE utf8_bin NOT NULL,
  `VersionNo` varchar(65) COLLATE utf8_bin NOT NULL,
  `Status` varchar(65) COLLATE utf8_bin NOT NULL,
  `ValidFor` varchar(65) COLLATE utf8_bin NOT NULL,
  `CanBeChanged` tinyint(1) NOT NULL DEFAULT '1',
  `AuthorId` int(11) UNSIGNED NOT NULL,
  `CategoryId` int(11) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `template_row`
--

CREATE TABLE `template_row` (
  `Id` int(11) UNSIGNED NOT NULL,
  `ColorCode` varchar(7) COLLATE utf8_bin DEFAULT NULL,
  `RowNo` int(11) UNSIGNED NOT NULL,
  `TemplateId` int(11) UNSIGNED NOT NULL,
  `ModuleId` int(11) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `template_row_content`
--

CREATE TABLE `template_row_content` (
  `TemplateRowId` int(11) UNSIGNED NOT NULL,
  `ModuleColumnId` int(11) UNSIGNED NOT NULL,
  `Value` text COLLATE utf8_bin NOT NULL,
  `ReplaceNumberByTom` varchar(23) COLLATE utf8_bin NOT NULL COMMENT 'Up to 4 replacable numbers possible'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='The content in module_columns';

-- --------------------------------------------------------

--
-- Stellvertreter-Struktur des Views `total_input_counts`
--
CREATE TABLE `total_input_counts` (
`TotalInputCounts` decimal(25,0)
,`TemplateId` int(11) unsigned
);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `trigger_value_operator`
--

CREATE TABLE `trigger_value_operator` (
  `Id` int(11) UNSIGNED NOT NULL,
  `TriggerOperator` varchar(20) COLLATE utf8_bin NOT NULL,
  `ElementId` int(11) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Daten für Tabelle `trigger_value_operator`
--

INSERT INTO `trigger_value_operator` (`Id`, `TriggerOperator`, `ElementId`) VALUES
(10, '==', 2),
(11, '!=', 2),
(12, '>', 2),
(13, '<', 2),
(14, '>=', 2),
(15, '<=', 2),
(16, 'is', 3),
(17, 'is not', 3),
(18, 'is', 5),
(19, 'is not', 5),
(20, 'is', 8);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user`
--

CREATE TABLE `user` (
  `Id` int(11) UNSIGNED NOT NULL,
  `Username` varchar(65) COLLATE utf8_bin NOT NULL,
  `Password` varchar(65) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `Salt` varchar(65) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `FirstName` varchar(65) COLLATE utf8_bin NOT NULL,
  `LastName` varchar(65) COLLATE utf8_bin NOT NULL,
  `UserGroupId` int(11) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Daten für Tabelle `user`
--

INSERT INTO `user` (`Id`, `Username`, `Password`, `Salt`, `FirstName`, `LastName`, `UserGroupId`) VALUES
(11, 'TOM_AUTOFILL', '', '', '', '', 6),
(12, 'jerpro', 'JbliMZ/gTbxPQ', 'JbcgiMvvGpFaAYF9mSjRpw==', 'Jeremy', 'Probst', 6),
(13, 'tobnic', '5xxJpU7kv6Xgk', '5xQ0PJd.LpaEi6VN2ruK0Q==', 'Tobias', 'Nickl', 6),
(14, 'Stef', 'Ud/w24WvHiWi6', 'Udb./vEZQdsjmoIlYTbRhw==', 'Stef', 'PÃ¶lloth', 6);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user_group`
--

CREATE TABLE `user_group` (
  `Id` int(11) UNSIGNED NOT NULL,
  `GroupName` varchar(65) COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Daten für Tabelle `user_group`
--

INSERT INTO `user_group` (`Id`, `GroupName`) VALUES
(6, 'admin'),
(7, 'normal');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `worksheet`
--

CREATE TABLE `worksheet` (
  `Id` int(11) UNSIGNED NOT NULL,
  `Name` text COLLATE utf8_bin NOT NULL,
  `CreationDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CreatorId` int(11) UNSIGNED NOT NULL,
  `TemplateId` int(11) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Worksheet build by templates';

--
-- Trigger `worksheet`
--
DELIMITER $$
CREATE TRIGGER `LockTemplate` AFTER INSERT ON `worksheet` FOR EACH ROW UPDATE template t SET t.CanBeChanged=0 WHERE t.Id =(SELECT w.TemplateId FROM worksheet w WHERE NEW.Id = w.Id)
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `worksheet_content`
--

CREATE TABLE `worksheet_content` (
  `ResponsiblePersonId` int(11) UNSIGNED NOT NULL,
  `WorksheetId` int(11) UNSIGNED NOT NULL,
  `TemplateRowId` int(11) UNSIGNED NOT NULL,
  `ModuleColumnId` int(11) UNSIGNED NOT NULL,
  `Value` text COLLATE utf8_bin NOT NULL,
  `TimeStamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Content, which is written by an user.';

-- --------------------------------------------------------

--
-- Stellvertreter-Struktur des Views `worksheet_contents_without_tom`
--
CREATE TABLE `worksheet_contents_without_tom` (
);

-- --------------------------------------------------------

--
-- Struktur des Views `current_input_counts`
--
DROP TABLE IF EXISTS `current_input_counts`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `current_input_counts`  AS  select ifnull(`cicne`.`CurrentInputCounts`,0) AS `CurrentInputCounts`,`w`.`Id` AS `WorksheetId`,`w`.`Name` AS `WorksheetName` from (`worksheet` `w` left join `current_input_counts_not_empty` `cicne` on((`w`.`Id` = `cicne`.`WorksheetId`))) ;

-- --------------------------------------------------------

--
-- Struktur des Views `current_input_counts_not_empty`
--
DROP TABLE IF EXISTS `current_input_counts_not_empty`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `current_input_counts_not_empty`  AS  select count(`wcwt`.`TemplateRowId`) AS `CurrentInputCounts`,`wcwt`.`WorksheetId` AS `WorksheetId`,`wcwt`.`WorksheetName` AS `Worksheetname` from `worksheet_contents_without_tom` `wcwt` group by `wcwt`.`WorksheetId` ;

-- --------------------------------------------------------

--
-- Struktur des Views `total_input_counts`
--
DROP TABLE IF EXISTS `total_input_counts`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `total_input_counts`  AS  select sum(`m`.`InputCounts`) AS `TotalInputCounts`,`tr`.`TemplateId` AS `TemplateId` from (`template_row` `tr` join `module` `m` on((`m`.`Id` = `tr`.`ModuleId`))) group by `tr`.`TemplateId` ;

-- --------------------------------------------------------

--
-- Struktur des Views `worksheet_contents_without_tom`
--
DROP TABLE IF EXISTS `worksheet_contents_without_tom`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `worksheet_contents_without_tom`  AS  select `wc`.`TemplateRowId` AS `TemplateRowId`,`w`.`Id` AS `WorksheetId`,`w`.`Name` AS `WorksheetName` from (`worksheet` `w` join `worksheet_content` `wc` on(((`w`.`Id` = `wc`.`WorksheetId`) and ((select `u`.`QtbNumber` from `user` `u` where (`wc`.`ResponsiblePersonId` = `u`.`Id`)) <> 'TOM_AUTOFILL')))) group by `wc`.`TemplateRowId`,`wc`.`WorksheetId` ;

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `action`
--
ALTER TABLE `action`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `TemplateRowId` (`TemplateRowId`),
  ADD KEY `TriggerElementId` (`TriggerElementModuleColumnId`),
  ADD KEY `TriggerValueOperatorId` (`TriggerValueOperatorId`),
  ADD KEY `ActionCreatorId` (`ActionCreatorId`);

--
-- Indizes für die Tabelle `action_result_element`
--
ALTER TABLE `action_result_element`
  ADD PRIMARY KEY (`ActionId`,`ActionResultModuleColumnId`,`ActionResultTemplateRowId`),
  ADD KEY `ActionId` (`ActionId`),
  ADD KEY `ActionResultModuleColumnId` (`ActionResultModuleColumnId`),
  ADD KEY `ActionResultTemplateRowId` (`ActionResultTemplateRowId`);

--
-- Indizes für die Tabelle `action_result_row`
--
ALTER TABLE `action_result_row`
  ADD PRIMARY KEY (`ActionId`,`ActionResultTemplateRowId`),
  ADD KEY `ActionId` (`ActionId`),
  ADD KEY `TemplateRowId` (`ActionResultTemplateRowId`);

--
-- Indizes für die Tabelle `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`Id`);

--
-- Indizes für die Tabelle `element`
--
ALTER TABLE `element`
  ADD PRIMARY KEY (`Id`);

--
-- Indizes für die Tabelle `module`
--
ALTER TABLE `module`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `OrderToShow` (`OrderToShow`);

--
-- Indizes für die Tabelle `module_column`
--
ALTER TABLE `module_column`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `ModuleId` (`ModuleId`),
  ADD KEY `ElementId` (`ElementId`);

--
-- Indizes für die Tabelle `template`
--
ALTER TABLE `template`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `Author` (`AuthorId`),
  ADD KEY `CategoryId` (`CategoryId`);

--
-- Indizes für die Tabelle `template_row`
--
ALTER TABLE `template_row`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `TemplateId` (`TemplateId`),
  ADD KEY `ModuleId` (`ModuleId`);

--
-- Indizes für die Tabelle `template_row_content`
--
ALTER TABLE `template_row_content`
  ADD PRIMARY KEY (`TemplateRowId`,`ModuleColumnId`),
  ADD KEY `TemplateRowId` (`TemplateRowId`),
  ADD KEY `ModuleColumnId` (`ModuleColumnId`);

--
-- Indizes für die Tabelle `trigger_value_operator`
--
ALTER TABLE `trigger_value_operator`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `ElementId` (`ElementId`);

--
-- Indizes für die Tabelle `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `QtbNumberIndex` (`Username`(11)),
  ADD KEY `UserGroupId` (`UserGroupId`);

--
-- Indizes für die Tabelle `user_group`
--
ALTER TABLE `user_group`
  ADD PRIMARY KEY (`Id`);

--
-- Indizes für die Tabelle `worksheet`
--
ALTER TABLE `worksheet`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `CreatorId` (`CreatorId`),
  ADD KEY `TemplateId` (`TemplateId`);

--
-- Indizes für die Tabelle `worksheet_content`
--
ALTER TABLE `worksheet_content`
  ADD PRIMARY KEY (`ResponsiblePersonId`,`WorksheetId`,`TemplateRowId`,`ModuleColumnId`),
  ADD KEY `ResponsiblePersonId` (`ResponsiblePersonId`),
  ADD KEY `WorksheetId` (`WorksheetId`),
  ADD KEY `TemplateRowId` (`TemplateRowId`),
  ADD KEY `ModuleColumnId` (`ModuleColumnId`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `action`
--
ALTER TABLE `action`
  MODIFY `Id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `category`
--
ALTER TABLE `category`
  MODIFY `Id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT für Tabelle `element`
--
ALTER TABLE `element`
  MODIFY `Id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
--
-- AUTO_INCREMENT für Tabelle `module`
--
ALTER TABLE `module`
  MODIFY `Id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;
--
-- AUTO_INCREMENT für Tabelle `module_column`
--
ALTER TABLE `module_column`
  MODIFY `Id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=169;
--
-- AUTO_INCREMENT für Tabelle `template`
--
ALTER TABLE `template`
  MODIFY `Id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `template_row`
--
ALTER TABLE `template_row`
  MODIFY `Id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT für Tabelle `trigger_value_operator`
--
ALTER TABLE `trigger_value_operator`
  MODIFY `Id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;
--
-- AUTO_INCREMENT für Tabelle `user`
--
ALTER TABLE `user`
  MODIFY `Id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
--
-- AUTO_INCREMENT für Tabelle `user_group`
--
ALTER TABLE `user_group`
  MODIFY `Id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT für Tabelle `worksheet`
--
ALTER TABLE `worksheet`
  MODIFY `Id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `action`
--
ALTER TABLE `action`
  ADD CONSTRAINT `ActionModuleColumnFk` FOREIGN KEY (`TriggerElementModuleColumnId`) REFERENCES `module_column` (`Id`),
  ADD CONSTRAINT `ActionTemplateRowFk` FOREIGN KEY (`TemplateRowId`) REFERENCES `template_row` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ActionTriggerValueOperatorFk` FOREIGN KEY (`TriggerValueOperatorId`) REFERENCES `trigger_value_operator` (`Id`),
  ADD CONSTRAINT `ActionUserFk` FOREIGN KEY (`ActionCreatorId`) REFERENCES `user` (`Id`);

--
-- Constraints der Tabelle `action_result_element`
--
ALTER TABLE `action_result_element`
  ADD CONSTRAINT `ActionResultElementActionFk` FOREIGN KEY (`ActionId`) REFERENCES `action` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ActionResultElementModuleColumnFk` FOREIGN KEY (`ActionResultModuleColumnId`) REFERENCES `module_column` (`Id`),
  ADD CONSTRAINT `ActionResultElementTemplateRowFk` FOREIGN KEY (`ActionResultTemplateRowId`) REFERENCES `template_row` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `action_result_row`
--
ALTER TABLE `action_result_row`
  ADD CONSTRAINT `ActionResultRowActionFk` FOREIGN KEY (`ActionId`) REFERENCES `action` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ActionResultRowTemplateRowFk` FOREIGN KEY (`ActionResultTemplateRowId`) REFERENCES `template_row` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `module_column`
--
ALTER TABLE `module_column`
  ADD CONSTRAINT `ModuleColumnElementFk` FOREIGN KEY (`ElementId`) REFERENCES `element` (`Id`),
  ADD CONSTRAINT `ModuleColumnModuleFk` FOREIGN KEY (`ModuleId`) REFERENCES `module` (`Id`);

--
-- Constraints der Tabelle `template`
--
ALTER TABLE `template`
  ADD CONSTRAINT `TemplateCategoryFk` FOREIGN KEY (`CategoryId`) REFERENCES `category` (`Id`),
  ADD CONSTRAINT `TemplateUserFk` FOREIGN KEY (`AuthorId`) REFERENCES `user` (`Id`);

--
-- Constraints der Tabelle `template_row`
--
ALTER TABLE `template_row`
  ADD CONSTRAINT `TemplateRowModuleFk ` FOREIGN KEY (`ModuleId`) REFERENCES `module` (`Id`),
  ADD CONSTRAINT `TemplateRowTemplateFk` FOREIGN KEY (`TemplateId`) REFERENCES `template` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `template_row_content`
--
ALTER TABLE `template_row_content`
  ADD CONSTRAINT `TemplateRowContentModuleColumnFk` FOREIGN KEY (`ModuleColumnId`) REFERENCES `module_column` (`Id`),
  ADD CONSTRAINT `TemplateRowContentTemplateRowFk` FOREIGN KEY (`TemplateRowId`) REFERENCES `template_row` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `trigger_value_operator`
--
ALTER TABLE `trigger_value_operator`
  ADD CONSTRAINT `TriggerValueOperatorElementFk` FOREIGN KEY (`ElementId`) REFERENCES `element` (`Id`);

--
-- Constraints der Tabelle `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `UserUserGroupFk` FOREIGN KEY (`UserGroupId`) REFERENCES `user_group` (`Id`);

--
-- Constraints der Tabelle `worksheet`
--
ALTER TABLE `worksheet`
  ADD CONSTRAINT `WorksheetTemplateFk` FOREIGN KEY (`TemplateId`) REFERENCES `template` (`Id`),
  ADD CONSTRAINT `WorksheetUserFk` FOREIGN KEY (`CreatorId`) REFERENCES `user` (`Id`);

--
-- Constraints der Tabelle `worksheet_content`
--
ALTER TABLE `worksheet_content`
  ADD CONSTRAINT `WorksheetContentModuleColumnFk` FOREIGN KEY (`ModuleColumnId`) REFERENCES `module_column` (`Id`),
  ADD CONSTRAINT `WorksheetContentTemplateRowFk` FOREIGN KEY (`TemplateRowId`) REFERENCES `template_row` (`Id`),
  ADD CONSTRAINT `WorksheetContentUserFk` FOREIGN KEY (`ResponsiblePersonId`) REFERENCES `user` (`Id`),
  ADD CONSTRAINT `WorksheetContentWorksheetFk` FOREIGN KEY (`WorksheetId`) REFERENCES `worksheet` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
