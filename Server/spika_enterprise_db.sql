-- phpMyAdmin SQL Dump
-- version 4.2.7.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Mar 13, 2015 at 10:00 AM
-- Server version: 5.5.38-0ubuntu0.14.04.1
-- PHP Version: 5.5.9-1ubuntu4.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `clover`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE IF NOT EXISTS `categories` (
`id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 NOT NULL,
  `organization_id` int(11) NOT NULL DEFAULT '1',
  `is_deleted` int(11) NOT NULL DEFAULT '0',
  `modified` int(11) NOT NULL,
  `created` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

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
  `is_private` int(11) NOT NULL DEFAULT '0',
  `password` varchar(255) NOT NULL,
  `group_ids` varchar(255) NOT NULL,
  `room_ids` varchar(255) NOT NULL,
  `created` int(11) NOT NULL,
  `modified` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL DEFAULT '1',
  `notes` text NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

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
  `modified` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL DEFAULT '1',
  `did_sent` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `device`
--

CREATE TABLE IF NOT EXISTS `device` (
`id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` int(11) NOT NULL COMMENT '1:web,2:iOS,3:Android',
  `device_token` varchar(255) NOT NULL,
  `user_token` varchar(255) NOT NULL,
  `is_valid` int(11) NOT NULL COMMENT '1:valid,0:invalid',
  `modified` int(11) NOT NULL,
  `created` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE IF NOT EXISTS `files` (
`id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `chat_id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `size` int(11) NOT NULL,
  `created` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

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
  `modified` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL DEFAULT '1'
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `group_member`
--

CREATE TABLE IF NOT EXISTS `group_member` (
`id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created` int(11) NOT NULL,
  `modified` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL DEFAULT '1'
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `information`
--

CREATE TABLE IF NOT EXISTS `information` (
`id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `title` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `body` text CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `is_deleted` int(11) NOT NULL,
  `modified` int(11) NOT NULL,
  `created` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE IF NOT EXISTS `message` (
`id` int(11) NOT NULL,
  `chat_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  `text` text NOT NULL,
  `file_id` varchar(255) NOT NULL,
  `thumb_id` varchar(255) NOT NULL,
  `longitude` varchar(512) NOT NULL,
  `latitude` varchar(512) NOT NULL,
  `is_deleted` int(11) NOT NULL DEFAULT '0',
  `child_list` varchar(255) NOT NULL,
  `root_id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `created` int(11) NOT NULL,
  `modified` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL DEFAULT '1',
  `attributes` text NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `organization`
--

CREATE TABLE IF NOT EXISTS `organization` (
`id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(255) NOT NULL,
  `admin_name` varchar(255) NOT NULL,
  `admin_password` varchar(255) NOT NULL,
  `email_verified` int(11) NOT NULL DEFAULT '0',
  `email_verification_code` varchar(255) NOT NULL,
  `max_users` int(11) NOT NULL DEFAULT '100',
  `max_groups` int(11) NOT NULL DEFAULT '100',
  `max_rooms` int(11) NOT NULL DEFAULT '100',
  `disk_quota` int(11) NOT NULL DEFAULT '10',
  `is_deleted` int(11) NOT NULL DEFAULT '0',
  `modified` int(11) NOT NULL,
  `created` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=212 ;

-- --------------------------------------------------------

--
-- Table structure for table `sticker`
--

CREATE TABLE IF NOT EXISTS `sticker` (
`id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `is_deleted` int(11) NOT NULL DEFAULT '0',
  `created` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
`id` int(11) NOT NULL,
  `master_user_id` int(11) NOT NULL,
  `registration_code` varchar(32) NOT NULL,
  `outside_id` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `token_timestamp` int(11) NOT NULL,
  `last_device_id` int(11) NOT NULL DEFAULT '0',
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `temp_password` varchar(255) NOT NULL,
  `temp_password_timestamp` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `image_thumb` varchar(255) NOT NULL,
  `details` varchar(1000) NOT NULL,
  `web_opened` int(11) NOT NULL DEFAULT '0',
  `web_lastkeepalive` int(11) NOT NULL DEFAULT '0',
  `is_deleted` int(11) NOT NULL DEFAULT '0',
  `is_valid` int(11) NOT NULL DEFAULT '0',
  `created` int(11) NOT NULL,
  `modified` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL DEFAULT '1',
  `is_admin` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `user_details`
--

CREATE TABLE IF NOT EXISTS `user_details` (
`id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL DEFAULT '0',
  `is_default` int(11) NOT NULL DEFAULT '0',
  `key` varchar(100) NOT NULL,
  `label` varchar(100) NOT NULL,
  `keyboard_type` int(11) NOT NULL DEFAULT '3',
  `is_deleted` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `user_mst`
--

CREATE TABLE IF NOT EXISTS `user_mst` (
`id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `temp_password` varchar(255) NOT NULL,
  `temp_password_timestamp` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified` int(11) NOT NULL DEFAULT '0',
  `is_deleted` int(11) NOT NULL DEFAULT '0',
  `modified` int(11) NOT NULL,
  `created` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;


CREATE TABLE IF NOT EXISTS `message_log` (
`id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` int(11) NOT NULL COMMENT '1: send 2: read',
  `chat_id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `created` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;


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
-- Indexes for table `device`
--
ALTER TABLE `device`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `files`
--
ALTER TABLE `files`
 ADD PRIMARY KEY (`id`), ADD KEY `user_id` (`user_id`,`chat_id`), ADD KEY `organization_id` (`organization_id`);

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
-- Indexes for table `information`
--
ALTER TABLE `information`
 ADD PRIMARY KEY (`id`), ADD KEY `organization_id` (`organization_id`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
 ADD PRIMARY KEY (`id`), ADD KEY `chat_id` (`chat_id`), ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `organization`
--
ALTER TABLE `organization`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sticker`
--
ALTER TABLE `sticker`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
 ADD PRIMARY KEY (`id`), ADD KEY `outside_id` (`outside_id`), ADD KEY `master_user_id` (`master_user_id`);

--
-- Indexes for table `user_details`
--
ALTER TABLE `user_details`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_mst`
--
ALTER TABLE `user_mst`
 ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=67;
--
-- AUTO_INCREMENT for table `chat`
--
ALTER TABLE `chat`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=1375;
--
-- AUTO_INCREMENT for table `chat_member`
--
ALTER TABLE `chat_member`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4258;
--
-- AUTO_INCREMENT for table `device`
--
ALTER TABLE `device`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=276;
--
-- AUTO_INCREMENT for table `files`
--
ALTER TABLE `files`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=370;
--
-- AUTO_INCREMENT for table `groups`
--
ALTER TABLE `groups`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=97;
--
-- AUTO_INCREMENT for table `group_member`
--
ALTER TABLE `group_member`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=249;
--
-- AUTO_INCREMENT for table `information`
--
ALTER TABLE `information`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT for table `message`
--
ALTER TABLE `message`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=14995;
--
-- AUTO_INCREMENT for table `organization`
--
ALTER TABLE `organization`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=212;
--
-- AUTO_INCREMENT for table `sticker`
--
ALTER TABLE `sticker`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=35;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=201548;
--
-- AUTO_INCREMENT for table `user_details`
--
ALTER TABLE `user_details`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=32;
--
-- AUTO_INCREMENT for table `user_mst`
--
ALTER TABLE `user_mst`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=249;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
