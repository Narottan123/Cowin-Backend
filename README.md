# AarogyaSetu-Backend



This project is a AarogyaSetu application that allows users to register, login, check available slots, Book Slot for 1st Dose and 2nd Dose,Update the Slot .
And allows admin to post the slot details,check numberr of registered users for the slot,check the registered user details based on 1st Dose and 2nd Dose,By filter check the registered
users deatils.

## Technologies Used

- Node.js
- Express
- MongoDB

## Prerequisites

Before running the project, make sure you have the following installed:

- Node.js
- MongoDB

## Installation

 Clone the repository:

 1.  git clone https://github.com/Narottan123/AarogyaSetu-Backend.git
 2. Install dependencies:  npm install

## Usage

1. Start the server:  node index.js
2. Open your web browser and navigate to http://localhost:<port_number> to access the application.

## API Endpoints

## User APIs

1. POST /register: Create a user account.
2. POST /login: User login.
3. GET /slotdetails: check the available vaccine slot details
4. POST /bookslot: Book first Dose
5. POst /bookslot2: Book second Dose
6. PUT /slotupdate: Update the slot details

## Admin APIs

1. POST /vaccineslot: Post the vacccine available slots that user can see and book
2. POST /login: take admin username and password manually using MongoClient wiithout using any appi endpoint
3. GET /totaluserregister: get total registered user numbers based on filter
4. POST /slotRegistrationDetails: get slot registered details based on specific date




## Authentication and Authorization

All user and admin routes are protected using Authentication and Authorization
I have used .env file to store sensitive information including moongodb string,port number,secretKey etc and Hashed the password Using bcrypt.






