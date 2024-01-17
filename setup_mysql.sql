/*   SETUP DATA DEMO */

-- CREAZIONE TABELLA web_listredir --
CREATE TABLE IF NOT EXISTS web_listredir (
    tablename VARCHAR(50) NOT NULL,
    listtype VARCHAR(50) NOT NULL,
    ct DATETIME NULL,
    cu VARCHAR(64) NULL,
    lt DATETIME NULL,
    lu VARCHAR(64) NULL,
    newlisttype VARCHAR(50) NULL,
    newtablename VARCHAR(50) NULL,
    PRIMARY KEY (tablename, listtype)
);

-- Elimina i dati dalla tabella web_listredir
DELETE FROM web_listredir;





-- CREAZIONE TABELLA customuser --
CREATE TABLE IF NOT EXISTS customuser (
    idcustomuser VARCHAR(50) NOT NULL,
    ct DATETIME NULL,
    cu VARCHAR(64) NULL,
    lastmodtimestamp DATETIME NULL,
    lastmoduser VARCHAR(64) NULL,
    lt DATETIME NULL,
    lu VARCHAR(64) NULL,
    username VARCHAR(50) NOT NULL,
    PRIMARY KEY (idcustomuser)
);

-- Elimina i dati dalla tabella customuser
DELETE FROM customuser;



-- CREAZIONE TABELLA customgroup --
CREATE TABLE IF NOT EXISTS customgroup (
    idcustomgroup VARCHAR(50) NOT NULL,
    ct DATETIME NULL,
    cu VARCHAR(64) NULL,
    description VARCHAR(200) NULL,
    groupname VARCHAR(80) NULL,
    lastmodtimestamp DATETIME NULL,
    lastmoduser VARCHAR(64) NULL,
    lt DATETIME NULL,
    lu VARCHAR(64) NULL,
    PRIMARY KEY (idcustomgroup)
);

-- Elimina i dati dalla tabella customgroup
DELETE FROM customgroup;



-- CREAZIONE TABELLA customusergroup --
CREATE TABLE IF NOT EXISTS customusergroup (
    idcustomgroup VARCHAR(50) NOT NULL,
    idcustomuser VARCHAR(50) NOT NULL,
    ct DATETIME NULL,
    cu VARCHAR(64) NULL,
    lastmodtimestamp DATETIME NULL,
    lastmoduser VARCHAR(64) NULL,
    lt DATETIME NULL,
    lu VARCHAR(64) NULL,
    PRIMARY KEY (idcustomgroup, idcustomuser)
);

-- Elimina i dati dalla tabella customusergroup
DELETE FROM customusergroup;


-- CREAZIONE TABELLA customgroupoperation --
CREATE TABLE IF NOT EXISTS customgroupoperation (
    idgroup VARCHAR(50) NOT NULL,
    operation CHAR(1) NOT NULL,
    tablename VARCHAR(50) NOT NULL,
    allowcondition TEXT NULL,
    ct DATETIME NULL,
    cu VARCHAR(64) NULL,
    defaultisdeny CHAR(1) NOT NULL,
    denycondition TEXT NULL,
    lastmodtimestamp DATETIME NULL,
    lastmoduser VARCHAR(64) NULL,
    lt DATETIME NULL,
    lu VARCHAR(64) NULL,
    PRIMARY KEY (idgroup, operation, tablename)
);

-- Elimina i dati dalla tabella customgroupoperation
DELETE FROM customgroupoperation;



-- CREAZIONE TABELLA flowchart --
CREATE TABLE IF NOT EXISTS flowchart (
    idflowchart VARCHAR(34) NOT NULL,
    address VARCHAR(100) NULL,
    ayear INT NULL,
    cap VARCHAR(20) NULL,
    codeflowchart VARCHAR(50) NOT NULL,
    ct DATETIME NOT NULL,
    cu VARCHAR(64) NOT NULL,
    fax VARCHAR(75) NULL,
    idcity INT NULL,
    idsor1 INT NULL,
    idsor2 INT NULL,
    idsor3 INT NULL,
    location VARCHAR(50) NULL,
    lt DATETIME NOT NULL,
    lu VARCHAR(64) NOT NULL,
    nlevel INT NOT NULL,
    paridflowchart VARCHAR(34) NOT NULL,
    phone VARCHAR(55) NULL,
    printingorder VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    PRIMARY KEY (idflowchart)
);

