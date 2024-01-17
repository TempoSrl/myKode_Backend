-- CREAZIONE TABELLA web_listredir --
DECLARE
  table_exists NUMBER;
BEGIN
  -- Verifica se la tabella esiste
  SELECT COUNT(*) INTO table_exists FROM user_tables WHERE table_name = 'WEB_LISTREDIR';

  -- Se la tabella non esiste, creala
  IF table_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE WEB_LISTREDIR (
      TABLENAME VARCHAR2(50) NOT NULL,
      LISTTYPE VARCHAR2(50) NOT NULL,
      CT TIMESTAMP,
      CU VARCHAR2(64),
      LT TIMESTAMP,
      LU VARCHAR2(64),
      NEWLISTTYPE VARCHAR2(50),
      NEWTABLENAME VARCHAR2(50),
      CONSTRAINT XPKWEB_LISTREDIR PRIMARY KEY (TABLENAME, LISTTYPE)
    )';
  END IF;
END;
/

-- CREAZIONE TABELLA virtualuser --
DECLARE
  v_table_exists NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists
  FROM user_tables
  WHERE table_name = 'VIRTUALUSER';

  IF v_table_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE VIRTUALUSER (
      idvirtualuser NUMBER NOT NULL,
      birthdate DATE NULL,
      cf VARCHAR2(16) NULL,
      codicedipartimento VARCHAR2(50) NOT NULL,
      email VARCHAR2(200) NULL,
      forename VARCHAR2(50) NOT NULL,
      lt DATE NULL,
      lu VARCHAR2(64) NULL,
      surname VARCHAR2(50) NOT NULL,
      sys_user VARCHAR2(30) NOT NULL,
      userkind NUMBER NOT NULL,
      username VARCHAR2(50) NOT NULL,
      CONSTRAINT xpkvirtualuser PRIMARY KEY (idvirtualuser)
    )';
  END IF;
END;
/

-- DELETE FROM virtualuser --
DELETE FROM virtualuser;

-- CREAZIONE TABELLA customuser --
DECLARE
  v_table_exists NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists
  FROM user_tables
  WHERE table_name = 'CUSTOMUSER';

  IF v_table_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE CUSTOMUSER (
      idcustomuser VARCHAR2(50) NOT NULL,
      ct DATE NULL,
      cu VARCHAR2(64) NULL,
      lastmodtimestamp DATE NULL,
      lastmoduser VARCHAR2(64) NULL,
      lt DATE NULL,
      lu VARCHAR2(64) NULL,
      username VARCHAR2(50) NOT NULL,
      CONSTRAINT xpkcustomuser PRIMARY KEY (idcustomuser)
    )';
  END IF;
END;
/

-- DELETE FROM customuser --
DELETE FROM customuser;

-- CREAZIONE TABELLA customgroup --
DECLARE
  v_table_exists NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists
  FROM user_tables
  WHERE table_name = 'CUSTOMGROUP';

  IF v_table_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE CUSTOMGROUP (
      idcustomgroup VARCHAR2(50) NOT NULL,
      ct DATE NULL,
      cu VARCHAR2(64) NULL,
      description VARCHAR2(200) NULL,
      groupname VARCHAR2(80) NULL,
      lastmodtimestamp DATE NULL,
      lastmoduser VARCHAR2(64) NULL,
      lt DATE NULL,
      lu VARCHAR2(64) NULL,
      CONSTRAINT xpkcustomgroup PRIMARY KEY (idcustomgroup)
    )';
  END IF;
END;
/

-- CREAZIONE TABELLA customusergroup --
DECLARE
  v_table_exists NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists
  FROM user_tables
  WHERE table_name = 'CUSTOMUSERGROUP';

  IF v_table_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE CUSTOMUSERGROUP (
      idcustomgroup VARCHAR2(50) NOT NULL,
      idcustomuser VARCHAR2(50) NOT NULL,
      ct DATE NULL,
      cu VARCHAR2(64) NULL,
      lastmodtimestamp DATE NULL,
      lastmoduser VARCHAR2(64) NULL,
      lt DATE NULL,
      lu VARCHAR2(64) NULL,
      CONSTRAINT xpkcustomusergroup PRIMARY KEY (idcustomgroup, idcustomuser)
    )';
  END IF;
