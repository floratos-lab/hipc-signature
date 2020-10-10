-- get numbers of some key data items
select count(*) as submission from submission;
select count(*) as 'observation template' from observation_template;
select count(*) as observation from observation;
select count(*) as 'observed evidence role' from observed_evidence_role;
select count(*) as 'observed subject role' from observed_subject_role