-- Elimina i dati dalla tabella flowchart
DELETE FROM flowchart;




-- CREAZIONE TABELLA flowchartuser --
CREATE TABLE IF NOT EXISTS flowchartuser (
    idflowchart VARCHAR(34) NOT NULL,
    ndetail INT NOT NULL,
    idcustomuser VARCHAR(50) NOT NULL,
    all_sorkind01 CHAR(1) NULL,
    all_sorkind02 CHAR(1) NULL,
    all_sorkind03 CHAR(1) NULL,
    all_sorkind04 CHAR(1) NULL,
    all_sorkind05 CHAR(1) NULL,
    ct DATETIME NOT NULL,
    cu VARCHAR(64) NOT NULL,
    flagdefault CHAR(1) NOT NULL,
    idsor01 INT NULL,
    idsor02 INT NULL,
    idsor03 INT NULL,
    idsor04 INT NULL,
    idsor05 INT NULL,
    lt DATETIME NOT NULL,
    lu VARCHAR(64) NOT NULL,
    sorkind01_withchilds CHAR(1) NULL,
    sorkind02_withchilds CHAR(1) NULL,
    sorkind03_withchilds CHAR(1) NULL,
    sorkind04_withchilds CHAR(1) NULL,
    sorkind05_withchilds CHAR(1) NULL,
    start DATE NULL,
    stop DATE NULL,
    title VARCHAR(150) NULL,
    PRIMARY KEY (idflowchart, ndetail, idcustomuser)
);

-- Elimina i dati dalla tabella flowchartuser
DELETE FROM flowchartuser;



-- CREAZIONE TABELLA menu --
CREATE TABLE IF NOT EXISTS menu (
    idmenu INT NOT NULL,
    edittype VARCHAR(60) NULL,
    lt DATETIME NULL,
    lu VARCHAR(64) NULL,
    menucode VARCHAR(80) NULL,
    metadata VARCHAR(60) NULL,
    modal CHAR(1) NULL,
    ordernumber INT NULL,
    parameter VARCHAR(80) NULL,
    paridmenu INT NULL,
    title VARCHAR(80) NOT NULL,
    userid VARCHAR(80) NULL,
    PRIMARY KEY (idmenu)
);

-- Elimina i dati dalla tabella menu
DELETE FROM menu;



-- Elimina i dati dalla tabella flowchartuser
DELETE FROM flowchartuser;

-- CREAZIONE TABELLA userenvironment --
CREATE TABLE IF NOT EXISTS userenvironment (
    idcustomuser VARCHAR(50) NOT NULL,
    variablename VARCHAR(50) NOT NULL,
    flagadmin CHAR(1) NULL,
    kind CHAR(1) NULL,
    lt DATETIME NULL,
    lu VARCHAR(64) NULL,
    value TEXT NULL,
    PRIMARY KEY (idcustomuser, variablename)
);

-- CREAZIONE TABELLA flowchartrestrictedfunction --
CREATE TABLE IF NOT EXISTS flowchartrestrictedfunction (
    idflowchart VARCHAR(34) NOT NULL,
    idrestrictedfunction INT NOT NULL,
    ct DATETIME NOT NULL,
    cu VARCHAR(64) NOT NULL,
    lt DATETIME NOT NULL,
    lu VARCHAR(64) NOT NULL,
    PRIMARY KEY (idflowchart, idrestrictedfunction)
);


-- CREAZIONE TABELLA restrictedfunction --
CREATE TABLE  IF NOT EXISTS  sp_tmp_output (
	id char(36) null,
    tablename VARCHAR(100) NULL,
    edit_type varchar(100) NULL
);



-- CREAZIONE TABELLA restrictedfunction --
CREATE TABLE IF NOT EXISTS restrictedfunction (
    idrestrictedfunction INT NOT NULL,
    ct DATETIME NOT NULL,
    cu VARCHAR(64) NOT NULL,
    description VARCHAR(100) NOT NULL,
    lt DATETIME NOT NULL,
    lu VARCHAR(64) NOT NULL,
    variablename VARCHAR(50) NOT NULL,
    PRIMARY KEY (idrestrictedfunction)
);

