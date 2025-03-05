### Users (Users) ###
This table stores information about the users who are interacting with the database. It allows users to register and store their credentials (encrypted passwords). 
#### **Attributes:**
  -  user_id (PK, INT, NOT NULL) → Unique identifier for each user.
  -  username (VARCHAR(20), NOT NULL) → User’s chosen name.
  -  password (VARCHAR(20), NOT NULL) → User’s password.
#### **Relationships:**
  -  One-to-Many with Events → A user can create zero or more events.
  -  Many-to-Many with Categories through UserCategoryPreferences → A user can have zero or many preferences for default shown event categories.
#### **Normalization:**
  -  The table is in BCNF.
  -  FD: user_id -> username, password
  -  There’s only one FD, and its LHS user_id is the superkey.
### Events (Events) ###
This table stores the historical event data. Each row represents an individual event with relevant details.
#### **Attributes:**
  -  event_id (PK, INT, NOT NULL) → Unique identifier for each event.
  -  created_by (FK, INT) → References user_id in Users, indicating which user created the event.
  -  event_name (VARCHAR(20)) → Name of the event.
  -  event_date (DATE, NOT NULL) → Date when the event occurs.
  -  event_description (STRING, NOT NULL) → Description of the event.
#### **Relationships:**
  -  Many-to-One with Users → Each event is created by exactly one user.
  -  Many-to-Many with Categories through EventCategory → Each event can belong to one or multiple categories.
#### **Normalization:**
  -  The table is in BCNF:
  -  FD: event_id -> created_by, event_name, event_date, event_description
  -  There’s only one FD, and its LHS event_id is the superkey.
### User Preferences for Categories (UserCategoryPreferences) ###
This table stores the preferences for each user about the categories of events they are interested in. It provides a way to customize the timeline by allowing users to select and save their preferred event categories.
#### **Attributes:**
  -  user_id (PK, FK, INT, NOT NULL) → References Users, representing the user.
  -  category_id (PK, FK, INT, NOT NULL) → References Categories, representing the preferred category.
#### **Relationships:**
  -  Many-to-Many between Users and Categories → A user can select multiple categories as preferences, a category can be preferred by multiple users.
#### **Normalization:**
  -  The table is in BCNF:
  -  user_id, category_id is the superkey and a composite key.
### Categories (Categories) ###
This table organizes events into broader categories. Categories help group events by type and can be used as filters when users want to view events from specific types.
#### **Attributes:**
  -  category_id (PK, INT, NOT NULL) → Unique identifier for each category.
  -  category_name (VARCHAR(20), NOT NULL) → Name of the category.
  -  cat_description (STRING) → Description of the category.
#### **Relationships:**
  -  One-to-Many within Categories through categoryHierarchy → A category can have zero or more subcategories.
#### **Normalization:**
  -  The table is in BCNF:
  -  FD: category_id -> category_name, cat_description
  -  There’s only one FD, and its LHS category_id is the superkey.
### Sources (Sources) ###
This table organizes the sources for each event. 
#### **Attributes:**
  - source_id (PK, INT, NOT NULL) → Unique identifier for each source.
  - source_name(VARCHAR(20)) → Name of the source.
  - author(VARCHAR(20)) → Author of the source.
  - year(INT) → Year of the source.
#### **Relationships:**
  - One-to-Many with Events → one source may be associated with multiple events, but each event should have pulled from just one source.
#### **Normalization:**
  - The table is in BCNF:
  - FD: source_id → source_name, author, year
### Category Hierarchy (categoryHierarchy) ###
This table represents many-to-many relationships within categories. It allows for categories to contain multiple sub-categories.
#### **Attributes:**
  -  parent_category_id (PK, FK, INT, NOT NULL) → References Categories, representing the parent category.
  -  category_descendent (PK, FK, INT, NOT NULL) → References Categories, representing a sub-category.
#### **Relationships:**
  -  Many-to-Many within Categories → A category can have multiple subcategories.
#### **Normalization:**
  -  The table is in BCNF:
  -  parent_category_id, category_descendent is the superkey and a composite key.
### Extra Relationships ###
These are the additional many-to-many relationships implemented in the database.
#### **UserCategoryPreferences:**
  - Defines a many-to-many relationship between Users and Categories, allowing users to specify which categories they are interested in
  - A user can select multiple categories
  - A category can be selected by multiple users
#### **EventCategories:**
  - Defines a many-to-many relationship between Events and Categories, allowing events to belong to multiple categories
  - An event can belong to multiple categories
  - A category can contain multiple events

## Logical Database Schema: ##
**Users Table:** 
Users(user_id:int[PK],
username:VARCHAR(20) NOT NULL,
password: VARCHAR(20) NOT NULL)

**Events Table:**
Events(event_id: INT [PK],
	created_by: INT [FK to Users.user_id],
	event_name: VARCHAR(20),
	event_date: DATE NOT NULL,
	event_description: STRING NOT NULL)

**Sources Table:**
Sources(source_id: INT [PK],
  source_name: VARCHAR(20),
  author: VARCHAR(20),
  year: INT)

**Categories Table:**
Categories(category_id: INT [PK],
	category_name: VARCHAR(20) NOT NULL,
	cat_description: STRING)

**Category Hierarchy:**
categoryHierarchy(parent_category_id: INT [PK, FK to Categories.category_id],
category_descendent: INT [PK, FK to Categories.category_id])
