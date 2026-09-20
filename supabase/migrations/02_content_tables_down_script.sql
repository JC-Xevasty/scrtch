/*
* ==========================================
* 02_CONTENT_TABLES_DOWN_SCRIPT
* ==========================================
*/
DROP VIEW IF EXISTS public.contents;

/*
* 1. DROP CHILD TABLES FIRST
* (Prevents Foreign Key violation blocks during teardown)
*/
DROP TABLE IF EXISTS public.links;
DROP TABLE IF EXISTS public.log_items;
DROP TABLE IF EXISTS public.list_items;

/*
* 2. DROP PARENT CONTENT TABLES
*/
DROP TABLE IF EXISTS public.logs;
DROP TABLE IF EXISTS public.lists;
DROP TABLE IF EXISTS public.notes;

/*
* 3. DROP CORE ROOT CONTAINER TABLE
*/
DROP TABLE IF EXISTS public.groups;