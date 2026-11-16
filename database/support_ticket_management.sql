-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 16, 2026 at 12:16 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `support_ticket_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `assets`
--

CREATE TABLE `assets` (
  `id` int(11) NOT NULL,
  `asset_tag` varchar(50) NOT NULL,
  `asset_type` varchar(100) NOT NULL,
  `serial_number` varchar(150) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `assigned_user_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `warranty_expiry` date DEFAULT NULL,
  `status` enum('Available','Assigned','Maintenance','Retired') DEFAULT 'Available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `created_at`) VALUES
(1, 2, 'User Role Changed', 'users', 1, NULL, '2026-09-10 10:12:04'),
(2, 2, 'User Password Changed', 'users', 1, NULL, '2026-09-10 10:15:43'),
(3, 2, 'User Status Changed', 'users', 1, NULL, '2026-09-10 10:17:41'),
(4, 2, 'User Status Changed', 'users', 1, NULL, '2026-09-10 10:17:59'),
(5, 2, 'User Password Changed', 'users', 1, NULL, '2026-09-21 09:38:50'),
(6, 2, 'User Status Changed', 'users', 1, NULL, '2026-09-29 05:38:26'),
(7, 2, 'User Status Changed', 'users', 1, NULL, '2026-09-29 05:38:27'),
(8, 2, 'User Status Changed', 'users', 1, NULL, '2026-09-29 05:38:29'),
(9, 2, 'User Status Changed', 'users', 1, NULL, '2026-09-29 05:38:30'),
(10, 3, 'Ticket Created', 'tickets', 3, '::1', '2026-11-16 05:48:04'),
(11, 3, 'Ticket Created', 'tickets', 4, '::1', '2026-11-16 05:55:53'),
(12, 1, 'Ticket Status Updated', 'tickets', 4, '::1', '2026-11-16 07:45:23'),
(13, 3, 'Ticket Created', 'tickets', 5, '::1', '2026-11-16 07:53:23'),
(14, 2, 'Ticket Assigned', 'tickets', 5, '::1', '2026-11-16 08:13:07'),
(15, 2, 'User Status Changed', 'users', 3, NULL, '2026-11-16 10:15:42'),
(16, 2, 'User Status Changed', 'users', 3, NULL, '2026-11-16 10:16:01');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `department_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `department_name`) VALUES
(4, 'Accounts'),
(5, 'Administration'),
(3, 'Finance'),
(2, 'Human Resources'),
(1, 'IT Support');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, 3, 'Ticket created', 'Your ticket TKT-486149 has been created successfully.', 1, '2026-11-16 05:48:04'),
(2, 3, 'Ticket created', 'Your ticket TKT-760751 has been created successfully.', 1, '2026-11-16 05:55:53'),
(3, 3, 'Ticket status updated', 'Ticket TKT-760751 status changed from Open to Resolved.', 1, '2026-11-16 07:45:23'),
(4, 1, 'New Ticket Created', 'A new ticket TKT-390543 - Change PC password has been created.', 0, '2026-11-16 07:53:23'),
(5, 2, 'New Ticket Created', 'A new ticket TKT-390543 - Change PC password has been created.', 0, '2026-11-16 07:53:23'),
(6, 3, 'New Ticket Created', 'A new ticket TKT-390543 - Change PC password has been created.', 0, '2026-11-16 07:53:23'),
(7, 1, 'New Ticket Assigned', 'Ticket TKT-390543 has been assigned to you.', 0, '2026-11-16 08:13:07');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_name`) VALUES
(4, 'admin'),
(2, 'agent'),
(1, 'employee'),
(3, 'manager'),
(5, 'super_admin');

-- --------------------------------------------------------

--
-- Table structure for table `sla_policies`
--

