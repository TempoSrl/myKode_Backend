/*   SETUP DATA DEMO */

SET NOCOUNT ON
GO

-- CREAZIONE TABELLA web_listredir --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[dbo].[web_listredir]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[web_listredir] (
tablename varchar(50) NOT NULL,
listtype varchar(50) NOT NULL,
ct datetime NULL,
cu varchar(64) NULL,
lt datetime NULL,
lu varchar(64) NULL,
newlisttype varchar(50) NULL,
newtablename varchar(50) NULL,
 CONSTRAINT xpkweb_listredir PRIMARY KEY (tablename,listtype
)
)
END
GO

delete from web_listredir
GO



-- CREAZIONE TABELLA customuser --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[dbo].[customuser]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[customuser] (
idcustomuser varchar(50) NOT NULL,
ct datetime NULL,
cu varchar(64) NULL,
lastmodtimestamp datetime NULL,
lastmoduser varchar(64) NULL,
lt datetime NULL,
lu varchar(64) NULL,
username varchar(50) NOT NULL,
 CONSTRAINT xpkcustomuser PRIMARY KEY (idcustomuser
)
)
END
GO

delete from customuser
GO


-- CREAZIONE TABELLA customgroup
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[dbo].[customgroup]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[customgroup] (
idcustomgroup varchar(50) NOT NULL,
ct datetime NULL,
cu varchar(64) NULL,
description varchar(200) NULL,
groupname varchar(80) NULL,
lastmodtimestamp datetime NULL,
lastmoduser varchar(64) NULL,
lt datetime NULL,
lu varchar(64) NULL,
 CONSTRAINT xpkcustomgroup PRIMARY KEY (idcustomgroup
)
)
END
GO

-- organigramma is a special security group
INSERT INTO [customgroup] (idcustomgroup,ct,cu,description,groupname,lastmodtimestamp,lastmoduser,lt,lu) 
	VALUES ('ORGANIGRAMMA',{ts '2007-06-22 14:21:39.013'},'sa','Organigramma','Organigramma',{ts '2007-06-22 14:21:39.013'},'sa',{ts '2007-06-22 14:21:39.013'},'''sa''')
GO



-- CREAZIONE TABELLA customusergroup --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[dbo].[customusergroup]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[customusergroup] (
idcustomgroup varchar(50) NOT NULL,
idcustomuser varchar(50) NOT NULL,
ct datetime NULL,
cu varchar(64) NULL,
lastmodtimestamp datetime NULL,
lastmoduser varchar(64) NULL,
lt datetime NULL,
lu varchar(64) NULL,
 CONSTRAINT xpkcustomusergroup PRIMARY KEY (idcustomgroup,
idcustomuser
)
)
END
GO

-- CREAZIONE TABELLA customgroupoperation --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[dbo].[customgroupoperation]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[customgroupoperation] (
idgroup varchar(50) NOT NULL,
operation char(1) NOT NULL,
tablename varchar(50) NOT NULL,
allowcondition text NULL,
ct datetime NULL,
cu varchar(64) NULL,
defaultisdeny char(1) NOT NULL,
denycondition text NULL,
lastmodtimestamp datetime NULL,
lastmoduser varchar(64) NULL,
lt datetime NULL,
lu varchar(64) NULL,
 CONSTRAINT xpkcustomgroupoperation PRIMARY KEY (idgroup,
operation,
tablename
)
)
END
GO

-- CREAZIONE TABELLA flowchart --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[flowchart]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [DBO].[flowchart] (
idflowchart varchar(34) NOT NULL,
address varchar(100) NULL,
ayear int NULL,
cap varchar(20) NULL,
codeflowchart varchar(50) NOT NULL,
ct datetime NOT NULL,
cu varchar(64) NOT NULL,
fax varchar(75) NULL,
idcity int NULL,
idsor1 int NULL,
idsor2 int NULL,
idsor3 int NULL,
location varchar(50) NULL,
lt datetime NOT NULL,
lu varchar(64) NOT NULL,
nlevel int NOT NULL,
paridflowchart varchar(34) NOT NULL,
phone varchar(55) NULL,
printingorder varchar(50) NOT NULL,
title varchar(150) NOT NULL,
 CONSTRAINT xpkflowchart PRIMARY KEY (idflowchart
)
)
END
GO
delete from flowchart
GO


