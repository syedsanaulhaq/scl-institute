-- Fix DECIMAL precision for mdl_customfield_data.decvalue
-- The original DECIMAL(10,5) can only hold values up to 99999.99999
-- which is insufficient for tuition fees and other monetary amounts

ALTER TABLE mdl_customfield_data
  MODIFY COLUMN decvalue DECIMAL(15,2) DEFAULT NULL;

-- Drop and recreate the index to ensure it works with the new column definition
ALTER TABLE mdl_customfield_data
  DROP KEY mdl_custdata_fiedec_ix,
  ADD KEY mdl_custdata_fiedec_ix (fieldid, decvalue);

-- Verify the change
DESC mdl_customfield_data;