-- Elimina i dati dalla tabella restrictedfunction
DELETE FROM restrictedfunction;


DROP PROCEDURE IF EXISTS compute_environment;

-- CREAZIONE PROCEDURA compute_environment
DELIMITER //
CREATE PROCEDURE compute_environment(
    IN ayear INT,
    IN idcustomuser VARCHAR(50),
    IN idflowchart VARCHAR(34) ,
    IN ndetail INT  
)
sp_exit: BEGIN
    DECLARE noflowchart CHAR(1) DEFAULT 'N';
	DECLARE codeflowchart VARCHAR(100);
    DECLARE allvar VARCHAR(30);
    DECLARE withchilds CHAR(1);
    DECLARE all_value CHAR(1);
	DECLARE cond VARCHAR(1000);
    DECLARE idvar VARCHAR(30);
    DECLARE idlist VARCHAR(4000);


    IF (idflowchart IS NULL) THEN
        SELECT idflowchart, ndetail
        INTO idflowchart, ndetail
        FROM flowchart F
        JOIN flowchartuser FU ON F.idflowchart = FU.idflowchart
        WHERE FU.idcustomuser = idcustomuser
            AND (FU.start IS NULL OR FU.start <= NOW())
            AND (FU.stop IS NULL OR FU.stop >= NOW())
            AND F.ayear = ayear
        ORDER BY FU.flagdefault DESC;

        SELECT idflowchart, ndetail;
    END IF;

    IF (idflowchart IS NOT NULL AND ndetail IS NULL) THEN
        SELECT ndetail
        INTO ndetail
        FROM flowchart F
        JOIN flowchartuser FU ON F.idflowchart = idflowchart
        WHERE FU.idcustomuser = idcustomuser
            AND (FU.start IS NULL OR FU.start <= NOW())
            AND (FU.stop IS NULL OR FU.stop >= NOW())
            AND F.ayear = ayear
        ORDER BY FU.flagdefault DESC;

        SELECT idflowchart, ndetail;
    END IF;

    
    SELECT codeflowchart INTO codeflowchart FROM flowchart WHERE idflowchart = idflowchart;

    SELECT idflowchart, ndetail, codeflowchart;
    SET allvar = NULL;
    SET withchilds = 'N';
    SET all_value := 'N';
    SET cond = '';
    SET idlist = '';

    CREATE TEMPORARY TABLE myouttable (
        variablename VARCHAR(200),
        kind CHAR(1),
        mustquote CHAR(1),
        value TEXT
    );

  SET noflowchart = 'N';

    IF (ndetail IS NULL OR ndetail = 0) THEN
        SET noflowchart = 'S';
        SELECT 'il flowchart non esiste' AS message;
    END IF;

    IF (noflowchart = 'S') THEN
        SELECT * FROM myouttable;
        DROP TEMPORARY TABLE myouttable;
        LEAVE sp_exit;
    END IF;

    INSERT INTO myouttable (variablename, kind, value)
        SELECT variablename, kind, value
        FROM userenvironment
        WHERE idcustomuser = idcustomuser AND kind = 'K';
    -- le costanti sono già a posto (kind=K)

    -- kind=S sono le stored procedures, distinguiamo le compute_set dalla compute_set_withndet
    INSERT INTO myouttable (variablename, kind, value, mustquote)
    SELECT
        variablename,
        kind,
        CASE
            WHEN EXISTS (
                SELECT *
                FROM flowchartrestrictedfunction FF
                JOIN restrictedfunction RF ON RF.idrestrictedfunction = FF.idrestrictedfunction
                WHERE FF.idflowchart = idflowchart AND RF.variablename = userenvironment.variablename
            ) THEN 'S'
            ELSE 'N'
        END AS mustquote
    FROM userenvironment
    WHERE idcustomuser = idcustomuser AND kind = 'S' AND value LIKE 'compute_set';

    -- Fare gestione idsor01-05
    SET @allvar = NULL;
    SET @all_value = 'N';
    SET @withchilds = 'N';

    CREATE TEMPORARY TABLE tab_allowform (tablename VARCHAR(100));

	select tempID = UUID();
    call compute_allowform (@ayear, @idcustomuser,@idflowchart, 'menu', tempID);
    insert into tab_allowform(tablename) select tablename from sp_tmp_output where id = tempID;
    delete from sp_tmp_output where id=tempID;
    -- INSERT INTO tab_allowform  EXEC compute_allowform(@ayear, @idcustomuser, @idflowchart, 'menu');

    -- menu  compute_allowform
    SET @idlist = '';
    SELECT GROUP_CONCAT(QUOTE(tablename)) INTO @idlist FROM tab_allowform;
    -- SELECT @idlist := CONCAT(@idlist, ',', QUOTE(tablename))  FROM tab_allowform;

    INSERT INTO myouttable (variablename, kind, value, mustquote) VALUES ('menu', 'S', SUBSTRING(@idlist, 2), 'N');
    DROP TEMPORARY TABLE tab_allowform;

    -- Notable compute_notable
    SET @idlist = '';
    CREATE TEMPORARY TABLE tab_notable (edittype VARCHAR(100));
    call compute_notable(@ayear, @idcustomuser, @idflowchart, 'notable', tempID);
    insert into tab_notable(edittype) select edittype from sp_tmp_output where id = tempID;
    delete from sp_tmp_output where id=tempID;

    -- SELECT @idlist := CONCAT(@idlist, ',', QUOTE(edittype))  FROM tab_notable;
	SELECT GROUP_CONCAT(QUOTE(edittype)) INTO @idlist FROM tab_notable;
    INSERT INTO myouttable (variablename, kind, value, mustquote)VALUES ('notable', 'S', SUBSTRING(@idlist, 2), 'N');
    DROP TEMPORARY TABLE tab_notable;

    SELECT * FROM myouttable;

    DROP TEMPORARY TABLE myouttable;
