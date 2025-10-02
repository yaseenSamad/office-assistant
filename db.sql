CREATE TABLE users (
    userId CHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    primaryPhone CHAR(15) NOT NULL,
    secondaryPhone CHAR(15),
    primaryEmail VARCHAR(150) NOT NULL UNIQUE,
    secondaryEmail VARCHAR(150),
    temporaryAddress TEXT,
    permanentAddress TEXT NOT NULL,
    officeId VARCHAR(50) NOT NULL UNIQUE,
    bloodGroup VARCHAR(10) NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('Male','Female','Other') NOT NULL,
    maritalStatus ENUM('Single','Married','Divorced','Widowed') NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    linkedin VARCHAR(255),
    department JSON NOT NULL,
    subDepartment VARCHAR(100) NOT NULL,
    role ENUM('EMPLOYEE','HR','ADMIN') NOT NULL,
    designation VARCHAR(100) NOT NULL,
    reporter CHAR(36) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (reporter),
    FOREIGN KEY (reporter) REFERENCES users(userId) ON DELETE SET NULL
    );


	CREATE TABLE teams (
    teamId CHAR(36) PRIMARY KEY,
    teamName VARCHAR(100) NOT NULL,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- alter table office_assistant.teams add column department 

CREATE TABLE team_members (
    teamMemberId CHAR(36) PRIMARY KEY,
    teamId CHAR(36) NOT NULL,
    userId CHAR(36) NOT NULL,
    roleInTeam ENUM('Manager', 'Lead', 'Member') NOT NULL DEFAULT 'Member',
    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teamId) REFERENCES teams(teamId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE policies (
  policyId CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  documentUrl VARCHAR(500),
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updatedBy CHAR(36) NULL,
  FOREIGN KEY (updatedBy) REFERENCES users(userId) ON DELETE SET NULL
);

CREATE TABLE holidays (
  holId CHAR(36) PRIMARY KEY,
  holDate DATE NOT NULL,
  holName VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE holidays
ADD COLUMN isFloater BOOLEAN NOT NULL DEFAULT FALSE;

Alter table holidays add column description TEXT;