-- CREAZIONE TABELLA flowchartuser --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[DBO].[flowchartuser]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [DBO].[flowchartuser] (
idflowchart varchar(34) NOT NULL,
ndetail int NOT NULL,
idcustomuser varchar(50) NOT NULL,
all_sorkind01 char(1) NULL,
all_sorkind02 char(1) NULL,
all_sorkind03 char(1) NULL,
all_sorkind04 char(1) NULL,
all_sorkind05 char(1) NULL,
ct datetime NOT NULL,
cu varchar(64) NOT NULL,
flagdefault char(1) NOT NULL,
idsor01 int NULL,
idsor02 int NULL,
idsor03 int NULL,
idsor04 int NULL,
idsor05 int NULL,
lt datetime NOT NULL,
lu varchar(64) NOT NULL,
sorkind01_withchilds char(1) NULL,
sorkind02_withchilds char(1) NULL,
sorkind03_withchilds char(1) NULL,
sorkind04_withchilds char(1) NULL,
sorkind05_withchilds char(1) NULL,
start date NULL,
stop date NULL,
title varchar(150) NULL,
 CONSTRAINT xpkflowchartuser PRIMARY KEY (idflowchart,
ndetail,
idcustomuser
)
)
END
GO

delete from flowchartuser
GO

-- CREAZIONE TABELLA menu --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[DBO].[menu]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [DBO].[menu] (
idmenu int NOT NULL,
edittype varchar(60) NULL,
lt datetime NULL,
lu varchar(64) NULL,
menucode varchar(80) NULL,
metadata varchar(60) NULL,
modal char(1) NULL,
ordernumber int NULL,
parameter varchar(80) NULL,
paridmenu int NULL,
title varchar(80) NOT NULL,
userid varchar(80) NULL,
 CONSTRAINT xpkmenu PRIMARY KEY (idmenu
)
)
END
GO
delete from menu
GO


delete from flowchartuser
GO



-- FINE GENERAZIONE SCRIPT --
-- CREAZIONE TABELLA userenvironment --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[DBO].[userenvironment]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [DBO].[userenvironment] (
idcustomuser varchar(50) NOT NULL,
variablename varchar(50) NOT NULL,
flagadmin char(1) NULL,
kind char(1) NULL,
lt datetime NULL,
lu varchar(64) NULL,
value text NULL,
 CONSTRAINT xpkuserenvironment PRIMARY KEY (idcustomuser,
variablename
)
)
END
GO


-- CREAZIONE TABELLA flowchartrestrictedfunction --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[DBO].[flowchartrestrictedfunction]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [DBO].[flowchartrestrictedfunction] (
idflowchart varchar(34) NOT NULL,
idrestrictedfunction int NOT NULL,
ct datetime NOT NULL,
cu varchar(64) NOT NULL,
lt datetime NOT NULL,
lu varchar(64) NOT NULL,
 CONSTRAINT xpkflowchartrestrictedfunction PRIMARY KEY (idflowchart,
idrestrictedfunction
)
)
END
GO

-- CREAZIONE TABELLA restrictedfunction --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[dbo].[restrictedfunction]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[restrictedfunction] (
idrestrictedfunction int NOT NULL,
ct datetime NOT NULL,
cu varchar(64) NOT NULL,
description varchar(100) NOT NULL,
lt datetime NOT NULL,
lu varchar(64) NOT NULL,
variablename varchar(50) NOT NULL,
 CONSTRAINT xpkrestrictedfunction PRIMARY KEY (idrestrictedfunction
)
)
END
GO



