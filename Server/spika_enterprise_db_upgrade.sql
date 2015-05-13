ALTER TABLE `categories` ADD `organization_id` INT NOT NULL DEFAULT '1' ;
ALTER TABLE `chat` ADD `organization_id` INT NOT NULL DEFAULT '1' ;
ALTER TABLE `chat_member` ADD `organization_id` INT NOT NULL DEFAULT '1' ;
ALTER TABLE `groups` ADD `organization_id` INT NOT NULL DEFAULT '1' ;
ALTER TABLE `group_member` ADD `organization_id` INT NOT NULL DEFAULT '1' ;
ALTER TABLE `message` ADD `organization_id` INT NOT NULL DEFAULT '1' ;
ALTER TABLE `user` ADD `organization_id` INT NOT NULL DEFAULT '1' ;