END //
DELIMITER ;



DROP PROCEDURE IF EXISTS compute_allowform;


DELIMITER //
CREATE PROCEDURE `compute_allowform` (
    IN ayear INT,
    IN iduser VARCHAR(10),
    IN idflowchart VARCHAR(34),
    IN varname VARCHAR(30),
    IN guid char(36)
)
sp_exit:
BEGIN
    DECLARE tablename VARCHAR(100);

    CREATE TEMPORARY TABLE outtable (
        tablename VARCHAR(100)
    );

    IF (idflowchart IS NULL) THEN
        INSERT INTO outtable
        SELECT metadata
        FROM menu
        WHERE metadata IS NOT NULL;

        SELECT tablename FROM outtable WHERE tablename <> 'no_table';

        if guid is not null then
          insert into sp_tmp_output(id,tablename) select guid, tablename from outtable ORDER BY tablename;
        end if;

        DROP TEMPORARY TABLE IF EXISTS outtable;

        LEAVE sp_exit;
    end if;

	-- example:
    -- INSERT INTO outtable VALUES ('resultparameter');
    -- INSERT INTO outtable VALUES ('export');

	-- ... custom code ...


    IF ((SELECT COUNT(*) FROM outtable) > 0) THEN
		if guid is not null then
          insert into sp_tmp_output(id,tablename) select guid, tablename from outtable ORDER BY tablename;
        end if;

        SELECT DISTINCT tablename FROM outtable WHERE tablename <> 'no_table' ORDER BY tablename;
        DROP TEMPORARY TABLE IF EXISTS outtable;
        LEAVE sp_exit;
    END IF;

    INSERT INTO outtable VALUES ('dummy');

     if guid is not null then
          insert into sp_tmp_output(id,tablename) select guid, tablename from outtable ORDER BY tablename;
     end if;

    SELECT DISTINCT tablename FROM outtable ORDER BY tablename;
    DROP TEMPORARY TABLE IF EXISTS outtable;


END //
DELIMITER ;


DROP PROCEDURE IF EXISTS compute_notable;

DELIMITER //