END;
/

-- CREAZIONE TABELLA customgroupoperation --
DECLARE
  v_table_exists NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists
  FROM user_tables
  WHERE table_name = 'CUSTOMGROUPOPERATION';

  IF v_table_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE CUSTOMGROUPOPERATION (
      idgroup VARCHAR2(50) NOT NULL,
      operation CHAR(1) NOT NULL,
      tablename VARCHAR2(50) NOT NULL,
      allowcondition CLOB NULL,
      ct DATE NULL,
      cu VARCHAR2(64) NULL,
      defaultisdeny CHAR(1) NOT NULL,
      denycondition CLOB NULL,
      lastmodtimestamp DATE NULL,
      lastmoduser VARCHAR2(64) NULL,
      lt DATE NULL,
      lu VARCHAR2(64) NULL,
      CONSTRAINT xpkcustomgroupoperation PRIMARY KEY (idgroup, operation, tablename)
    )';
  END IF;
END;
/



-- CREAZIONE TABELLA flowchart --
DECLARE
  v_table_exists NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists
  FROM user_tables
  WHERE table_name = 'FLOWCHART';

  IF v_table_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE FLOWCHART (
      idflowchart VARCHAR2(34) NOT NULL,
      address VARCHAR2(100) NULL,
      ayear NUMBER NULL,
      cap VARCHAR2(20) NULL,
      codeflowchart VARCHAR2(50) NOT NULL,
      ct DATE NOT NULL,
      cu VARCHAR2(64) NOT NULL,
      fax VARCHAR2(75) NULL,
      idcity NUMBER NULL,
      idsor1 NUMBER NULL,
      idsor2 NUMBER NULL,
      idsor3 NUMBER NULL,
      location VARCHAR2(50) NULL,
      lt DATE NOT NULL,
      lu VARCHAR2(64) NOT NULL,
      nlevel NUMBER NOT NULL,
      paridflowchart VARCHAR2(34) NOT NULL,
      phone VARCHAR2(55) NULL,
      printingorder VARCHAR2(50) NOT NULL,
      title VARCHAR2(150) NOT NULL,
      CONSTRAINT xpkflowchart PRIMARY KEY (idflowchart)
    )';
  END IF;
END;
/

-- DELETE FROM flowchart --
DELETE FROM flowchart;


drop table FLOWCHARTUSER;

-- CREAZIONE TABELLA flowchartuser --
DECLARE
  v_table_exists NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists
  FROM user_tables
  WHERE table_name = 'FLOWCHARTUSER';

  IF v_table_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE FLOWCHARTUSER (
      idflowchart VARCHAR2(34) NOT NULL,
      ndetail NUMBER NOT NULL,
      idcustomuser VARCHAR2(50) NOT NULL,
      all_sorkind01 CHAR(1) NULL,
      all_sorkind02 CHAR(1) NULL,
      all_sorkind03 CHAR(1) NULL,
      all_sorkind04 CHAR(1) NULL,
      all_sorkind05 CHAR(1) NULL,
      ct DATE NOT NULL,
      cu VARCHAR2(64) NOT NULL,
      flagdefault CHAR(1) NOT NULL,
      idsor01 NUMBER,
      idsor02 NUMBER,
      idsor03 NUMBER,
      idsor04 NUMBER,
      idsor05 NUMBER,
      lt DATE NOT NULL,
      lu VARCHAR2(64) NOT NULL,         
      sorkind01_withchilds CHAR(1) NULL,
      sorkind02_withchilds CHAR(1) NULL,
      sorkind03_withchilds CHAR(1) NULL,
      sorkind04_withchilds CHAR(1) NULL,
      sorkind05_withchilds CHAR(1) NULL,
      "start" DATE,
      stop DATE,
      title VARCHAR2(150),
      CONSTRAINT xpkflowchartuser PRIMARY KEY (idflowchart, ndetail, idcustomuser)
    )';
  END IF;
END;
/

-- DELETE FROM flowchartuser --
DELETE FROM flowchartuser;

