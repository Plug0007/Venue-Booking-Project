-- schema.sql

CREATE DATABASE IF NOT EXISTS venue_booking;
USE venue_booking;

-- Update venues to reflect college/classroom spaces
CREATE TABLE IF NOT EXISTS venues (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

INSERT INTO venues (id, name) VALUES
(1, 'Class X1 Seminar Hall'),
(2, 'Auditorium'),
(3, 'Computer Lab'),
(4, 'Lecture Hall'),
(5, 'Conference Room'),
(6, 'Classroom A'),
(7, 'Classroom B'),
(8, 'Library'),
(9, 'Science Lab'),
(10, 'Arts Studio'),
(11, 'Engineering Workshop'),
(12, 'Business Center'),
(13, 'Music Room'),
(14, 'Dance Studio'),
(15, 'Sports Hall');

-- Update bookings: replace birth_date with booking_time (TIME type)
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venue_id INT,
  booking_date DATE,
  name VARCHAR(100),
  booking_time TIME,
  confirmed TINYINT(1) DEFAULT 0,
  FOREIGN KEY (venue_id) REFERENCES venues(id)
);
