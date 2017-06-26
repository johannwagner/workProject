# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 5.5.5-10.1.21-MariaDB)
# Datenbank: work
# Erstellt am: 2017-06-26 19:25:38 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Export von Tabelle customers
# ------------------------------------------------------------

DROP TABLE IF EXISTS `customers`;

CREATE TABLE `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `teamId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `customers_fk0` (`teamId`),
  CONSTRAINT `customers_fk0` FOREIGN KEY (`teamId`) REFERENCES `teams` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;



# Export von Tabelle invoices
# ------------------------------------------------------------

DROP TABLE IF EXISTS `invoices`;

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projectId` int(11) NOT NULL,
  `createDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `invoices_fk0` (`projectId`),
  CONSTRAINT `invoices_fk0` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;



# Export von Tabelle projectGroups
# ------------------------------------------------------------

DROP TABLE IF EXISTS `projectGroups`;

CREATE TABLE `projectGroups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projectId` int(11) NOT NULL,
  `fixedPrice` float NOT NULL,
  `title` text NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `projectGroups_fk0` (`projectId`),
  CONSTRAINT `projectGroups_fk0` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;



# Export von Tabelle projects
# ------------------------------------------------------------

DROP TABLE IF EXISTS `projects`;

CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `displayName` varchar(255) NOT NULL,
  `teamId` int(11) NOT NULL,
  `fixedPrice` float DEFAULT NULL,
  `customerId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `projects_fk0` (`teamId`),
  KEY `projects_fk1` (`customerId`),
  CONSTRAINT `projects_fk0` FOREIGN KEY (`teamId`) REFERENCES `teams` (`id`),
  CONSTRAINT `projects_fk1` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;



# Export von Tabelle projectSteps
# ------------------------------------------------------------

DROP TABLE IF EXISTS `projectSteps`;

CREATE TABLE `projectSteps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `text` text NOT NULL,
  `annotationId` int(11) NOT NULL,
  `workHours` time DEFAULT NULL,
  `invoiceId` int(11) DEFAULT NULL,
  `projectGroupId` int(11) DEFAULT NULL,
  `projectId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `projectSteps_fk0` (`userId`),
  KEY `projectSteps_fk1` (`invoiceId`),
  KEY `projectSteps_fk2` (`projectGroupId`),
  KEY `projectSteps_fk3` (`projectId`),
  CONSTRAINT `projectSteps_fk0` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `projectSteps_fk1` FOREIGN KEY (`invoiceId`) REFERENCES `invoices` (`id`),
  CONSTRAINT `projectSteps_fk2` FOREIGN KEY (`projectGroupId`) REFERENCES `projectGroups` (`id`),
  CONSTRAINT `projectSteps_fk3` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;



# Export von Tabelle teams
# ------------------------------------------------------------

DROP TABLE IF EXISTS `teams`;

CREATE TABLE `teams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `displayName` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;



# Export von Tabelle teamSettings
# ------------------------------------------------------------

DROP TABLE IF EXISTS `teamSettings`;

CREATE TABLE `teamSettings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hourLoan` float DEFAULT NULL,
  `taxNumber` varchar(11) DEFAULT NULL,
  `addressBlock` text,
  `iban` varchar(30) DEFAULT NULL,
  `bic` varchar(30) DEFAULT NULL,
  `teamId` int(11) NOT NULL,
  `createDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `endDate` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `teamSettings_fk0` (`teamId`),
  CONSTRAINT `teamSettings_fk0` FOREIGN KEY (`teamId`) REFERENCES `teams` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;



# Export von Tabelle users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `passwordSalt` varchar(255) NOT NULL,
  `mailAddress` varchar(255) NOT NULL,
  `teamId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `users_fk0` (`teamId`),
  CONSTRAINT `users_fk0` FOREIGN KEY (`teamId`) REFERENCES `teams` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