CREATE PROCEDURE compute_notable (
    IN ayear INT,
    IN iduser VARCHAR(10),
    IN idflowchart VARCHAR(34),
    IN varname VARCHAR(30),
    IN guid char(36)
)
sp_exit: BEGIN
    DECLARE exit_proc BOOLEAN DEFAULT FALSE;

    CREATE TEMPORARY TABLE outtable (
        edittype VARCHAR(100)
    );

    IF (idflowchart IS NULL) THEN
        INSERT INTO outtable
        SELECT DISTINCT edittype
        FROM menu
        WHERE metadata = 'no_table';

		if guid is not null then
          insert into sp_tmp_output(id,edit_type) select guid, edittype from outtable ORDER BY edittype;
        end if;

        SELECT edittype FROM outtable;
        DROP TEMPORARY TABLE IF EXISTS outtable;
        leave sp_exit; -- Uscire immediatamente dalla stored procedure
    END IF;

	-- ... custom code ...


    IF ((SELECT COUNT(*) FROM outtable) > 0) THEN
		if guid is not null then
          insert into sp_tmp_output(id,edit_type) select guid, edittype from outtable ORDER BY edittype;
        end if;

        SELECT DISTINCT edittype FROM outtable ORDER BY edittype;
        DROP TEMPORARY TABLE IF EXISTS outtable;
        leave sp_exit; -- Uscire immediatamente dalla stored procedure
    END IF;

    INSERT INTO outtable VALUES ('dummy');

    if guid is not null then
          insert into sp_tmp_output(id,edit_type) select guid, edittype from outtable ORDER BY edittype;
	end if;
    SELECT edittype FROM outtable ORDER BY edittype;
    DROP TEMPORARY TABLE IF EXISTS outtable;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS compute_roles;

-- CREAZIONE PROCEDURA compute_roles
DELIMITER //
CREATE PROCEDURE compute_roles(
    IN currdate DATE,
    IN idcustomuser VARCHAR(50)
)
BEGIN
    -- Esegui il corpo della procedura...
END //
DELIMITER ;

-- CREAZIONE TABELLA audit --
CREATE TABLE IF NOT EXISTS audit (
    idaudit VARCHAR(30) NOT NULL,
    consequence TEXT NULL,
    flagsystem CHAR(1) NULL,
    lt DATETIME NULL,
    lu VARCHAR(64) NULL,
    severity CHAR(1) NOT NULL,
    title VARCHAR(128) NOT NULL,
    PRIMARY KEY (idaudit)
);

-- Elimina i dati dalla tabella audit
DELETE FROM audit;

-- CREAZIONE TABELLA auditparameter --
CREATE TABLE IF NOT EXISTS auditparameter (
    tablename VARCHAR(150) NOT NULL,
    opkind CHAR(1) NOT NULL,
    isprecheck CHAR(1) NOT NULL,
    parameterid SMALLINT NOT NULL,
    flagoldvalue CHAR(1) NULL,
    paramcolumn VARCHAR(150) NULL,
    paramtable VARCHAR(150) NULL,
    PRIMARY KEY (tablename, opkind, isprecheck, parameterid)
);

-- Elimina i dati dalla tabella auditparameter
DELETE FROM auditparameter;

-- CREAZIONE TABELLA auditcheck --
CREATE TABLE IF NOT EXISTS auditcheck (
    tablename VARCHAR(150) NOT NULL,
    opkind CHAR(1) NOT NULL,
    idaudit VARCHAR(30) NOT NULL,
    idcheck SMALLINT NOT NULL,
    flag_both CHAR(1) NULL,
    flag_cash CHAR(1) NULL,
    flag_comp CHAR(1) NULL,
    flag_credit CHAR(1) NULL,
    flag_proceeds CHAR(1) NULL,
    lt DATETIME NULL,
    lu VARCHAR(64) NULL,
    message VARCHAR(1000) NULL,
    precheck CHAR(1) NULL,
    sqlcmd VARCHAR(6000) NULL,
    PRIMARY KEY (tablename, opkind, idaudit, idcheck)
);

-- Elimina i dati dalla tabella auditcheck
DELETE FROM auditcheck;







