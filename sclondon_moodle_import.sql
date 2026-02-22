-- SCLondon Actual Courses Import
USE bitnami_moodle;

-- Delete old incorrect courses
DELETE FROM mdl_course WHERE id > 1;

SET @sort := 0;

INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'BSC (Hons) Business Management offered with Foundation Year', 'SCL-BSC-HONS-BUSINESS-MANAGEMENT-OFFERED-WITH-FOU', 'SCL-BSC-HONS-BUSINESS-MANAGEMENT-OFFERED-WITH-FOU',
    'Why Study Business Management with Foundation Year? &nbsp; Our course will introduce you to different organisations and external environments, so you can understand how they operate and managed as businesses. It is practical in nature, which allows you to begin building your know', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'BTEC Higher National Certificate (1 Year)', 'SCL-BTEC-HIGHER-NATIONAL-CERTIFICATE-1-YEAR', 'SCL-BTEC-HIGHER-NATIONAL-CERTIFICATE-1-YEAR',
    'The HNC is a level 4 qualification delivered over 1 year. The HNC is an embedded component of the HND, however, it can be taken as a stand- alone qualification. If a student opts to take the HNC they would be eligible to gain a National Certificate after successful completion of', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'BTEC Higher National Diploma (2 Years)', 'SCL-BTEC-HIGHER-NATIONAL-DIPLOMA-2-YEARS', 'SCL-BTEC-HIGHER-NATIONAL-DIPLOMA-2-YEARS',
    'The HND is a level 5 qualification delivered over 2 years, the first year at level 4 and the second year at level 5. If a student opts to take the HND they would be eligible to gain a Higher National Diploma after successful completion of a minimum of 16 units.The Higher National', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'Extended Diploma In Strategic Management and leadership (QCF) Edexcel Level 7', 'SCL-EXTENDED-DIPLOMA-IN-STRATEGIC-MANAGEMENT-AND', 'SCL-EXTENDED-DIPLOMA-IN-STRATEGIC-MANAGEMENT-AND',
    'Edexcel is the UK?s largest awarding body, offering academic and vocational qualifications to more than 25,000 schools, colleges, employers and other places of learning in the UK and in over 100 countries worldwide. Edexcel qualifications are recognised by employers and higher ed', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'GCSE / GCE ? A LEVEL COURSES', 'SCL-GCSE-GCE-A-LEVEL-COURSES', 'SCL-GCSE-GCE-A-LEVEL-COURSES',
    '&nbsp; STRATFORD TUITION CENTRE &nbsp; Private Tutoring &nbsp; Our private tutoring program provides students the personal attention and focus their need for academic success in core subjects. In private (one-to-one) or small group sessions, our experienced tutors coach each stud', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'Higher National Diploma in International Travel &amp; Tourism Management', 'SCL-HIGHER-NATIONAL-DIPLOMA-IN-INTERNATIONAL-TRAV', 'SCL-HIGHER-NATIONAL-DIPLOMA-IN-INTERNATIONAL-TRAV',
    'Pearson BTEC HND (Level 4/5) Awarding Body: Pearson Education Mode: Full time Duration: 2 Years Stratford College London Academic Board recommends this programme specification. However, this specification is designed in relation to the UK Quality Code for Higher Education, making', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'HNC/HND Administration and Information Technology (SQA)', 'SCL-HNC-HND-ADMINISTRATION-AND-INFORMATION-TECHNO', 'SCL-HNC-HND-ADMINISTRATION-AND-INFORMATION-TECHNO',
    'The HNC and HND in Administration and Information Technology provide candidates with a progression route into employment in a general administrative role in small to medium enterprises. It also provides opportunities to develop the skills and knowledge required for more specialis', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'HND HOSPITALITY MANAGEMENT', 'SCL-HND-HOSPITALITY-MANAGEMENT', 'SCL-HND-HOSPITALITY-MANAGEMENT',
    'The Higher National Diploma in Hospitality Management (HND) is a vocational course. This means that not only do you learn the theoretical aspects but it also provides you with ability to relate this to the real world of work. Evaluating the application of these theories and conce', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'HND IN BUSINESS RQF', 'SCL-HND-IN-BUSINESS-RQF', 'SCL-HND-IN-BUSINESS-RQF',
    'Pearson BTEC Level 5 Higher National Diploma in Business (Business Management) (RQF) Course ID --> Course Name ECLHNBM04-RQF --> Pearson BTEC Level 5 Higher National Diploma in Business (Business Management) (RQF) &nbsp; Awarding Body: Pearson Duration: 24 Months RQF Level: 5 Cre', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'HND in Hospitality Management', 'SCL-HND-IN-HOSPITALITY-MANAGEMENT', 'SCL-HND-IN-HOSPITALITY-MANAGEMENT',
    'Purpose of the BTEC Higher Nationals in Hospitality Management The purpose of BTEC Higher Nationals in Hospitality Management is to develop students as professional, self-reflecting individuals able to meet the demands of employers in Hospitality Management and adapt to a constan', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'HND in Leadership and Management for England Course', 'SCL-HND-IN-LEADERSHIP-AND-MANAGEMENT-FOR-ENGLAND', 'SCL-HND-IN-LEADERSHIP-AND-MANAGEMENT-FOR-ENGLAND',
    'Introduction &nbsp; Pearson awards are work-related qualifications for students taking their first steps into employment, or for those already in employment and seeking career development opportunities. Such awards provide progression into the workplace either directly or via stu', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'NCFE &#8211; QUALIFICATIONS', 'SCL-NCFE-8211-QUALIFICATIONS', 'SCL-NCFE-8211-QUALIFICATIONS',
    'NCFE is the UK?s longest established awarding body, recognized in the field of education as a highly professional and responsive organization, committed to maintaining excellent customer service and a friendly approach. &nbsp; *Course commencement ? Subject to number of student a', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'NCFE Level 1 ? Award in Travel &#038; Tourism', 'SCL-NCFE-LEVEL-1-AWARD-IN-TRAVEL-038-TOURISM', 'SCL-NCFE-LEVEL-1-AWARD-IN-TRAVEL-038-TOURISM',
    '&nbsp; Introduction &nbsp; These qualifications aim to: provide learners with an understanding of the basic principles of the travel and tourism industry and allows them to explore the various avenues of work within this industry. allow learners to gain transferrable skills that', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'NCFE Level 1 ? Certificate in Hospitality &#038; Catering Management', 'SCL-NCFE-LEVEL-1-CERTIFICATE-IN-HOSPITALITY-038-C', 'SCL-NCFE-LEVEL-1-CERTIFICATE-IN-HOSPITALITY-038-C',
    'Introduction &nbsp; The Level 1 Certificate in Hospitality &amp; Catering is a joint development between NCFE and Network Training Publishing. The Level 1 Certificate in Hospitality &amp; Catering is suitable as an introduction for people who wish to access training in Hospitalit', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'NCFE Level 1 Certificate in Travel and Tourism', 'SCL-NCFE-LEVEL-1-CERTIFICATE-IN-TRAVEL-AND-TOURIS', 'SCL-NCFE-LEVEL-1-CERTIFICATE-IN-TRAVEL-AND-TOURIS',
    'Introduction &nbsp; These qualifications aim to: provide learners with an understanding of the basic principles of the travel and tourism industry and allows them to explore the various avenues of work within this industry. allow learners to gain transferrable skills that can be', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'NCFE Level 2 ? Certificate for Airline Cabin Crew', 'SCL-NCFE-LEVEL-2-CERTIFICATE-FOR-AIRLINE-CABIN-CR', 'SCL-NCFE-LEVEL-2-CERTIFICATE-FOR-AIRLINE-CABIN-CR',
    'Introduction &nbsp; The Level 2 Certificate in Cabin Crew prepares learners for entry to airline industry training. It is not intended as a replacement to the training given by airlines upon the receuirement of new cabin crew staff. This qualifications provides the basic backgrou', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'NCFE Level 2 Award for Resort Representatives', 'SCL-NCFE-LEVEL-2-AWARD-FOR-RESORT-REPRESENTATIVES', 'SCL-NCFE-LEVEL-2-AWARD-FOR-RESORT-REPRESENTATIVES',
    'Introduction &nbsp; This qualification aims to: &nbsp; &#x2666; provide skills and knowledge required to work effectively as a Resort Representative &#x2666; provide Resort Representatives with the tools to deliver the highest level of standards and service &#x2666; enhance the s', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'NCFE Level 2 Award in Food Safety in Catering', 'SCL-NCFE-LEVEL-2-AWARD-IN-FOOD-SAFETY-IN-CATERING', 'SCL-NCFE-LEVEL-2-AWARD-IN-FOOD-SAFETY-IN-CATERING',
    'Introduction &nbsp; The NCFE Level 2 Award in Food Safety in Catering focuses on the importance of hygiene, the food handler?s legal responsibilities and their role in monitoring food safety procedures, and how to handle, prepare and process food safely. The objectives of the qua', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'NCFE Level 2 Certificate in Aviation Operations on the Ground (Knowledge)', 'SCL-NCFE-LEVEL-2-CERTIFICATE-IN-AVIATION-OPERATIO', 'SCL-NCFE-LEVEL-2-CERTIFICATE-IN-AVIATION-OPERATIO',
    'Introduction &nbsp; This qualification is designed for learners interested in aviation operations. This qualification aims to: &#x2666; provide learners with skills in health, safety, security and communications required to work within an Aviation Environment &#x2666; develop lea', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'NCFE Level 2 Certificate in Hospitality and Catering Principles (Front of House Reception)', 'SCL-NCFE-LEVEL-2-CERTIFICATE-IN-HOSPITALITY-AND-C', 'SCL-NCFE-LEVEL-2-CERTIFICATE-IN-HOSPITALITY-AND-C',
    'Introduction &nbsp; Learners will develop the underpinning skills, knowledge and understanding required to work in the hospitality industry in roles such as receptionists, back office team and reservation team in a variety of different environments. The objectives of this qualifi', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'NCFE Level 2 Certificate in Hospitality and Catering Principles (Hospitality Services)', 'SCL-NCFE-LEVEL-2-CERTIFICATE-IN-HOSPITALITY-AND-C', 'SCL-NCFE-LEVEL-2-CERTIFICATE-IN-HOSPITALITY-AND-C',
    'Introduction &nbsp; Help learners develop the knowledge, skills and understanding in areas such as maintaining a safe, hygienic and secure working environment, working effectively as part of a hospitality team, maintaining food safety in a catering environment and knowledge of th', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'NCFE Level 2 Certificate in Nutrition &#038; Health', 'SCL-NCFE-LEVEL-2-CERTIFICATE-IN-NUTRITION-038-HEA', 'SCL-NCFE-LEVEL-2-CERTIFICATE-IN-NUTRITION-038-HEA',
    '&nbsp; Introduction The NCFE Level 2 Certificate in Nutrition and Health has been developed in response to rising levels of obesity in both adults and children. Modules: The award consists of three mandatory units: Explore principles of health eating Consider nutritional needs of', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'NCFE Level 2 NVQ Diploma in Front of House Reception', 'SCL-NCFE-LEVEL-2-NVQ-DIPLOMA-IN-FRONT-OF-HOUSE-RE', 'SCL-NCFE-LEVEL-2-NVQ-DIPLOMA-IN-FRONT-OF-HOUSE-RE',
    'Introduction &nbsp; This qualification is aimed at those working in, or who wish to enter, the hospitality industry. It must be assessed in the workplace or in a realistic working environment to allow learners to gain handson experience as they train. It allows flexibility in cho', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'Pearson BTEC Level 7 Extended Diploma in Strategic Management and Leadership', 'SCL-PEARSON-BTEC-LEVEL-7-EXTENDED-DIPLOMA-IN-STRA', 'SCL-PEARSON-BTEC-LEVEL-7-EXTENDED-DIPLOMA-IN-STRA',
    'Edexcel is the UK?s largest awarding body, offering academic and vocational qualifications to more than 25,000 schools, colleges, employers and other places of learning in the UK and in over 100 countries worldwide. Edexcel qualifications are recognised by employers and higher ed', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES (
    1, (@sort := @sort + 1), 'Structure of Edexcel Level 5 BTEC Higher National Diploma in Hospitality Management', 'SCL-STRUCTURE-OF-EDEXCEL-LEVEL-5-BTEC-HIGHER-NATI', 'SCL-STRUCTURE-OF-EDEXCEL-LEVEL-5-BTEC-HIGHER-NATI',
    'Structure of Edexcel L evel 5 BTEC H igher National Diploma in Hospitality Management &nbsp; Unit number &nbsp; &nbsp; Core units ? all seven units mu st be taken &nbsp; Unit l evel H1 or H 2 &nbsp; 1 &nbsp; The Contemporary Hospitality Industry &nbsp; H2 &nbsp; 2 &nbsp; The Deve', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0,
    1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0
);