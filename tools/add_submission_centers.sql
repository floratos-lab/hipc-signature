-- this script adds submission centers to the database
SET @center_name = "Boston Children's Hospital";
SELECT MAX(id)+1 into @id FROM dashboard_entity;
INSERT INTO dashboard_entity (id, displayName) VALUES ( @id, @center_name );
INSERT INTO submission_center (id) VALUES (@id);

SET @center_name = 'Columbia University';
SELECT MAX(id)+1 into @id FROM dashboard_entity;
INSERT INTO dashboard_entity (id, displayName) VALUES ( @id, @center_name );
INSERT INTO submission_center (id) VALUES (@id);

SET @center_name = 'Emory University';
SELECT MAX(id)+1 into @id FROM dashboard_entity;
INSERT INTO dashboard_entity (id, displayName) VALUES ( @id, @center_name );
INSERT INTO submission_center (id) VALUES (@id);

SET @center_name = 'Icahn School of Medicine at Mount Sinai';
SELECT MAX(id)+1 into @id FROM dashboard_entity;
INSERT INTO dashboard_entity (id, displayName) VALUES ( @id, @center_name );
INSERT INTO submission_center (id) VALUES (@id);

SET @center_name = 'La Jolla Institute for Allergy and Immunology';
SELECT MAX(id)+1 into @id FROM dashboard_entity;
INSERT INTO dashboard_entity (id, displayName) VALUES ( @id, @center_name );
INSERT INTO submission_center (id) VALUES (@id);

SET @center_name = 'Yale University';
SELECT MAX(id)+1 into @id FROM dashboard_entity;
INSERT INTO dashboard_entity (id, displayName) VALUES ( @id, @center_name );
INSERT INTO submission_center (id) VALUES (@id);