-- CREAZIONE TABELLA flowchart --
CREATE TABLE IF NOT EXISTS flowchart (
    idflowchart VARCHAR(34) NOT NULL,
    address VARCHAR(100) NULL,
    ayear INT NULL,
    cap VARCHAR(20) NULL,
    codeflowchart VARCHAR(50) NOT NULL,
    ct DATETIME NOT NULL,
    cu VARCHAR(64) NOT NULL,
    fax VARCHAR(75) NULL,
    idcity INT NULL,
    idsor1 INT NULL,
    idsor2 INT NULL,
    idsor3 INT NULL,
    location VARCHAR(50) NULL,
    lt DATETIME NOT NULL,
    lu VARCHAR(64) NOT NULL,
    nlevel INT NOT NULL,
    paridflowchart VARCHAR(34) NOT NULL,
    phone VARCHAR(55) NULL,
    printingorder VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    PRIMARY KEY (idflowchart)
);

-- Elimina i dati dalla tabella flowchart
DELETE FROM flowchart;



-- CREAZIONE TABELLA flowchartuser --
CREATE TABLE IF NOT EXISTS flowchartuser (
    idflowchart VARCHAR(34) NOT NULL,
    ndetail INT NOT NULL,
    idcustomuser VARCHAR(50) NOT NULL,
    all_sorkind01 CHAR(1) NULL,
    all_sorkind02 CHAR(1) NULL,
    all_sorkind03 CHAR(1) NULL,
    all_sorkind04 CHAR(1) NULL,
    all_sorkind05 CHAR(1) NULL,
    ct DATETIME NOT NULL,
    cu VARCHAR(64) NOT NULL,
    flagdefault CHAR(1) NOT NULL,
    idsor01 INT NULL,
    idsor02 INT NULL,
    idsor03 INT NULL,
    idsor04 INT NULL,
    idsor05 INT NULL,
    lt DATETIME NOT NULL,
    lu VARCHAR(64) NOT NULL,
    sorkind01_withchilds CHAR(1) NULL,
    sorkind02_withchilds CHAR(1) NULL,
    sorkind03_withchilds CHAR(1) NULL,
    sorkind04_withchilds CHAR(1) NULL,
    sorkind05_withchilds CHAR(1) NULL,
    start DATE NULL,
    stop DATE NULL,
    title VARCHAR(150) NULL,
    PRIMARY KEY (idflowchart, ndetail, idcustomuser)
);

-- Elimina i dati dalla tabella flowchartuser
DELETE FROM flowchartuser;



-- CREAZIONE TABELLA menu --
CREATE TABLE IF NOT EXISTS menu (
    idmenu INT NOT NULL,
    edittype VARCHAR(60) NULL,
    lt DATETIME NULL,
    lu VARCHAR(64) NULL,
    menucode VARCHAR(80) NULL,
    metadata VARCHAR(60) NULL,
    modal CHAR(1) NULL,
    ordernumber INT NULL,
    parameter VARCHAR(80) NULL,
    paridmenu INT NULL,
    title VARCHAR(80) NOT NULL,
    userid VARCHAR(80) NULL,
    PRIMARY KEY (idmenu)
);

-- Elimina i dati dalla tabella menu
DELETE FROM menu;



-- Elimina i dati dalla tabella flowchartuser
DELETE FROM flowchartuser;

-- CREAZIONE TABELLA userenvironment --
CREATE TABLE IF NOT EXISTS userenvironment (
    idcustomuser VARCHAR(50) NOT NULL,
    variablename VARCHAR(50) NOT NULL,
    flagadmin CHAR(1) NULL,
    kind CHAR(1) NULL,
    lt DATETIME NULL,
    lu VARCHAR(64) NULL,
    value TEXT NULL,
    PRIMARY KEY (idcustomuser, variablename)
);



-- CREAZIONE TABELLA flowchartrestrictedfunction --
CREATE TABLE IF NOT EXISTS flowchartrestrictedfunction (
    idflowchart VARCHAR(34) NOT NULL,
    idrestrictedfunction INT NOT NULL,
    ct DATETIME NOT NULL,
    cu VARCHAR(64) NOT NULL,
    lt DATETIME NOT NULL,
    lu VARCHAR(64) NOT NULL,
    PRIMARY KEY (idflowchart, idrestrictedfunction)
);