-- CREAZIONE TABELLA menu --
DECLARE
  v_table_exists NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists
  FROM user_tables
  WHERE table_name = 'MENU';

  IF v_table_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE MENU (
      idmenu NUMBER NOT NULL,
      edittype VARCHAR2(60) NULL,
      lt DATE NULL,
      lu VARCHAR2(64) NULL,
      menucode VARCHAR2(80) NULL,
      metadata VARCHAR2(60) NULL,
      modal CHAR(1) NULL,
      ordernumber NUMBER NULL,
      parameter VARCHAR2(80) NULL,
      paridmenu NUMBER NULL,
      title VARCHAR2(80) NOT NULL,
      userid VARCHAR2(80) NULL,
      CONSTRAINT xpkmenu PRIMARY KEY (idmenu)
    )';
  END IF;
END;
/

-- DELETE FROM menu --
DELETE FROM menu;

-- CREAZIONE TABELLA menu --
DECLARE
  v_table_exists NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists
  FROM user_tables
  WHERE table_name = 'MENU';

  IF v_table_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE MENU (
      idmenu NUMBER NOT NULL,
      edittype VARCHAR2(60),
      lt DATE,
      lu VARCHAR2(64),
      menucode VARCHAR2(80),
      metadata VARCHAR2(60),
      modal CHAR(1),
      ordernumber NUMBER,
      parameter VARCHAR2(80),
      paridmenu NUMBER,
      title VARCHAR2(80) NOT NULL,
      userid VARCHAR2(80),
      CONSTRAINT xpkmenu PRIMARY KEY (idmenu)
    )';
  END IF;
END;
/

DELETE FROM menu;
/

-- CREAZIONE TABELLA userenvironment --
DECLARE
  v_table_exists NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists
  FROM user_tables
  WHERE table_name = 'USERENVIRONMENT';

  IF v_table_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE USERENVIRONMENT (
      idcustomuser VARCHAR2(50) NOT NULL,
      variablename VARCHAR2(50) NOT NULL,
      flagadmin CHAR(1),
      kind CHAR(1),
      lt DATE,
      lu VARCHAR2(64),
      value CLOB,
      CONSTRAINT xpkuserenvironment PRIMARY KEY (idcustomuser, variablename)
    )';
  END IF;
END;
/

-- CREAZIONE TABELLA flowchartrestrictedfunction --
DECLARE
  v_table_exists NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists
  FROM user_tables
  WHERE table_name = 'FLOWCHARTRESTRICTEDFUNCTION';

  IF v_table_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE FLOWCHARTRESTRICTEDFUNCTION (
      idflowchart VARCHAR2(34) NOT NULL,
      idrestrictedfunction NUMBER NOT NULL,
      ct DATE NOT NULL,
      cu VARCHAR2(64) NOT NULL,
      lt DATE NOT NULL,
      lu VARCHAR2(64) NOT NULL,
      CONSTRAINT xpkflowchartrestrictedfunction PRIMARY KEY (idflowchart, idrestrictedfunction)
    )';
  END IF;
END;
/

-- CREAZIONE TABELLA restrictedfunction --
DECLARE
  v_table_exists NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists
  FROM user_tables
  WHERE table_name = 'RESTRICTEDFUNCTION';

  IF v_table_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE RESTRICTEDFUNCTION (
      idrestrictedfunction NUMBER NOT NULL,
      ct DATE NOT NULL,
      cu VARCHAR2(64) NOT NULL,
      description VARCHAR2(100) NOT NULL,
      lt DATE NOT NULL,
      lu VARCHAR2(64) NOT NULL,
      variablename VARCHAR2(50) NOT NULL,
      CONSTRAINT xpkrestrictedfunction PRIMARY KEY (idrestrictedfunction)
    )';
  END IF;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP FUNCTION compute_allowform';
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignora eventuali errori di drop
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP TYPE compute_allowform_table';
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignora eventuali errori di drop
END;
/

-- Dichiarazione del tipo record per la tabella
CREATE OR REPLACE TYPE compute_allowform_record AS OBJECT (
  tablename VARCHAR2(200)    
);
/

