## Logical Database Schema: 
CREATE TABLE Users (
    user_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL );

CREATE TABLE Sources (
    source_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    source_name VARCHAR(50),
    author VARCHAR(50),
    source_year INT );

CREATE TABLE Events (
    event_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    event_name VARCHAR(50),
    event_date DATE,
    event_description VARCHAR(255),
    source_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (source_id) REFERENCES Sources(source_id) ON DELETE SET NULL );

CREATE TABLE IF NOT EXISTS Categories (
    category_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL,
    cat_description VARCHAR(255) );

CREATE TABLE categoryHierarchy (
   parent_category_id INT NOT NULL,
   category_descendent INT NOT NULL,
   PRIMARY KEY (parent_category_id, category_descendent),
   FOREIGN KEY (parent_category_id) REFERENCES Categories(category_id) ON DELETE CASCADE,
   FOREIGN KEY (category_descendent) REFERENCES Categories(category_id) ON DELETE CASCADE );

CREATE TABLE UserCategoryPreferences (
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (user_id, category_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE );

CREATE TABLE EventCategory (
    event_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (event_id, category_id),
    FOREIGN KEY (event_id) REFERENCES Events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE );

## Database Connection
![Database Connection](https://github.com/cs411-alawini/sp25-cs411-team084-BEAT/blob/main/doc/Pictures/Database_Connection.png)