-- this script adds submission centers to the database
USE hip_signature;

DELIMITER //
CREATE PROCEDURE addSubmissionCenter(IN center_name TEXT)
BEGIN
    SELECT MAX(id)+1 into @id FROM dashboard_entity;
    INSERT INTO dashboard_entity (id, displayName) VALUES ( @id, center_name );
    INSERT INTO submission_center (id) VALUES (@id);
END//
DELIMITER ;

CALL addSubmissionCenter("Boston Children's Hospital");
CALL addSubmissionCenter("Center for Infectious Disease Research");
CALL addSubmissionCenter("Columbia University");
CALL addSubmissionCenter("Drexel University");
CALL addSubmissionCenter('Emory University');
CALL addSubmissionCenter('Icahn School of Medicine at Mount Sinai');
CALL addSubmissionCenter('La Jolla Institute for Allergy and Immunology');
CALL addSubmissionCenter('University of California Los Angeles');
CALL addSubmissionCenter('Yale University');
