DROP DATABASE IF EXISTS prod;
DROP DATABASE IF EXISTS dev;
CREATE DATABASE prod;
CREATE DATABASE dev;


/******** for ticktick gtd *********/

DROP DATABASE IF EXISTS gtd_dash;
CREATE DATABASE gtd_dash;
\c gtd_dash;
CREATE SCHEMA dev;
CREATE SCHEMA prod;