CREATE OR REPLACE TYPE compute_allowform_table AS TABLE OF compute_allowform_record;
/


CREATE OR REPLACE FUNCTION compute_allowform (
  p_ayear NUMBER,
  p_iduser VARCHAR2,
  p_idflowchart VARCHAR2,
  p_varname VARCHAR2
)
RETURN compute_allowform_table
AS
  -- Dichiarazione della variabile di tipo tabella
  v_outtable compute_allowform_table := compute_allowform_table();

BEGIN
  -- Se l'id del flowchart è nullo
  IF p_idflowchart IS NULL THEN
    -- Inserisci i dati nella variabile di tabella
    SELECT  compute_allowform_record(METADATA)
    BULK COLLECT INTO v_outtable
    FROM menu
    WHERE METADATA IS NOT NULL;
   
   return v_outtable;

  END IF;

  v_outtable.extend;
  v_outtable(v_outtable.last) := compute_allowform_record('resultparameter');

  v_outtable.extend;
  v_outtable(v_outtable.last) := compute_allowform_record('export');

  -- Esegui una query sulla variabile tabella
  IF v_outtable.COUNT > 0 THEN
    -- Restituisci un insieme filtrato dei dati
    -- Ad esempio, una query sulla variabile tabella
    SELECT DISTINCT  compute_allowform_record(tablename)
    BULK COLLECT INTO v_outtable
    FROM TABLE(v_outtable)
    WHERE tablename <> 'no_table'
    ORDER BY tablename;

    RETURN v_outtable;
  END IF;
  
  v_outtable.extend;
  v_outtable(v_outtable.last) := compute_allowform_record('dummy');
  

  RETURN v_outtable;
END compute_allowform;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP TYPE compute_notable_record';
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignora eventuali errori di drop
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP TYPE compute_notable_table';
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignora eventuali errori di drop
END;
/

CREATE OR REPLACE TYPE compute_notable_record AS OBJECT (
  edittype VARCHAR2(100)
);
/

CREATE OR REPLACE TYPE compute_notable_table AS TABLE OF compute_notable_record;
/


CREATE OR REPLACE FUNCTION compute_notable (
  p_ayear NUMBER,
  p_iduser VARCHAR2,
  p_idflowchart VARCHAR2,
  p_varname VARCHAR2
)
return compute_notable_table
AS
  -- Dichiarazione della variabile di tipo tabella
  v_outtable compute_notable_table;

BEGIN
  -- Se l'id del flowchart è nullo
  IF p_idflowchart IS NULL THEN
    -- Inserisci i dati nella variabile di tabella
    SELECT DISTINCT compute_notable_record(edittype)
    BULK COLLECT INTO v_outtable
    FROM menu
    WHERE metadata = 'no_table';

    RETURN v_outtable;
  END IF;


  -- Esegui una query sulla variabile tabella
 IF v_outtable.COUNT > 0 THEN
   RETURN v_outtable;
 END IF;

  -- Inserisci dati nella variabile di tabella
  v_outtable.EXTEND;
  v_outtable(v_outtable.LAST) := compute_notable_record('dummy');

  RETURN v_outtable;
END compute_notable;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP TYPE compute_environment_record';
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignora eventuali errori di drop
END;
/


BEGIN
  EXECUTE IMMEDIATE 'DROP TYPE compute_environment_table';
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignora eventuali errori di drop
END;
/



BEGIN
  EXECUTE IMMEDIATE 'DROP TYPE compute_environment_record';
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignora eventuali errori di drop
END;
/


BEGIN
  EXECUTE IMMEDIATE 'DROP TYPE compute_environment_table';
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignora eventuali errori di drop
END;
/

CREATE OR REPLACE TYPE compute_environment_record AS OBJECT (
    variablename VARCHAR2(50),
    kind CHAR(1),
    mustquote CHAR(1),
    value CLOB
);
/

CREATE OR REPLACE TYPE compute_environment_table AS TABLE OF compute_environment_record;
/