CREATE TABLE `sla_policies` (
  `id` int(11) NOT NULL,
  `priority` varchar(30) NOT NULL,
  `response_time_minutes` int(11) NOT NULL,
  `resolution_time_minutes` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sla_policies`
--

INSERT INTO `sla_policies` (`id`, `priority`, `response_time_minutes`, `resolution_time_minutes`) VALUES
(1, 'Low', 480, 2880),
(2, 'Medium', 240, 1440),
(3, 'High', 60, 480),
(4, 'Critical', 15, 120);

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int(11) NOT NULL,
  `ticket_number` varchar(30) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `priority` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `status` enum('Open','Assigned','In Progress','Pending User','Pending Vendor','Resolved','Closed','Reopened') DEFAULT 'Open',
  `requester_id` int(11) NOT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `resolved_at` datetime DEFAULT NULL,
  `closed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `ticket_number`, `subject`, `description`, `category_id`, `priority`, `status`, `requester_id`, `assigned_to`, `department_id`, `location`, `created_at`, `updated_at`, `resolved_at`, `closed_at`) VALUES
(1, 'TKT-1789032001462', 'Computer not working', 'My desktop computer is not turning on.', 1, 'High', 'Assigned', 2, 1, 1, 'Head Office', '2026-09-10 09:20:01', '2026-09-29 06:13:50', '2026-09-21 15:59:09', '2026-09-21 16:07:48'),
(2, 'TKT-289787', 'Change PC password', 'PC Ip: 192.168.169.4', 1, 'Medium', 'Assigned', 3, 1, NULL, 'Head Office', '2026-09-29 06:51:22', '2026-09-30 06:55:13', NULL, NULL),
(3, 'TKT-486149', 'Change PC password', 'EMployee ID: 20261116001', 1, 'High', 'Open', 3, NULL, NULL, 'Head Office', '2026-11-16 05:48:04', '2026-11-16 05:48:04', NULL, NULL),
(4, 'TKT-760751', 'Change PC password', 'EID: 20261116002', 1, 'High', 'Closed', 3, NULL, NULL, NULL, '2026-11-16 05:55:53', '2026-11-16 07:48:21', '2026-11-16 13:45:23', '2026-11-16 13:48:21'),
(5, 'TKT-390543', 'Change PC password', 'EID: 20261116003', 1, 'High', 'Assigned', 3, 1, NULL, NULL, '2026-11-16 07:53:23', '2026-11-16 08:13:07', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ticket_categories`
--

CREATE TABLE `ticket_categories` (
  `id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticket_categories`
--

INSERT INTO `ticket_categories` (`id`, `category_name`) VALUES
(6, 'Access & Permission'),
(4, 'Email'),
(1, 'Hardware'),
(3, 'Network'),
(8, 'Other'),
(5, 'Printer'),
(7, 'Security'),
(2, 'Software');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_comments`
--

CREATE TABLE `ticket_comments` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `is_internal` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticket_comments`
--

INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `comment`, `is_internal`, `created_at`) VALUES
(1, 1, 2, 'I have restarted the computer, but the problem still exists.', 0, '2026-09-10 09:30:42'),
(2, 2, 3, 'asdf', 0, '2026-09-29 07:03:45'),
(3, 2, 3, 'please solve the same problem', 0, '2026-09-30 05:49:02');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_history`
--

CREATE TABLE `ticket_history` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticket_history`
--

INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `action`, `old_value`, `new_value`, `created_at`) VALUES
(1, 1, 2, 'Ticket Created', NULL, 'Open', '2026-09-10 09:20:01'),
(2, 1, 2, 'Status Updated', 'Open', 'Pending User', '2026-09-10 09:35:15'),
(3, 1, 2, 'Ticket Assigned', NULL, '1', '2026-09-21 09:45:12'),
(4, 1, 1, 'Status Updated', 'Assigned', 'In Progress', '2026-09-21 09:54:39'),
(5, 1, 1, 'Status Updated', 'In Progress', 'Resolved', '2026-09-21 09:55:22'),
(6, 1, 1, 'Status Updated', 'Resolved', 'Resolved', '2026-09-21 09:59:09'),
(7, 1, 2, 'Ticket Closed', 'Resolved', 'Closed', '2026-09-21 10:07:48'),
(8, 1, 2, 'Ticket Assigned', '1', '1', '2026-09-29 06:13:50'),
(9, 2, 3, 'Ticket Created', NULL, 'Open', '2026-09-29 06:51:22'),
(10, 2, 2, 'Ticket Assigned', NULL, '1', '2026-09-29 07:11:04'),
(11, 2, 1, 'Status Updated', 'Assigned', 'Resolved', '2026-09-29 10:40:05'),
(12, 2, 2, 'Ticket Closed', 'Resolved', 'Closed', '2026-09-30 05:21:12'),
(13, 2, 3, 'Status Updated', 'Closed', 'Reopened', '2026-09-30 05:48:47'),
(14, 2, 2, 'Ticket Assigned', '1', '1', '2026-09-30 06:55:13'),
(15, 3, 3, 'Ticket Created', NULL, 'Open', '2026-11-16 05:48:04'),
(16, 4, 3, 'Ticket Created', NULL, 'Open', '2026-11-16 05:55:53'),
(17, 4, 1, 'Status Updated', 'Open', 'Resolved', '2026-11-16 07:45:23'),
(18, 4, 2, 'Ticket Closed', 'Resolved', 'Closed', '2026-11-16 07:48:21'),
(19, 5, 3, 'Ticket Created', NULL, 'Open', '2026-11-16 07:53:23'),
(20, 5, 2, 'Ticket Assigned', NULL, '1', '2026-11-16 08:13:07');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `role_id` int(11) DEFAULT 1,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `employee_id`, `department_id`, `role_id`, `status`, `created_at`) VALUES
(1, 'Test User', 'testuser@gmail.com', '$2b$10$bzZ18k5E0sLwmySk.kdwuOIBZOzWo7i2CZeW3OicUdbWpXXjCqSgq', '01700000000', 'EMP001', 1, 2, 'Active', '2026-09-10 06:12:02'),
(2, 'Test User 2', 'testuser2@gmail.com', '$2b$10$vfQxPnBErmRbp0XryB51oueac/PoIKbsIewUhf3e3c6Y0BMyuKtN2', '01700000001', 'EMP002', 1, 5, 'Active', '2026-09-10 06:15:40'),
(3, 'Md Almasum', 'almasum@gmail.com', '$2b$10$lKAnKuk0OShspYHiezNLSOqDZgaEtA1gE9nPtIIeGZa2IVxIAaRw6', '01700000000', '20240919001', NULL, 1, 'Active', '2026-09-29 06:34:07');

-- --------------------------------------------------------

--
-- Table structure for table `user_settings`
--

CREATE TABLE `user_settings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ticket_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `email_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `system_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `language` varchar(30) NOT NULL DEFAULT 'English',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_settings`
--

INSERT INTO `user_settings` (`id`, `user_id`, `ticket_notifications`, `email_notifications`, `system_notifications`, `language`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 1, 1, 'English', '2026-11-16 05:43:45', '2026-11-16 05:44:49'),
(7, 3, 1, 1, 1, 'English', '2026-11-16 05:45:20', '2026-11-16 05:45:24');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `asset_tag` (`asset_tag`),
  ADD KEY `assigned_user_id` (`assigned_user_id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `department_name` (`department_name`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `sla_policies`
--
ALTER TABLE `sla_policies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `priority` (`priority`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ticket_number` (`ticket_number`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `requester_id` (`requester_id`),
  ADD KEY `assigned_to` (`assigned_to`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `ticket_categories`
--
ALTER TABLE `ticket_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `category_name` (`category_name`);

--
-- Indexes for table `ticket_comments`
--
ALTER TABLE `ticket_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `ticket_history`
--
ALTER TABLE `ticket_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_settings_user` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assets`
--
ALTER TABLE `assets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sla_policies`
--
ALTER TABLE `sla_policies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `ticket_categories`
--
ALTER TABLE `ticket_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `ticket_comments`
--
ALTER TABLE `ticket_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `ticket_history`
--
ALTER TABLE `ticket_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_settings`
--
ALTER TABLE `user_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assets`
--
ALTER TABLE `assets`
  ADD CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`assigned_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `assets_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `ticket_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tickets_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tickets_ibfk_4` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `ticket_comments`
--
ALTER TABLE `ticket_comments`
  ADD CONSTRAINT `ticket_comments_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ticket_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ticket_history`
--
ALTER TABLE `ticket_history`
  ADD CONSTRAINT `ticket_history_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ticket_history_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `fk_user_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
