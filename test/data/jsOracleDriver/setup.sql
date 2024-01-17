-- customer
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE ' || '"customer"';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
GO
CREATE TABLE "customer"(
    "idcustomer" NUMBER(10) PRIMARY KEY,
    "name" VARCHAR2(100) NULL,
    "age" NUMBER(10) NULL,
    "birth" TIMESTAMP(3) NULL,
	"surname" VARCHAR2(100) NULL,
	"stamp" TIMESTAMP(3) NULL,
	"random" NUMBER(10) NULL,
	"curr" NUMBER(19,2) NULL
)
GO
DECLARE
    ind NUMBER := 1;

BEGIN
    WHILE ind <= 500
    LOOP
        insert into "customer"("idcustomer", "name", "age", "birth", "surname", "stamp", "random", "curr") values(
            ind,
            CONCAT('name',CAST(ind AS VARCHAR2(6))),
			10+ind,
            TO_DATE('2010-09-24', 'YYYY/MM/DD'),
			CONCAT('surname_', CAST( (ind*2+100000) AS VARCHAR2(80))),
			SYSDATE,
			dbms_random.value()*1000,
			dbms_random.value()*10000
        );
        ind := ind + 1;
    END LOOP;
END;
GO


-- seller
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE ' || '"seller"';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
GO
CREATE TABLE "seller"(
    "idseller" NUMBER(10) PRIMARY KEY,
    "name" VARCHAR2(100) NULL,
    "age" NUMBER(10) NULL,
    "birth" TIMESTAMP(3) NULL,
	"surname" VARCHAR2(100) NULL,
	"stamp" TIMESTAMP(3) NULL,
	"random" NUMBER(10) NULL,
	"curr" NUMBER(19,2) NULL,
    "cf" VARCHAR2(200),
    "rtf" LONG RAW
)
GO
DECLARE
    ind NUMBER := 1;

BEGIN
    WHILE ind <= 500
    LOOP
        insert into "seller"("idseller", "name", "age", "birth", "surname", "stamp", "random", "curr", "cf", "rtf") values(
            ind,
            CONCAT('name',CAST(ind AS VARCHAR2(6))),
			10+ind,
            TO_DATE('2010-09-24', 'YYYY/MM/DD'),
			CONCAT('surname_', CAST( (ind*2+100000) AS VARCHAR2(80))),
			SYSDATE,
			dbms_random.value()*1000,
			dbms_random.value()*10000,
            CAST( (dbms_random.value()*100000) AS VARCHAR2(6)),
            utl_raw.cast_to_raw('
                BEGIN
                	EXECUTE IMMEDIATE ''DROP TABLE '' || ''"unifiedtaxcorrige"'';
                EXCEPTION
                WHEN OTHERS THEN
                    IF SQLCODE != -942 THEN
                        RAISE;
                    END IF;
                END;
                /
                CREATE TABLE "unifiedtaxcorrige"(
                    "idunifiedtaxcorrige" NUMBER(10) PRIMARY KEY,
                	"idexpensetaxcorrige" NUMBER(10),
                	"taxcode" NUMBER(10),
                	"ayear" NUMBER(5),
                	"employamount" NUMBER(19,2),
                	"adminamount" NUMBER(19,2),
                	"idcity" NUMBER(10),
                	"idfiscaltaxregion" VARCHAR2(5),
                	"adate" TIMESTAMP(3),
                	"ct" TIMESTAMP(3),
                	"cu" VARCHAR2(64),
                	"lt" TIMESTAMP(3),
                	"lu" VARCHAR2(64),
                	"nmonth" NUMBER(5),
                	"iddbdepartment" VARCHAR2(50),
                	"idreg" NUMBER(10),
                	"ymov" NUMBER(5),
                	"nmov" NUMBER(10),
                	"npay" NUMBER(10),
                	"idexp" NUMBER(10)
                );
                /'
            )
        );
        ind := ind + 1;
    END LOOP;
END;
GO



-- sellerkind
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE ' || '"sellerkind"';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
GO
CREATE TABLE "sellerkind"(
    "idsellerkind" NUMBER(10) PRIMARY KEY,
    "name" VARCHAR2(100) NULL,
	"rnd" NUMBER(10) NULL
)
GO
DECLARE
    ind NUMBER := 1;

BEGIN
    WHILE ind <= 20
    LOOP
        insert into "sellerkind"("idsellerkind","name","rnd") values(
            ind*30,
            CONCAT('name',CAST((ind*30) AS VARCHAR2(6))),
			dbms_random.value()*1000
        );
        ind := ind + 1;
    END LOOP;
END;
GO


-- customerkind
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE ' || '"customerkind"';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
GO
CREATE TABLE "customerkind"(
    "idcustomerkind" NUMBER(10) PRIMARY KEY,
    "name" VARCHAR2(100) NULL,
	"rnd" NUMBER(10) NULL
)
GO
DECLARE
    ind NUMBER := 1;

BEGIN
    WHILE ind <= 40
    LOOP
        insert into "customerkind"("idcustomerkind","name","rnd") values(
            ind*3,
            CONCAT('name',CAST((ind*3) AS VARCHAR2(6))),
			dbms_random.value()*1000
        );
        ind := ind + 1;
    END LOOP;
END;
GO



-- P testSP2
CREATE OR REPLACE PROCEDURE testSP2
(esercizio IN NUMBER, meseinizio IN NUMBER, mess IN VARCHAR2, defparam IN NUMBER DEFAULT 2)
AS
    c1 SYS_REFCURSOR;
BEGIN
    open c1 for
    SELECT 'aa' AS "colA", 'bb' AS "colB", 12 AS "colC", esercizio AS "original_esercizio", REPLACE(mess,'a','z') AS "newmess", defparam*2 AS "newparam"
    FROM dual
    CONNECT BY level <= 1;
    
    DBMS_SQL.RETURN_RESULT(c1);
END;
GO



-- P testSP1
CREATE OR REPLACE PROCEDURE testSP1
(esercizio IN NUMBER, meseinizio IN NUMBER, mesefine OUT NUMBER, mess IN VARCHAR2, defparam IN NUMBER DEFAULT 2)
AS
    c1 SYS_REFCURSOR;
BEGIN
    mesefine := 12;
    open c1 for
    SELECT 'a' AS "colA", 'b' AS "colB", 12 AS "colC", esercizio AS "original_esercizio", REPLACE(mess,'a','z') AS "newmess", defparam*2 AS "newparam"
    FROM dual
    CONNECT BY level <= 1;
    
    DBMS_SQL.RETURN_RESULT(c1);
END;
GO



-- P testSP3
CREATE OR REPLACE PROCEDURE testSP3
(esercizio IN NUMBER)
AS
    c1 SYS_REFCURSOR;
BEGIN
    open c1 for SELECT * FROM "customer" FETCH NEXT 100 ROWS ONLY;
    
    DBMS_SQL.RETURN_RESULT(c1);
END;
GO