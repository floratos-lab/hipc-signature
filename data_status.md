# number of objects

although these numbers only refelect the current state temporarily, they are highly relevant for performance and many other crucial behavior of the system

the numbers of observations in each submission are very different. the unusual large numbers can cause serious performance problem in the loading process and application

## background data
* Subject 2,709,684
* SubjectWithOrgamism 306,280
* TissueSample 11,550
* Vaccine 6,478
* CellSubset 9,736
* Pathogen 2,241,109
* Compound 815

## submission data
* Submission 665
* ObservationTemplate 665
* ObservedSubject 268,133
* ObservedEvidence 1,565,556
* Observations 47,418
    * observation numbers per submission (descending ordered above 100)

| count | submission_id |
|-------|---------------|
|  2036 |       4633288 |
|  1994 |       4687914 |
|  1892 |       4679778 |
|  1576 |       4607383 |
|  1250 |       4564573 |
|  1219 |       4442330 |
|  1017 |       4617636 |
|  1012 |       4380667 |
|   977 |       4618591 |
|   917 |       4217900 |
|   910 |       4480944 |
|   848 |       4678587 |
|   753 |       4491472 |
|   744 |       4684401 |
|   691 |       4618597 |
|   682 |       4680284 |
|   661 |       4341998 |
|   642 |       4584849 |
|   641 |       4497780 |
|   626 |       4215530 |
|   589 |       4561226 |
|   583 |       4679384 |
|   563 |       4396328 |
|   488 |       4665602 |
|   480 |       4436193 |
|   478 |       4671767 |
|   477 |       4379744 |
|   448 |       4526920 |
|   439 |       4684420 |
|   435 |       4494448 |
|   428 |       4463117 |
|   400 |       4436559 |
|   400 |       4627619 |
|   394 |       4633810 |
|   378 |       4581825 |
|   377 |       4663819 |
|   370 |       4643289 |
|   369 |       4652694 |
|   364 |       4495330 |
|   355 |       4477004 |
|   347 |       4671795 |
|   325 |       4360945 |
|   295 |       4451817 |
|   294 |       4167267 |
|   293 |       4641616 |
|   292 |       4495301 |
|   287 |       4622164 |
|   285 |       4684408 |
|   277 |       4473840 |
|   270 |       4229776 |
|   268 |       4439317 |
|   264 |       4507743 |
|   260 |       4689700 |
|   258 |       4477491 |
|   256 |       4479364 |
|   249 |       4330342 |
|   245 |       4605328 |
|   244 |       4543382 |
|   231 |       4474745 |
|   226 |       4299607 |
|   221 |       4585534 |
|   219 |       4433880 |
|   200 |       4204306 |
|   196 |       4216755 |
|   196 |       4659933 |
|   191 |       4676964 |
|   190 |       4648356 |
|   181 |       4177944 |
|   174 |       4377948 |
|   171 |       4625343 |
|   171 |       4627644 |
|   166 |       4312148 |
|   159 |       4469895 |
|   148 |       4678611 |
|   146 |       4319282 |
|   143 |       4674346 |
|   138 |       4183025 |
|   136 |       4684256 |
|   131 |       4446180 |
|   129 |       4684019 |
|   128 |       4676383 |
|   127 |       4601571 |
|   127 |       4686553 |
|   121 |       4679386 |
|   119 |       4381211 |
|   111 |       4667801 |
|   111 |       4681657 |
|   110 |       4394421 |
|   110 |       4603148 |
|   110 |       4671781 |
|   107 |       4531747 |
|   104 |       4669830 |
|   101 |       4673467 |

## SQL commands to get the numbers

```sql
-- background data
select count(*) from subject;
select count(*) from subject_with_organism;
select count(*) from tissue_sample;
select count(*) from vaccine;
select count(*) from cellsubset;
select count(*) from pathogen;
select count(*) from compound;
-- submission data
select count(*) from submission;
select count(*) from observation_template;
select count(*) from observation;
select count(*) from observation group by observation_template_id;
select count(*) from observed_subject;
select count(*) from observed_evidence;
select count(*) count, submission_id from observation group by submission_id order by count desc;
select count(*) count from expanded_summary;
```