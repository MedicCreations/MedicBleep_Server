-- phpMyAdmin SQL Dump
-- version 4.2.7.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Oct 13, 2014 at 05:16 PM
-- Server version: 5.5.38-0ubuntu0.14.04.1
-- PHP Version: 5.5.9-1ubuntu4.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `dev`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE IF NOT EXISTS `categories` (
`id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

-- --------------------------------------------------------

--
-- Table structure for table `chat`
--

CREATE TABLE IF NOT EXISTS `chat` (
`id` int(11) NOT NULL,
  `custom_chat_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` int(11) NOT NULL,
  `is_active` int(11) NOT NULL DEFAULT '1',
  `admin_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `image` varchar(255) NOT NULL,
  `image_thumb` varchar(255) NOT NULL,
  `category_id` int(11) NOT NULL DEFAULT '0',
  `has_messages` int(11) NOT NULL,
  `seen_by` varchar(255) NOT NULL,
  `is_deleted` int(11) NOT NULL DEFAULT '0',
  `created` int(11) NOT NULL,
  `modified` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=409 ;

-- --------------------------------------------------------

--
-- Table structure for table `chat_member`
--

CREATE TABLE IF NOT EXISTS `chat_member` (
`id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `chat_id` int(11) NOT NULL,
  `unread` int(11) NOT NULL,
  `is_deleted` int(11) NOT NULL DEFAULT '0',
  `created` int(11) NOT NULL,
  `modified` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1207 ;

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE IF NOT EXISTS `groups` (
`id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` int(11) NOT NULL,
  `image` varchar(255) NOT NULL,
  `image_thumb` varchar(255) NOT NULL,
  `is_deleted` int(11) NOT NULL DEFAULT '0',
  `created` int(11) NOT NULL,
  `modified` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=29 ;

-- --------------------------------------------------------

--
-- Table structure for table `group_member`
--

CREATE TABLE IF NOT EXISTS `group_member` (
`id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created` int(11) NOT NULL,
  `modified` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=96 ;

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE IF NOT EXISTS `message` (
`id` int(11) NOT NULL,
  `chat_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  `text` varchar(1000) NOT NULL,
  `file_id` varchar(255) NOT NULL,
  `thumb_id` varchar(255) NOT NULL,
  `longitude` varchar(512) NOT NULL,
  `latitude` varchar(512) NOT NULL,
  `is_deleted` int(11) NOT NULL DEFAULT '0',
  `child_list` varchar(255) NOT NULL,
  `root_id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `created` int(11) NOT NULL,
  `modified` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2134 ;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
`id` int(11) NOT NULL,
  `outside_id` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `token_timestamp` int(11) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `image_thumb` varchar(255) NOT NULL,
  `details` varchar(1000) NOT NULL,
  `android_push_token` varchar(255) NOT NULL,
  `ios_push_token` varchar(255) NOT NULL,
  `is_deleted` int(11) NOT NULL DEFAULT '0',
  `created` int(11) NOT NULL,
  `modified` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=201281 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chat`
--
ALTER TABLE `chat`
 ADD PRIMARY KEY (`id`), ADD KEY `group_id` (`group_id`);

--
-- Indexes for table `chat_member`
--
ALTER TABLE `chat_member`
 ADD PRIMARY KEY (`id`), ADD KEY `user_id` (`user_id`), ADD KEY `chat_id` (`chat_id`);

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `group_member`
--
ALTER TABLE `group_member`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
 ADD PRIMARY KEY (`id`), ADD KEY `chat_id` (`chat_id`), ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
 ADD PRIMARY KEY (`id`), ADD KEY `outside_id` (`outside_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `chat`
--
ALTER TABLE `chat`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=409;
--
-- AUTO_INCREMENT for table `chat_member`
--
ALTER TABLE `chat_member`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=1207;
--
-- AUTO_INCREMENT for table `groups`
--
ALTER TABLE `groups`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=29;
--
-- AUTO_INCREMENT for table `group_member`
--
ALTER TABLE `group_member`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=96;
--
-- AUTO_INCREMENT for table `message`
--
ALTER TABLE `message`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2134;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=201281;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