CREATE OR REPLACE FUNCTION compute_environment
(
  p_ayear NUMBER,
  p_idcustomuser VARCHAR2,
  p_idflowchart VARCHAR2 DEFAULT NULL,
  p_ndetail NUMBER DEFAULT NULL
)
RETURN compute_environment_table
AS

  v_idflowchart VARCHAR2(34);
  v_ndetail NUMBER;
  v_codeflowchart VARCHAR2(100);
  v_allvar VARCHAR2(30);
  v_withchilds CHAR(1) := 'N';
  v_all_value CHAR(1) := 'N';
  v_cond VARCHAR2(1000) := '';
  v_idvar VARCHAR2(30);
  v_idlist CLOB := '';
  v_noflowchart CHAR(1) := 'N';
  v_tab_allowform compute_allowform_table;
  v_tab_notable compute_notable_table;
  v_outtable compute_environment_table := compute_environment_table();
  v_nrowfound NUMBER;

BEGIN
  v_idflowchart := p_idflowchart;
  v_ndetail := p_ndetail;
  -- Check if the flowchart exists
  
  IF p_idflowchart IS NULL THEN
        SELECT idflowchart, ndetail
        INTO  v_idflowchart, v_ndetail
        FROM (
          SELECT FU.idflowchart, FU.ndetail
          FROM flowchart F
          JOIN flowchartuser FU ON F.idflowchart = FU.idflowchart
          WHERE FU.idcustomuser = p_idcustomuser
            AND (FU."start" IS NULL OR FU."start" <= SYSDATE)
            AND (FU.stop IS NULL OR FU.stop >= SYSDATE)
            AND F.ayear = p_ayear
          ORDER BY FU.flagdefault DESC
        ) 
        WHERE ROWNUM = 1;
  END IF;
  
  -- Check if only idflowchart is provided
  IF p_idflowchart IS NOT NULL AND p_ndetail IS NULL THEN
    SELECT FU.ndetail
    INTO v_ndetail
    FROM flowchart F
    JOIN flowchartuser FU ON F.idflowchart = FU.idflowchart
    WHERE FU.idcustomuser = p_idcustomuser
      AND (FU."start" IS NULL OR FU."start" <= SYSDATE)
      AND (FU.stop IS NULL OR FU.stop >= SYSDATE)
      AND F.ayear = p_ayear
      AND F.idflowchart = p_idflowchart
    ORDER BY FU.flagdefault DESC;
     
  END IF;
  
  
  
  SELECT codeflowchart
  INTO v_codeflowchart
  FROM flowchart
  WHERE idflowchart = v_idflowchart;

   v_allvar := NULL;
   
   
   -- Constants (kind=K)
    SELECT compute_environment_record(variablename,  kind, 'S', value)
    BULK COLLECT INTO v_outtable
    FROM userenvironment
    WHERE idcustomuser = p_idcustomuser AND kind = 'K';
    

  -- Stored procedures (kind=S) 
  SELECT compute_environment_record(variablename, kind,
       CASE
         WHEN (EXISTS (SELECT *
                       FROM flowchartrestrictedfunction FF
                       JOIN restrictedfunction RF ON RF.idrestrictedfunction = FF.idrestrictedfunction
                       WHERE FF.idflowchart = v_idflowchart AND RF.variablename = userenvironment.variablename))
         THEN 'S'
         ELSE 'N'
       END,
       'S')
    BULK COLLECT INTO v_outtable
    FROM userenvironment
    WHERE idcustomuser = p_idcustomuser AND kind = 'S' AND value LIKE 'compute_set';


  SELECT compute_allowform_record(tablename)
  BULK COLLECT INTO v_tab_allowform
  FROM TABLE(compute_allowform(p_ayear, p_idcustomuser, v_idflowchart, 'menu'));
  
  -- menu Compute AllowForm
  SELECT compute_allowform_record(tablename)
  BULK COLLECT INTO v_tab_allowform
  FROM TABLE(compute_allowform(p_ayear, p_idcustomuser, v_idflowchart, 'menu'));
  
  v_idlist := '';
  FOR i IN 1 .. v_tab_allowform.COUNT LOOP
    v_idlist := v_idlist || ',''' || v_tab_allowform(i).tablename || '''';
  END LOOP;
  
  v_outtable.EXTEND;
  v_outtable(v_outtable.LAST) := compute_environment_record(
    'menu', 'S', 'N', SUBSTR(v_idlist, 2)
  );
 
  -- Compute NoTable
  SELECT compute_notable_record(edittype)
  BULK COLLECT INTO v_tab_notable
  FROM TABLE(compute_notable(p_ayear, p_idcustomuser, v_idflowchart, 'notable'));
    
  v_idlist := '';
  FOR i IN 1 .. v_tab_notable.COUNT LOOP
    v_idlist := v_idlist || ',''' || v_tab_notable(i).edittype || '''';
  END LOOP;
  
  v_outtable.EXTEND;
  v_outtable(v_outtable.LAST) := compute_environment_record(
    'notable', 'S', 'N', SUBSTR(v_idlist, 2)
  );
  
  return v_outtable;
  
END compute_environment;
/



BEGIN
  EXECUTE IMMEDIATE 'DROP FUNCTION compute_roles';
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignora eventuali errori di drop
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP TYPE compute_roles_table';
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignora eventuali errori di drop
END;
/

CREATE OR REPLACE TYPE compute_roles_record AS OBJECT (
    idflowchart VARCHAR2(34),
    title varchar(100),
    ndetail number,
    k varchar(100)    
);
/

CREATE OR REPLACE TYPE compute_roles_table AS TABLE OF compute_roles_record;
/

CREATE OR REPLACE FUNCTION compute_roles
(
  p_currdate DATE,
  p_idcustomuser VARCHAR2  
)
RETURN compute_roles_table
AS
v_outtable compute_roles_table := compute_roles_table();
BEGIN

  -- Popola la tabella in uscita utilizzando BULK COLLECT INTO
  SELECT compute_roles_record(
           U.idflowchart,
           COALESCE(U.title, F.title),
           U.ndetail,
           (U.idflowchart || '§' || TO_CHAR(U.ndetail)) 
         )
  BULK COLLECT INTO v_outtable
  FROM flowchartuser U
  JOIN flowchart F ON U.idflowchart = F.idflowchart
  WHERE F.ayear = EXTRACT(YEAR FROM p_currdate) AND
        U.idcustomuser = p_idcustomuser AND
        (U."start" IS NULL OR U."start" <= p_currdate) AND
        (U.stop IS NULL OR U.stop >= p_currdate)
  ORDER BY COALESCE(U.title, F.title);
  
  RETURN v_outtable;
END;
/

-- CREAZIONE TABELLA audit --
DECLARE
  v_table_exists NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists
  FROM user_tables
  WHERE table_name = 'AUDIT';

  IF v_table_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE "AUDIT" (
      idaudit VARCHAR2(30) NOT NULL,
      consequence CLOB NULL,
      flagsystem CHAR(1) NULL,
      lt DATE NULL,
      lu VARCHAR2(64) NULL,
      severity CHAR(1) NOT NULL,
      title VARCHAR2(128) NOT NULL,
      CONSTRAINT xpkaudit PRIMARY KEY (idaudit)
    )';
  END IF;
END;
/

-- Rimuovi dati dalla tabella audit
TRUNCATE TABLE "AUDIT";

-- CREAZIONE TABELLA auditparameter --
DECLARE
  v_table_exists_param NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists_param
  FROM user_tables
  WHERE table_name = 'AUDITPARAMETER';

  IF v_table_exists_param = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE AUDITPARAMETER (
      tablename VARCHAR2(150) NOT NULL,
      opkind CHAR(1) NOT NULL,
      isprecheck CHAR(1) NOT NULL,
      parameterid NUMBER NOT NULL,
      flagoldvalue CHAR(1) NULL,
      paramcolumn VARCHAR2(150) NULL,
      paramtable VARCHAR2(150) NULL,
      CONSTRAINT xpkauditparameter PRIMARY KEY (tablename, opkind, isprecheck, parameterid)
    )';
  END IF;
END;
/

-- Rimuovi dati dalla tabella auditparameter
TRUNCATE TABLE auditparameter;

-- CREAZIONE TABELLA auditcheck --
DECLARE
  v_table_exists_check NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists_check
  FROM user_tables
  WHERE table_name = 'AUDITCHECK';

  IF v_table_exists_check = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE AUDITCHECK (
      tablename VARCHAR2(150) NOT NULL,
      opkind CHAR(1) NOT NULL,
      idaudit VARCHAR2(30) NOT NULL,
      idcheck NUMBER NOT NULL,
      flag_both CHAR(1) NULL,
      flag_cash CHAR(1) NULL,
      flag_comp CHAR(1) NULL,
      flag_credit CHAR(1) NULL,
      flag_proceeds CHAR(1) NULL,
      lt DATE NULL,
      lu VARCHAR2(64) NULL,
      message VARCHAR2(1000) NULL,
      precheck CHAR(1) NULL,
      sqlcmd VARCHAR2(6000) NULL,
      CONSTRAINT xpkauditcheck PRIMARY KEY (tablename, opkind, idaudit, idcheck)
    )';
  END IF;
END;
/

-- Rimuovi dati dalla tabella auditcheck
TRUNCATE TABLE AUDITCHECK;

-- Controllo se la vista esiste
DECLARE
  v_view_exists NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_view_exists
  FROM user_views
  WHERE view_name = 'AUDITCHECKVIEW';

  IF v_view_exists > 0 THEN
    EXECUTE IMMEDIATE 'DROP VIEW AUDITCHECKVIEW';
  END IF;
END;
/

-- Creazione della vista
CREATE VIEW AUDITCHECKVIEW
AS
SELECT
  ac.tablename,
  ac.opkind,
  ac.idcheck,
  ac.idaudit,
  a.title,
  a.severity,
  ac.sqlcmd,
  ac.message,
  ac.precheck,
  ac.flag_comp,
  ac.flag_cash,
  ac.flag_both,
  ac.flag_credit,
  ac.flag_proceeds
FROM "AUDITCHECK" ac
JOIN "AUDIT" a ON a.idaudit = ac.idaudit;
/



-- CREAZIONE TABELLA attach --
DECLARE
  v_table_exists NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists
  FROM user_tables
  WHERE table_name = 'ATTACH';

  IF v_table_exists = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE ATTACH (
        idattach NUMBER NOT NULL,
        attachment BLOB,
        counter NUMBER,
        ct DATE,
        cu VARCHAR2(64),
        filename VARCHAR2(512),
        hash CLOB,
        lt DATE,
        lu VARCHAR2(64),
        "size" NUMBER,
        CONSTRAINT xpkattach PRIMARY KEY (idattach)
    )';
  END IF;
END;
/

DELETE FROM attach;
COMMIT;

-- [DBO] --
-- CREAZIONE TABELLA menuweb --
DECLARE
  v_table_exists_menu NUMBER;
BEGIN
  SELECT COUNT(*)
  INTO v_table_exists_menu
  FROM user_tables
  WHERE table_name = 'MENUWEB';

  IF v_table_exists_menu = 0 THEN
    EXECUTE IMMEDIATE 'CREATE TABLE MENUWEB (
        idmenuweb NUMBER NOT NULL,
        editType NVARCHAR2(60),
        idmenuwebparent NUMBER,
        label NVARCHAR2(250) NOT NULL,
        link NVARCHAR2(250),
        sort NUMBER,
        tableName NVARCHAR2(60),
        CONSTRAINT xpkmenuweb PRIMARY KEY (idmenuweb)
    )';
  END IF;
END;
/

DELETE FROM menuweb;

INSERT INTO menuweb (idmenuweb, editType, idmenuwebparent, sort, tableName, label)
VALUES (2, NULL, 1, 1, NULL, 'Livello 1');

INSERT INTO menuweb (idmenuweb, editType, idmenuwebparent, sort, tableName, label)
VALUES (3, NULL, 2, 2, NULL, 'Livello 2');

--INSERT INTO menuweb (idmenuweb, editType, idmenuwebparent, sort, tableName, label) VALUES (4, NULL, 3, 1, NULL, 'Contratti');

INSERT INTO menuweb (idmenuweb, editType, idmenuwebparent, sort, tableName, label)
VALUES (4, 'edit_type', 3, 1, 'tablename', 'Nome maschera');

COMMIT;



