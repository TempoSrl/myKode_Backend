SET NOCOUNT ON

CREATE TABLE customer(
	idcustomer int NOT NULL,
	name varchar(100) NULL,
	age int NULL,
	birth datetime NULL,
	surname varchar(100) NULL,
	stamp datetime NULL,
	random int NULL,
	curr decimal(19,2) NULL,
    CONSTRAINT xpkcustomer PRIMARY KEY  (idcustomer)
) ;
GO



CREATE PROCEDURE ctemp AS 
BEGIN
DECLARE @i int;
SET @i = 1;
while @i < 500 BEGIN
 insert into customer(idcustomer,name,age,birth,surname,stamp,random,curr) values(
			 @i, 		 concat('name',convert(VARCHAR(10),@i) ),
			10+@i,		'2010-24-09 12:27:38',
			concat('surname_',convert(VARCHAR(10),@i*2+100000)),
			GETDATE(),
			RAND()*1000,
			RAND()*10000 );
 SET @i = @i+1;
END 
END


GO

exec ctemp;
GO

DROP PROCEDURE  ctemp;





CREATE TABLE seller(
	idseller int NOT NULL,
	name varchar(100) NULL,
	age int NULL,
	birth datetime NULL,
	surname varchar(100) NULL,
	stamp datetime NULL,
	random int NULL,
	curr decimal(19,2) NULL,
	cf varchar(200),
	rtf image NULL,
	CONSTRAINT PK_seller PRIMARY KEY  (idseller)
);

GO

CREATE PROCEDURE ctemp AS
BEGIN
declare @i int
set @i=1;
while (@i<600) BEGIN
insert into seller (idseller,name,age,birth,surname,stamp,random,curr,rtf,cf) values(
			 @i,
			 concat('name',convert(varchar(10),@i)	)	,10+@i,
			'2010-24-02 12:27:38',
			concat('surname_',convert(varchar(10),@i*2+100000)),
			GETDATE(),
			RAND()*1000,
			RAND()*10000,
			0xFFFE69006600200065007800690073007400730020002800730065006C0065006300740020002A002000660072006F006D002000640062006F002E007300790073006F0062006A00650063007400730020007700680065007200650020006900640020003D0020006F0062006A006500630074005F006900640028004E0027005B00640062006F005D002E005B0075006E006900660069006500640074006100780063006F00720072006900670065005D0027002900200061006E00640020004F0042004A00450043005400500052004F00500045005200540059002800690064002C0020004E0027004900730055007300650072005400610062006C0065002700290020003D002000310029000D000A00640072006F00700020007400610062006C00650020005B00640062006F005D002E005B0075006E006900660069006500640074006100780063006F00720072006900670065005D000D000A0047004F000D000A000D000A0043005200450041005400450020005400410042004C00450020005B00640062006F005D002E005B0075006E006900660069006500640074006100780063006F00720072006900670065005D00200028000D000A0009005B006900640075006E006900660069006500640074006100780063006F00720072006900670065005D0020005B0069006E0074005D0020004E004F00540020004E0055004C004C0020002C000D000A0009005B006900640065007800700065006E007300650074006100780063006F00720072006900670065005D0020005B0069006E0074005D0020004E004F00540020004E0055004C004C0020002C000D000A0009005B0074006100780063006F00640065005D0020005B0069006E0074005D0020004E004F00540020004E0055004C004C0020002C000D000A0009005B00610079006500610072005D0020005B0073006D0061006C006C0069006E0074005D0020004E0055004C004C0020002C000D000A0009005B0065006D0070006C006F00790061006D006F0075006E0074005D0020005B0064006500630069006D0061006C005D002800310039002C0020003200290020004E0055004C004C0020002C000D000A0009005B00610064006D0069006E0061006D006F0075006E0074005D0020005B0064006500630069006D0061006C005D002800310039002C0020003200290020004E0055004C004C0020002C000D000A0009005B006900640063006900740079005D0020005B0069006E0074005D0020004E0055004C004C0020002C000D000A0009005B0069006400660069007300630061006C0074006100780072006500670069006F006E005D0020005B0076006100720063006800610072005D002000280035002900200043004F004C004C004100540045002000530051004C005F004C006100740069006E0031005F00470065006E006500720061006C005F004300500031005F00430049005F004100530020004E0055004C004C0020002C000D000A0009005B00610064006100740065005D0020005B006400610074006500740069006D0065005D0020004E0055004C004C0020002C000D000A0009005B00630074005D0020005B006400610074006500740069006D0065005D0020004E004F00540020004E0055004C004C0020002C000D000A0009005B00630075005D0020005B0076006100720063006800610072005D0020002800360034002900200043004F004C004C004100540045002000530051004C005F004C006100740069006E0031005F00470065006E006500720061006C005F004300500031005F00430049005F004100530020004E004F00540020004E0055004C004C0020002C000D000A0009005B006C0074005D0020005B006400610074006500740069006D0065005D0020004E004F00540020004E0055004C004C0020002C000D000A0009005B006C0075005D0020005B0076006100720063006800610072005D0020002800360034002900200043004F004C004C004100540045002000530051004C005F004C006100740069006E0031005F00470065006E006500720061006C005F004300500031005F00430049005F004100530020004E004F00540020004E0055004C004C0020002C000D000A0009005B006E006D006F006E00740068005D0020005B0073006D0061006C006C0069006E0074005D0020004E0055004C004C0020002C000D000A0009005B0069006400640062006400650070006100720074006D0065006E0074005D0020005B0076006100720063006800610072005D0020002800350030002900200043004F004C004C004100540045002000530051004C005F004C006100740069006E0031005F00470065006E006500720061006C005F004300500031005F00430049005F004100530020004E0055004C004C0020002C000D000A0009005B00690064007200650067005D0020005B0069006E0074005D0020004E0055004C004C0020002C000D000A0009005B0079006D006F0076005D0020005B0073006D0061006C006C0069006E0074005D0020004E0055004C004C0020002C000D000A0009005B006E006D006F0076005D0020005B0069006E0074005D0020004E0055004C004C0020002C000D000A0009005B006E007000610079005D0020005B0069006E0074005D0020004E0055004C004C0020002C000D000A0009005B00690064006500780070005D0020005B0069006E0074005D0020004E0055004C004C0020000D000A00290020004F004E0020005B005000520049004D004100520059005D000D000A0047004F000D000A000D000A00,
			convert(varchar(20),RAND()*100000)
            );