if exists (select * from dbo.sysobjects where id = object_id(N'[DBO].[compute_environment]') and OBJECTPROPERTY(id, N'IsProcedure') = 1)
drop procedure [DBO].[compute_environment]
GO


CREATE  PROCEDURE [DBO].[compute_environment]
(
	@ayear int,
	@idcustomuser varchar(50),
	@idflowchart varchar(34)= null,
	@ndetail int = null
)
AS BEGIN

	if (@idflowchart is null) begin
		select top (1) @idflowchart=  FU.idflowchart,
					@ndetail=FU.ndetail
				from flowchart F
				join flowchartuser FU ON F.idflowchart=FU.idflowchart
				where FU.idcustomuser = @idcustomuser and
				    (FU.start is null or FU.start <= getdate()) and
					(FU.stop is null or FU.stop >= getdate()) and
					(F.ayear = @ayear)
				ORDER BY FU.flagdefault DESC
		print @idflowchart
		print @ndetail
	end

   if (@idflowchart is not null and @ndetail is null) begin
		select top (1) @ndetail=FU.ndetail
				from flowchart F
				join flowchartuser FU ON F.idflowchart=@idflowchart
				where FU.idcustomuser = @idcustomuser and
				    (FU.start is null or FU.start <= getdate()) and
					(FU.stop is null or FU.stop >= getdate()) and
					(F.ayear = @ayear)
				ORDER BY FU.flagdefault DESC
		print @idflowchart
		print @ndetail
	end

declare @codeflowchart varchar(100)
select  @codeflowchart= codeflowchart from flowchart where idflowchart=@idflowchart


select  @idflowchart as idflowchart, @ndetail as ndetail,
		@codeflowchart as codeflowchart



declare @allvar varchar(30)
set @allvar=null

declare @withchilds char(1)
set @withchilds='N'

declare @all_value char(1)
set @all_value='N'

declare @cond varchar(1000)
set @cond=''

declare @idvar varchar(30)

declare @idlist varchar(max)
set @idlist=''


CREATE TABLE #myouttable
(	variablename varchar(200),
	kind char(1),
	mustquote char(1),
	value text
)

/*
EXEC compute_environment 2021,'AZZURRO',null,null

*/

declare @noflowchart char (1)
set @noflowchart='N'
IF (@ndetail IS NULL OR @ndetail = 0) begin
	SET @noflowchart='S'
	print 'il flowchart non esiste'
END

if (@noflowchart='S') begin
	select * from #myouttable
	drop table #myouttable
	return
end

insert into #myouttable (variablename, kind, value) select variablename, kind, value
	 from userenvironment where idcustomuser=@idcustomuser and kind='K'
--le costanti sono già a posto (kind=K)

--kind=S sono le stored procedures, distinguiamo le compute_set dalla compute_set_withndet
insert into #myouttable (variablename, kind, value,mustquote)
	select variablename, kind,
		case when (exists (SELECT *
						FROM flowchartrestrictedfunction FF
						JOIN restrictedfunction RF		ON RF.idrestrictedfunction = FF.idrestrictedfunction
						WHERE FF.idflowchart = @idflowchart	AND RF.variablename = userenvironment.variablename))
					then 'S'
					else 'N'
		end,'S'
	from userenvironment
	where idcustomuser=@idcustomuser and kind='S' and value like 'compute_set'




DECLARE @nrowfound int

--fare gestione idsor01-05
set @allvar=null
set @all_value='N'
set @withchilds='N'

CREATE TABLE #tab_allowform(	tablename varchar(100))