-- CREAZIONE TABELLA restrictedfunction --
CREATE TABLE IF NOT EXISTS restrictedfunction (
    idrestrictedfunction INT NOT NULL,
    ct DATETIME NOT NULL,
    cu VARCHAR(64) NOT NULL,
    description VARCHAR(100) NOT NULL,
    lt DATETIME NOT NULL,
    lu VARCHAR(64) NOT NULL,
    variablename VARCHAR(50) NOT NULL,
    PRIMARY KEY (idrestrictedfunction)
);

-- Elimina i dati dalla tabella restrictedfunction
DELETE FROM restrictedfunction;


-- CREAZIONE TABELLA registryreference --
CREATE TABLE IF NOT EXISTS registryreference (
    idreg INT NOT NULL,
    idregistryreference INT NOT NULL,
    activeweb CHAR(1) ,
    ct DATETIME NOT NULL,
    cu VARCHAR(64) NOT NULL,
    email VARCHAR(200) ,
    faxnumber VARCHAR(50) ,
    flagdefault CHAR(1) ,
    iterweb INT ,
    lt DATETIME NOT NULL,
    lu VARCHAR(64) NOT NULL,
    mobilenumber VARCHAR(20) ,
    msnnumber VARCHAR(50) ,
    passwordweb VARCHAR(40) ,
    pec VARCHAR(200) NULL,
    phonenumber VARCHAR(50)NULL,
    referencename VARCHAR(50) NOT NULL,
    registryreferencerole VARCHAR(50) ,
    rtf MEDIUMBLOB ,
    saltweb VARCHAR(20) ,
    skypenumber VARCHAR(50) ,
    txt TEXT NULL,
    userweb VARCHAR(40) ,
    website VARCHAR(512) ,
    PRIMARY KEY (idreg, idregistryreference)
);

-- Elimina i dati dalla tabella registryreference
DELETE FROM registryreference;


-- CREAZIONE TABELLA registryaddress --
CREATE TABLE IF NOT EXISTS registryaddress (
    idreg INT NOT NULL,
    start DATE NOT NULL,
    idaddresskind INT NOT NULL,
    active CHAR(1) ,
    address VARCHAR(100) ,
    annotations VARCHAR(400) ,
    cap VARCHAR(20) ,
    ct DATETIME ,
    cu VARCHAR(64) ,
    flagforeign CHAR(1) ,
    idcity INT ,
    idnation INT ,
    location VARCHAR(50) ,
    lt DATETIME ,
    lu VARCHAR(64) ,
    officename VARCHAR(50) ,
    recipientagency VARCHAR(50) ,
    stop DATE ,
    PRIMARY KEY (idreg, start, idaddresskind)
);

-- Elimina i dati dalla tabella registryaddress
DELETE FROM registryaddress;



-- CREAZIONE TABELLA attach --
CREATE TABLE IF NOT EXISTS attach (
    idattach INT NOT NULL,
    attachment MEDIUMBLOB ,
    counter INT ,
    ct DATETIME ,
    cu VARCHAR(64) ,
    filename VARCHAR(512) ,
    hash VARCHAR(1000) ,
    lt DATETIME ,
    lu VARCHAR(64) ,
    size BIGINT ,
    PRIMARY KEY (idattach)
);

-- Elimina i dati dalla tabella attach
DELETE FROM attach;




-- [DBO]--
-- CREAZIONE TABELLA menuweb --
CREATE TABLE IF NOT EXISTS menuweb (
    idmenuweb INT NOT NULL,
    editType NVARCHAR(60) ,
    idmenuwebparent INT NULL,
    label NVARCHAR(250) NOT NULL,
    link NVARCHAR(250) ,
    sort INT ,
    tableName NVARCHAR(60) ,
    PRIMARY KEY (idmenuweb)
);

-- Elimina i dati dalla tabella menuweb
DELETE FROM menuweb;

-- Inserisci dati nella tabella menuweb
INSERT INTO menuweb (idmenuweb, editType, idmenuwebparent, label, sort, tableName)
VALUES
    (2, NULL, 1, 'Livello 1', 1, NULL),
    (3, NULL, 2, 'Livello 2', 2, NULL),
    (4, 'edit_type', 3, 'Nome maschera', 1, 'tablenane');


