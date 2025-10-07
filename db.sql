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


CREATE TABLE posts (
  postId CHAR(36) NOT NULL,
  content TEXT NOT NULL,
  authorId CHAR(36) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (postId),
  FOREIGN KEY (authorId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE likes (
  likeId CHAR(36) NOT NULL,
  postId CHAR(36) NOT NULL,
  userId CHAR(36) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (likeId),
  FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
  UNIQUE KEY unique_like (postId, userId)
);

CREATE TABLE comments (
  commentId CHAR(36) NOT NULL,
  postId CHAR(36) NOT NULL,
  userId CHAR(36) NOT NULL,
  content TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (commentId),
  FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);



alter table likes add column  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP


CREATE TABLE leave_types (
  leaveTypeId CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  totalAllowed INT DEFAULT 0,
  isHalfDayAllowed BOOLEAN DEFAULT FALSE,
  carryForward BOOLEAN DEFAULT FALSE,
  createdBy CHAR(36),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(userId) ON DELETE SET NULL
);

CREATE TABLE leave_requests (
  leaveId CHAR(36) PRIMARY KEY,
  userId CHAR(36) NOT NULL,
  leaveTypeId CHAR(36) NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  durationDays FLOAT NOT NULL,
  reason TEXT,
  status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  declineReason TEXT,
  approvedBy CHAR(36) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
  FOREIGN KEY (leaveTypeId) REFERENCES leave_types(leaveTypeId) ON DELETE CASCADE,
  FOREIGN KEY (approvedBy) REFERENCES users(userId) ON DELETE SET NULL
);






alter table leave_requests modify column leaveTypeId CHAR(36) null;

ALTER TABLE leave_requests
ADD CONSTRAINT leave_requests_leaveTypeId_fk
FOREIGN KEY (leaveTypeId) REFERENCES leave_types(leaveTypeId)
ON DELETE SET NULL;


ALTER TABLE office_assistant.leave_requests MODIFY COLUMN durationDays float DEFAULT 1 NOT NULL;
