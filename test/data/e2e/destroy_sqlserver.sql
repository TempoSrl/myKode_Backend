/*   SETUP DATA DEMO */

IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[web_listredir]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
 drop table [DBO].web_listredir
END
GO

IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[customuser]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
 drop table [DBO].customuser
END
GO

IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[customgroup]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
 drop table [DBO].customgroup
END
GO


IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[customusergroup]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
 drop table [DBO].customusergroup
END
GO


IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[customgroupoperation]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
 drop table [DBO].customgroupoperation
END
GO

IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[flowchart]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
 drop table [DBO].flowchart
END
GO

IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[flowchartuser]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
 drop table [DBO].flowchartuser
END
GO


IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[menu]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
 drop table [DBO].menu
END
GO



IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[userenvironment]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
 drop table [DBO].userenvironment
END
GO


IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[flowchartrestrictedfunction]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
 drop table [DBO].flowchartrestrictedfunction
END
GO


IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[restrictedfunction]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
 drop table [DBO].restrictedfunction
END
GO

if exists (select * from dbo.sysobjects where id = object_id(N'[DBO].[compute_environment]') and OBJECTPROPERTY(id, N'IsProcedure') = 1)
drop procedure [DBO].[compute_environment]
GO



if exists (select * from dbo.sysobjects where id = object_id(N'[DBO].[compute_allowform]') and OBJECTPROPERTY(id, N'IsProcedure') = 1)
drop procedure [DBO].[compute_allowform]
GO


if exists (select * from dbo.sysobjects where id = object_id(N'[DBO].[compute_notable]') and OBJECTPROPERTY(id, N'IsProcedure') = 1)
drop procedure [DBO].[compute_notable]
GO



if exists (select * from dbo.sysobjects where id = object_id(N'[DBO].[compute_roles]') and OBJECTPROPERTY(id, N'IsProcedure') = 1)
drop procedure [DBO].[compute_roles]
GO


-- CREAZIONE VISTA auditcheckview
IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[auditcheckview]') and OBJECTPROPERTY(id, N'IsView') = 1)
DROP VIEW [dbo].[auditcheckview]
GO

IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[audit]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
 drop table [DBO].audit
END
GO

IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[auditparameter]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
 drop table [DBO].auditparameter
END
GO


IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[auditcheck]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
 drop table [DBO].auditcheck
END
GO

IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[virtualuser]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
 drop table [DBO].virtualuser
END
GO


IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[registry]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
DROP TABLE [dbo].[registry]
END

GO

IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[registryclass]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
DROP TABLE [dbo].registryclass
END

GO



IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[registryreference]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
DROP TABLE [dbo].registryreference
END

GO



IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[registryaddress]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
DROP TABLE [dbo].registryaddress
END

GO


IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[attach]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
DROP TABLE [dbo].attach
END

GO



IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[menuweb]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
DROP TABLE [dbo].menuweb
END

GO


-- CREAZIONE VISTA mandateview
IF EXISTS(select * from sysobjects where id = object_id(N'[DBO].[mandateview]') and OBJECTPROPERTY(id, N'IsView') = 1)
DROP VIEW [DBO].[mandateview]
GO

IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[mandate]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
DROP TABLE [dbo].mandate
END

GO


IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[mandatekind]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
DROP TABLE [dbo].mandatekind
END

GO


IF EXISTS(select * from sysobjects where id = object_id(N'[dbo].[mandatedetail]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)
BEGIN
DROP TABLE [dbo].mandatedetail
END

GO
-- FINE GENERAZIONE SCRIPT --