set @i=@i+1;
end 
--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
END

GO

exec ctemp;


DROP PROCEDURE  ctemp;





CREATE TABLE sellerkind(
	idsellerkind int NOT NULL,
	name varchar(100) NULL,
	rnd int NULL,
    CONSTRAINT PK_sellerkind PRIMARY KEY  (idsellerkind)
);



GO

CREATE PROCEDURE ctemp AS 
BEGIN
declare @i int

set @i=0;
while (@i<20) BEGIN
insert into sellerkind (idsellerkind,name,rnd) values(
			 @i*30,
			 concat('name',convert(varchar(10),@i*30)),
			 RAND()*1000
		);
set @i=@i+1;
end 

END


GO

exec ctemp;


DROP PROCEDURE  ctemp;



CREATE TABLE customerkind(
	idcustomerkind int NOT NULL,
	name varchar(100) NULL,
	rnd int NULL,
    CONSTRAINT PK_customerkind PRIMARY KEY  (idcustomerkind)
) ;



GO

CREATE PROCEDURE ctemp AS
BEGIN
declare @i int

set @i=0;
while (@i<40) BEGIN
insert into customerkind (idcustomerkind,name,rnd) values(
			 @i*3,
			 concat('name',convert(varchar(10),@i*3)),
			RAND()*1000
		);
set @i=@i+1;
end ;


END


GO

exec ctemp;
GO

DROP PROCEDURE  ctemp;

GO

CREATE PROCEDURE testSP2 (@esercizio int,   @meseinizio int,  @mess varchar(200),   @defparam decimal(19,2)=2 ) AS
BEGIN         
         select 'aa' as colA, 'bb' as colB, 12 as colC , @esercizio as original_esercizio,
         replace(@mess,'a','z') as newmess,   @defparam*2 as newparam;
END
GO


CREATE PROCEDURE testSP1( @esercizio int, @meseinizio int, @mesefine int OUTPUT,	@mess varchar(200), 	@defparam decimal(19,2)=2 ) AS
BEGIN
	set @mesefine= 12;
	select 'a' as colA, 'b' as colB, 12 as colC , @esercizio as original_esercizio,
		replace(@mess,'a','z') as newmess,
		@defparam*2 as newparam;
END

GO


CREATE  PROCEDURE  testSP3 (@esercizio int=0) AS
BEGIN
	select top 100 * from customer ;
	select top 100 * from seller ;
	select top 10 * from customerkind as c2 ;
	select top 10 * from sellerkind as s2 ;
END

GO

