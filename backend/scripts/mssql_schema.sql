-- ============================================================================
-- HR Employee Information System - Microsoft SQL Server (MSSQL) Schema
-- ONLY 2 TABLES: [employee_forms] and [audit_logs] (with [Audit_log] synonym/view)
-- Compatible with: MSSQL 2016, 2019, 2022, Azure SQL, Express editions
-- ============================================================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- ============================================================================
-- 1. TABLE: employee_forms (Employee Information & Registration Master Table)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'employee_forms' AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[employee_forms] (
        -- Primary Key & Reference Identifiers
        [id]                       INT IDENTITY(1,1) NOT NULL,
        [submission_reference]     VARCHAR(32)       NOT NULL,
        [invitation_id]            INT               NULL,
        [submission_status]        VARCHAR(32)       NOT NULL CONSTRAINT [DF_employee_forms_status] DEFAULT ('submitted'),

        -- Phase 1: Basic & Contact Details
        [mobile_number]            VARCHAR(16)       NOT NULL,
        [post]                     NVARCHAR(128)     NULL,
        [name]                     NVARCHAR(255)     NOT NULL,
        [email]                    VARCHAR(255)      NULL,
        [date_of_birth]            DATE              NULL,
        [gender]                   VARCHAR(16)       NULL,
        [local_address]            NVARCHAR(MAX)     NULL,
        [permanent_address]        NVARCHAR(MAX)     NULL,
        [landline]                 VARCHAR(32)       NULL,

        -- Phase 2: Education & Employment Details
        [qualification]            NVARCHAR(255)     NULL,
        [computer_course]          NVARCHAR(255)     NULL,
        [interview_date]           DATE              NULL,
        [reference_name]           NVARCHAR(255)     NULL,
        [date_of_joining]          DATE              NULL,
        [experience_value]         INT               NULL,
        [experience_unit]          VARCHAR(16)       NULL,
        [experience_years]         INT               NULL CONSTRAINT [DF_employee_forms_exp_years] DEFAULT (0),
        [experience_months]        INT               NULL CONSTRAINT [DF_employee_forms_exp_months] DEFAULT (0),

        -- Phase 3: Emergency & Personal / Medical Details
        [emergency_mobile]         VARCHAR(16)       NULL,
        [emergency_person_name]    NVARCHAR(255)     NULL,
        [emergency_relation]       NVARCHAR(64)      NULL,
        [blood_group]              VARCHAR(8)        NULL,
        [willingness_donate_blood] BIT               NOT NULL CONSTRAINT [DF_employee_forms_blood_donate] DEFAULT (0),
        [marital_status]           VARCHAR(16)       NULL,
        [medical_history]          NVARCHAR(MAX)     NULL,
        [legal_history]            NVARCHAR(MAX)     NULL,

        -- Phase 4: Additional Personal Details
        [religion]                 NVARCHAR(64)      NULL,
        [caste]                    NVARCHAR(64)      NULL,
        [spouse_name]              NVARCHAR(255)     NULL,
        [anniversary_date]         DATE              NULL,

        -- System Audit Timestamps (UTC)
        [created_at]               DATETIMEOFFSET    NOT NULL CONSTRAINT [DF_employee_forms_created_at] DEFAULT (SYSUTCDATETIME()),
        [updated_at]               DATETIMEOFFSET    NOT NULL CONSTRAINT [DF_employee_forms_updated_at] DEFAULT (SYSUTCDATETIME()),

        -- Table Constraints
        CONSTRAINT [PK_employee_forms] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [UQ_employee_forms_reference] UNIQUE NONCLUSTERED ([submission_reference] ASC),

        -- Value Check Constraints for Data Integrity
        CONSTRAINT [CK_employee_forms_gender] 
            CHECK ([gender] IS NULL OR [gender] IN ('male', 'female', 'other', 'Male', 'Female', 'Other')),
        CONSTRAINT [CK_employee_forms_blood_group] 
            CHECK ([blood_group] IS NULL OR [blood_group] IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
        CONSTRAINT [CK_employee_forms_marital_status] 
            CHECK ([marital_status] IS NULL OR [marital_status] IN ('single', 'married', 'divorced', 'widowed', 'other', 'Single', 'Married', 'Divorced', 'Widowed')),
        CONSTRAINT [CK_employee_forms_exp_unit] 
            CHECK ([experience_unit] IS NULL OR [experience_unit] IN ('years', 'months', 'Years', 'Months'))
    );

    -- Search & Lookup Indexes
    CREATE NONCLUSTERED INDEX [IX_employee_forms_mobile_number] 
        ON [dbo].[employee_forms]([mobile_number] ASC);
    CREATE NONCLUSTERED INDEX [IX_employee_forms_created_at] 
        ON [dbo].[employee_forms]([created_at] DESC);
    CREATE NONCLUSTERED INDEX [IX_employee_forms_email] 
        ON [dbo].[employee_forms]([email] ASC) WHERE [email] IS NOT NULL;
END;
GO


-- ============================================================================
-- 2. TABLE: audit_logs (Enterprise Security & Action Audit Log)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'audit_logs' AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[audit_logs] (
        [id]             INT IDENTITY(1,1) NOT NULL,
        [timestamp]      DATETIMEOFFSET    NOT NULL CONSTRAINT [DF_audit_logs_timestamp] DEFAULT (SYSUTCDATETIME()),
        [admin_user_id]  INT               NULL,
        [admin_username] VARCHAR(64)       NULL,
        [action_type]    VARCHAR(64)       NOT NULL,
        [details_json]   NVARCHAR(MAX)     NULL, -- JSON payload of audited event
        [ip_address]     VARCHAR(64)       NULL,
        [user_agent]     NVARCHAR(MAX)     NULL,

        CONSTRAINT [PK_audit_logs] PRIMARY KEY CLUSTERED ([id] ASC)
    );

    CREATE NONCLUSTERED INDEX [IX_audit_logs_timestamp] 
        ON [dbo].[audit_logs]([timestamp] DESC);
    CREATE NONCLUSTERED INDEX [IX_audit_logs_action_timestamp] 
        ON [dbo].[audit_logs]([action_type] ASC, [timestamp] DESC);
    CREATE NONCLUSTERED INDEX [IX_audit_logs_admin_user_id] 
        ON [dbo].[audit_logs]([admin_user_id] ASC);
END;
GO


-- ============================================================================
-- 3. SYNONYM/VIEW: Audit_log (Alias so both "audit_logs" and "Audit_log" work)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'Audit_log')
BEGIN
    EXEC('
    CREATE VIEW [dbo].[Audit_log] AS
    SELECT * FROM [dbo].[audit_logs];
    ');
END;
GO

PRINT '===============================================================================';
PRINT 'SUCCESS: [employee_forms] and [audit_logs] tables created ready for production!';
PRINT '===============================================================================';
GO