INSERT  #tab_allowform EXEC compute_allowform @ayear,@idcustomuser,@idflowchart,'menu'


	--menu  compute_allowform
	set @idlist=''
	select @idlist = @idlist+','''+convert(varchar(50),tablename)+''''  from #tab_allowform
    INSERT INTO #myouttable(variablename, kind, value,mustquote) VALUES('menu','S',substring(@idlist,2,len(@idlist)),'N')
	drop table #tab_allowform

	--notable   compute_notable
	set @idlist=''
	CREATE TABLE #tab_notable(	edittype varchar(100))
	INSERT  #tab_notable EXEC compute_notable @ayear,@idcustomuser,@idflowchart,'notable'
	select @idlist = @idlist+','''+convert(varchar(30),edittype)+''''  from #tab_notable
    INSERT INTO #myouttable(variablename, kind, value,mustquote)	 VALUES('notable','S',substring(@idlist,2,len(@idlist)),'N')
	drop table #tab_notable

	select * from #myouttable

	drop table #myouttable
END
GO

if exists (select * from dbo.sysobjects where id = object_id(N'[DBO].[compute_allowform]') and OBJECTPROPERTY(id, N'IsProcedure') = 1)
drop procedure [DBO].[compute_allowform]
GO

CREATE PROCEDURE [DBO].[compute_allowform]
(
	@ayear int,
	@iduser varchar(10),
	@idflowchart varchar(34),
	@varname varchar(30)=null
)
AS BEGIN

CREATE TABLE #outtable
(
	tablename varchar(100)
)

IF (@idflowchart IS NULL)
BEGIN
	INSERT INTO #outtable
	SELECT  metadata
	FROM menu
	WHERE metadata IS NOT NULL

	SELECT tablename FROM #outtable where tablename <>'no_table'
	drop table #outtable

	RETURN
END

INSERT INTO #outtable VALUES('resultparameter')
INSERT INTO #outtable VALUES('export')


IF ((SELECT COUNT(*) FROM #outtable) > 0)
BEGIN
	SELECT distinct tablename FROM #outtable where tablename <>'no_table' order by tablename
	drop table #outtable
	RETURN
END

INSERT INTO #outtable VALUES('dummy')
SELECT DISTINCT tablename FROM #outtable order by tablename
drop table #outtable
END

GO



if exists (select * from dbo.sysobjects where id = object_id(N'[DBO].[compute_notable]') and OBJECTPROPERTY(id, N'IsProcedure') = 1)
drop procedure [DBO].[compute_notable]
GO

CREATE PROCEDURE [DBO].compute_notable
(
	@ayear int,
	@iduser varchar(10),
	@idflowchart varchar(34),
	@varname varchar(30)
)
AS BEGIN

CREATE TABLE #outtable
(
	edittype varchar(100)
)

IF (@idflowchart IS NULL)
BEGIN
	INSERT INTO #outtable
	SELECT DISTINCT edittype
	FROM menu
	WHERE metadata = 'no_table'

	SELECT edittype FROM #outtable
	RETURN
END


IF ((SELECT COUNT(*) FROM #outtable) > 0)
BEGIN
	SELECT distinct edittype FROM #outtable order by edittype
	RETURN
END

INSERT INTO #outtable VALUES('dummy')
SELECT edittype FROM #outtable order by edittype
drop table #outtable

END
GO




if exists (select * from dbo.sysobjects where id = object_id(N'[DBO].[compute_roles]') and OBJECTPROPERTY(id, N'IsProcedure') = 1)
drop procedure [DBO].[compute_roles]
GO
--setuser 'amm'
--select * from flowchartuser
--compute_roles '01-01-2020','bianco'
CREATE PROCEDURE [DBO].compute_roles
(
	@currdate date,
	@idcustomuser varchar(50)
)
AS BEGIN
		select U.idflowchart,
			isnull(U.title,F.title) as  title,
				U.ndetail,
				(U.idflowchart+'§'+convert(varchar(10),U.ndetail)) as k
				from flowchartuser U
					join flowchart F on U.idflowchart=F.idflowchart where
					F.ayear=year(@currdate) and
					U.idcustomuser = @idcustomuser and
						(U.start is null or U.start<= @currdate) and
						(U.stop is null or U.stop>= @currdate)
		order by 2


END

GO
SET QUOTED_IDENTIFIER OFF
GO
SET ANSI_NULLS ON
GO

-- CREAZIONE TABELLA audit --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[DBO].[audit]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [DBO].[audit] (
idaudit varchar(30) NOT NULL,
consequence text NULL,
flagsystem char(1) NULL,
lt datetime NULL,
lu varchar(64) NULL,
severity char(1) NOT NULL,
title varchar(128) NOT NULL,
 CONSTRAINT xpkaudit PRIMARY KEY (idaudit
)
)
END
GO

delete from audit
GO

-- CREAZIONE TABELLA auditparameter --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[DBO].[auditparameter]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [DBO].[auditparameter] (
tablename varchar(150) NOT NULL,
opkind char(1) NOT NULL,
isprecheck char(1) NOT NULL,
parameterid smallint NOT NULL,
flagoldvalue char(1) NULL,
paramcolumn varchar(150) NULL,
paramtable varchar(150) NULL,
 CONSTRAINT xpkauditparameter PRIMARY KEY (tablename,
opkind,
isprecheck,
parameterid
)
)
END
GO

delete from auditparameter
GO

-- CREAZIONE TABELLA auditcheck --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[DBO].[auditcheck]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [DBO].[auditcheck] (
tablename varchar(150) NOT NULL,
opkind char(1) NOT NULL,
idaudit varchar(30) NOT NULL,
idcheck smallint NOT NULL,
flag_both char(1) NULL,
flag_cash char(1) NULL,
flag_comp char(1) NULL,
flag_credit char(1) NULL,
flag_proceeds char(1) NULL,
lt datetime NULL,
lu varchar(64) NULL,
message varchar(1000) NULL,
precheck char(1) NULL,
sqlcmd varchar(6000) NULL,
 CONSTRAINT xpkauditcheck PRIMARY KEY (tablename,
opkind,
idaudit,
idcheck
)
)
END
GO

delete from auditcheck
GO



-- CREAZIONE VISTA auditcheckview
IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[auditcheckview]') and OBJECTPROPERTY(id, N'IsView') = 1)
DROP VIEW [dbo].[auditcheckview]
GO

CREATE VIEW [dbo].auditcheckview
	(
	tablename,
	opkind,
	idcheck,
	idaudit,
	title,
	severity,
	sqlcmd,
	message,
	precheck,
	flag_comp,
	flag_cash,
	flag_both,
	flag_credit,
	flag_proceeds
	)
	AS SELECT
	auditcheck.tablename,
	auditcheck.opkind,
	auditcheck.idcheck,
	auditcheck.idaudit,
	audit.title,
	audit.severity,
	auditcheck.sqlcmd,
	auditcheck.message,
	auditcheck.precheck,
	auditcheck.flag_comp,
	auditcheck.flag_cash,
	auditcheck.flag_both,
	auditcheck.flag_credit,
	auditcheck.flag_proceeds
	FROM auditcheck (NOLOCK)
	JOIN audit (NOLOCK)
	ON audit.idaudit = auditcheck.idaudit
GO

------------------------------------------------------------------------------------------------------------------------
---------------------------------- FINE DATI PER REGOLE POST -----------------------------------------------------------

---------------------------------- DATI PER LOGIN ----------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------------
--[DBO]--
-- CREAZIONE TABELLA virtualuser --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[dbo].[virtualuser]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[virtualuser] (
idvirtualuser int NOT NULL,
birthdate date NULL,
cf varchar(16) NULL,
codicedipartimento varchar(50) NOT NULL,
email varchar(200) NULL,
forename varchar(50) NOT NULL,
lt datetime NULL,
lu varchar(64) NULL,
surname varchar(50) NOT NULL,
sys_user varchar(30) NOT NULL,
userkind smallint NOT NULL,
username varchar(50) NOT NULL,
 CONSTRAINT xpkvirtualuser PRIMARY KEY (idvirtualuser
)
)
END
GO

delete from virtualuser
GO

IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[registry]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN

DROP TABLE [dbo].[registry]
END


GO
-- CREAZIONE TABELLA registry --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[dbo].[registry]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[registry] (
idreg int NOT NULL,
active char(1) NOT NULL,
annotation varchar(400) NULL,
authorization_free char(1) NULL,
badgecode varchar(20) NULL,
birthdate date NULL,
ccp varchar(12) NULL,
cf varchar(16) NULL,
ct datetime NOT NULL,
cu varchar(64) NOT NULL,
email_fe varchar(200) NULL,
extension varchar(200) NULL,
extmatricula varchar(40) NULL,
flag_pa char(1) NULL,
flagbankitaliaproceeds char(1) NULL,
foreigncf varchar(40) NULL,
forename varchar(50) NULL,
gender char(1) NULL,
idaccmotivecredit varchar(36) NULL,
idaccmotivedebit varchar(36) NULL,
idcategory varchar(2) NULL,
idcentralizedcategory varchar(20) NULL,
idcity int NULL,
idexternal int NULL,
idmaritalstatus varchar(20) NULL,
idnation int NULL,
idregistryclass varchar(2) NULL,
idregistrykind int NULL,
idtitle varchar(20) NULL,
ipa_fe varchar(7) NULL,
ipa_perlapa varchar(100) NULL,
location varchar(50) NULL,
lt datetime NOT NULL,
lu varchar(64) NOT NULL,
maritalsurname varchar(50) NULL,
multi_cf char(1) NULL,
p_iva varchar(15) NULL,
pec_fe varchar(200) NULL,
residence int NOT NULL,
rtf image NULL,
sdi_defrifamm varchar(20) NULL,
sdi_norifamm char(1) NULL,
surname varchar(50) NULL,
title varchar(101) NULL,
toredirect int NULL,
txt text NULL,
 CONSTRAINT xpkregistry PRIMARY KEY (idreg
)
)
END
GO

delete from registry
GO


-- CREAZIONE TABELLA registryclass --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[dbo].[registryclass]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[registryclass] (
idregistryclass varchar(2) NOT NULL,
active char(1) NULL,
ct datetime NOT NULL,
cu varchar(64) NOT NULL,
description varchar(150) NOT NULL,
flagbadgecode char(1) NOT NULL,
flagbadgecode_forced char(1) NOT NULL,
flagCF char(1) NOT NULL,
flagcf_forced char(1) NOT NULL,
flagcfbutton char(1) NULL,
flagextmatricula char(1) NOT NULL,
flagextmatricula_forced char(1) NOT NULL,
flagfiscalresidence char(1) NOT NULL,
flagfiscalresidence_forced char(1) NOT NULL,
flagforeigncf char(1) NOT NULL,
flagforeigncf_forced char(1) NOT NULL,
flaghuman char(1) NULL,
flaginfofromcfbutton char(1) NULL,
flagmaritalstatus char(1) NOT NULL,
flagmaritalstatus_forced char(1) NOT NULL,
flagmaritalsurname char(1) NOT NULL,
flagmaritalsurname_forced char(1) NOT NULL,
flagothers char(1) NOT NULL,
flagothers_forced char(1) NOT NULL,
flagp_iva char(1) NOT NULL,
flagp_iva_forced char(1) NOT NULL,
flagqualification char(1) NOT NULL,
flagqualification_forced char(1) NOT NULL,
flagresidence char(1) NOT NULL,
flagresidence_forced char(1) NOT NULL,
flagtitle char(1) NOT NULL,
flagtitle_forced char(1) NOT NULL,
lt datetime NOT NULL,
lu varchar(64) NOT NULL,
 CONSTRAINT xpkregistryclass PRIMARY KEY (idregistryclass
)
)
END
GO

delete from registryclass
GO


-- CREAZIONE TABELLA registryreference --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[dbo].[registryreference]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[registryreference] (
idreg int NOT NULL,
idregistryreference int NOT NULL,
activeweb char(1) NULL,
ct datetime NOT NULL,
cu varchar(64) NOT NULL,
email varchar(200) NULL,
faxnumber varchar(50) NULL,
flagdefault char(1) NULL,
iterweb int NULL,
lt datetime NOT NULL,
lu varchar(64) NOT NULL,
mobilenumber varchar(20) NULL,
msnnumber varchar(50) NULL,
passwordweb varchar(40) NULL,
pec varchar(200) NULL,
phonenumber varchar(50) NULL,
referencename varchar(50) NOT NULL,
registryreferencerole varchar(50) NULL,
rtf image NULL,
saltweb varchar(20) NULL,
skypenumber varchar(50) NULL,
txt text NULL,
userweb varchar(40) NULL,
website varchar(512) NULL,
 CONSTRAINT xpkregistryreference PRIMARY KEY (idreg,
idregistryreference
)
)
END
GO

delete from registryreference
GO



-- CREAZIONE TABELLA registryaddress --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[dbo].[registryaddress]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[registryaddress] (
idreg int NOT NULL,
start date NOT NULL,
idaddresskind int NOT NULL,
active char(1) NULL,
address varchar(100) NULL,
annotations varchar(400) NULL,
cap varchar(20) NULL,
ct datetime NULL,
cu varchar(64) NULL,
flagforeign char(1) NULL,
idcity int NULL,
idnation int NULL,
location varchar(50) NULL,
lt datetime NULL,
lu varchar(64) NULL,
officename varchar(50) NULL,
recipientagency varchar(50) NULL,
stop date NULL,
 CONSTRAINT xpkregistryaddress PRIMARY KEY (idreg,
start,
idaddresskind
)
)
END
GO

delete from registryaddress
GO

--[DBO]--
-- FINE GENERAZIONE SCRIPT --

--[DBO]--
-- CREAZIONE TABELLA attach --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[dbo].[attach]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[attach] (
idattach int NOT NULL,
attachment image NULL,
counter int NULL,
ct datetime NULL,
cu varchar(64) NULL,
filename varchar(512) NULL,
hash varchar(max) NULL,
lt datetime NULL,
lu varchar(64) NULL,
size bigint NULL,
 CONSTRAINT xpkattach PRIMARY KEY (idattach
)
)
END
GO

delete from attach
GO


--[DBO]--
-- CREAZIONE TABELLA menuweb --
IF NOT EXISTS(select * from sysobjects where id = object_id(N'[dbo].[menuweb]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
CREATE TABLE [dbo].[menuweb] (
idmenuweb int NOT NULL,
editType nvarchar(60) NULL,
idmenuwebparent int NULL,
label nvarchar(250) NOT NULL,
link nvarchar(250) NULL,
sort int NULL,
tableName nvarchar(60) NULL,
 CONSTRAINT xpkmenuweb PRIMARY KEY (idmenuweb
)
)
END
GO
delete from menuweb

insert into [menuweb] (idmenuweb, edittype, idmenuwebparent, sort,tablename, label)
    values(2,null, 1, 1, null, 'Livello 1')
insert into [menuweb] (idmenuweb, edittype, idmenuwebparent, sort,tablename, label)
    values(3,null, 2, 2, null, 'Livello 2')
--insert into [menuweb] (idmenuweb, edittype, idmenuwebparent, sort,tablename, label) values(4,null, 3, 1, null, 'Contratti')
insert into [menuweb] (idmenuweb, edittype, idmenuwebparent, sort,tablename, label)
    values(4,'edit_type', 3, 1, 'tablenane', 'Nome maschera')


GO