-- Migration: Add profile extension columns to student_applications
-- Run this on any environment where these columns are missing.
-- Safe to run once; will error if columns already exist (just skip if so).

ALTER TABLE student_applications
  ADD COLUMN emergency_contact_name         VARCHAR(255) NULL,
  ADD COLUMN emergency_contact_relationship VARCHAR(100) NULL,
  ADD COLUMN emergency_contact_phone        VARCHAR(30)  NULL,
  ADD COLUMN emergency_contact_email        VARCHAR(255) NULL,
  ADD COLUMN next_of_kin_name               VARCHAR(255) NULL,
  ADD COLUMN next_of_kin_relationship       VARCHAR(100) NULL,
  ADD COLUMN next_of_kin_phone              VARCHAR(30)  NULL,
  ADD COLUMN next_of_kin_email              VARCHAR(255) NULL,
  ADD COLUMN next_of_kin_address            TEXT         NULL,
  ADD COLUMN passport_number                VARCHAR(50)  NULL,
  ADD COLUMN passport_expiry_date           DATE         NULL,
  ADD COLUMN visa_status                    VARCHAR(100) NULL,
  ADD COLUMN visa_expiry_date               DATE         NULL,
  ADD COLUMN brp_number                     VARCHAR(50)  NULL,
  ADD COLUMN brp_expiry_date                DATE         NULL;
