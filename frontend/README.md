# Best Reads – An Online Bookstore

## Abstract

**Best Reads** is a web-based online bookstore platform designed to enhance the reading experience for book enthusiasts by offering a seamless and user-friendly interface for browsing, purchasing, and managing book collections. Built on a **three-tier architecture**, the system uses **React.js** for the front end, **Django** for backend logic, and **PostgreSQL** for data management.

Key features include detailed book listings, personalized interactions such as favorites, ratings and requesting unavailable books, and admin tools for managing books, users, and orders. Simulated payment integration with **eSewa** and **Khalti** is included, though real transactions are not supported. Despite lacking real-time chat support, the platform delivers an efficient and intuitive online book shopping experience.

## Table of Contents

- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Scope](#scope)
- [Limitations](#limitations)
- [Use Case Diagram](#use-case-diagram)
- [Technologies Used](#technologies-used)
  - [Front-End](#front-end)
  - [Back-End](#back-end)
- [Screenshots](#screenshots)
- [Demo Video](#demo-video)
- [Conclusion](#conclusion)
- [Future Recommendations](#future-recommendations)
- [Contact Us](#contact-us)

## Problem Statement

- **Lack of Complete Book Information and Personalization**    
    Many platforms fail to provide key details like author, age group, or language. Users cannot personalize experiences through favorites or ratings.

- **Challenges in Ordering and Payment Process**    
    Unclear ordering processes and unreliable payment integration often result in failed or abandoned transactions.

- **Poor Communication and Limited User Involvement**    
    Users struggle to request unavailable books or contact support due to lack of communication features.

## Objectives

To develop a feature-rich and user-friendly online bookstore that:

- Provides comprehensive book details  
- Supports favorites, ratings, and book requests  
- Offers a smooth ordering process  
- Enables effective bookstore and user management for admins

## Scope

- **User Account Management**    
    Registration, login, profile editing, address management, and password updates.

- **Book Browsing and Ordering**    
    Book search, detailed views, add to cart, add to favorites, rate and order placement.

- **Admin Dashboard**    
    Tools to manage books information, orders, and book requests.

## Limitations

- **No Real Payment Functionality**    
    Though integrated with dummy APIs (eSewa, Khalti), real transactions are not processed.

- **No Live Chat Support**    
    Communication is limited to static contact information. Real-time issue resolution is unavailable.

## Use Case Diagram

<img src="public/img/use-case.png">

### Use Cases of User

- **Signup and Login** – Register and authenticate using email, phone, and password.
- **Manage Profile** – Edit personal details, address, and password.
- **Add to/Remove from Cart** – Manage cart items for checkout.
- **Place/Cancel Orders** – Order available books or cancel active orders.
- **Add to Favorites** – Bookmark preferred books.
- **Rate Book** – Provide feedback through a rating system.
- **Request Book** – Request books not currently in stock.
- **Logout** – Securely sign out from the system.

### Use Cases of Admin

- **Login** – Admin authentication.
- **Manage Bookstore Info** – Update store name, location, and contact info.
- **Manage Books** – Add, edit, or delete book details.
- **Manage Users** – View and manage registered users.
- **Manage Orders** – Approve or disapprove user orders.
- **Logout** – End admin session securely.

## Technologies Used

### Front-End

- React.js

### Back-End

- Django
- PostgreSQL

## Screenshots

> Below are some screenshots of the website interface and admin dashboard:

### Home Page
<img src="public/img/1.png"><br/>

### Shop Page
<img src="public/img/2.png"><br/>

<img src="public/img/3.png"><br/>

<img src="public/img/4.png"><br/>

### Cart Page
<img src="public/img/5.png"><br/>

### Favorites Page
<img src="public/img/6.png"><br/>

### Notification UI
<img src="public/img/7.png"><br/>

### Settings UI
<img src="public/img/8.png"><br/>

### Order Page
<img src="public/img/15.png"><br/>

### Payment Flow
<img src="public/img/16.png"><br/>

<img src="public/img/17.png"><br/>

<img src="public/img/18.png"><br/>

<img src="public/img/19.png"><br/>

### Admin Dashboard
<img src="public/img/9.png"><br/>

<img src="public/img/10.png"><br/>

<img src="public/img/11.png"><br/>

<img src="public/img/12.png"><br/>

<img src="public/img/13.png"><br/>

<img src="public/img/14.png"><br/>

## Demo Video

> Watch the working demo of Best Reads by clicking the image below:

<a href="https://drive.google.com/file/d/1G3j4JbT_KHAQf6pxQ0wNzEqh3_VqLtMn/view?usp=drive_link" target="_blank">
  <img src="public/img/1.png" alt="Demo Video" width="600"/>
</a>

## Conclusion

Best Reads offers an intuitive and efficient online bookstore experience for both users and administrators. The platform successfully integrates features like detailed book information, ratings, favorites, and simplified order processing. Although it currently lacks real-time payment and chat support, the system is robust, secure, and well-structured for future expansion.

## Future Recommendations

Several areas have been identified for future improvements:

- Real-time chat support for instant user assistance
- Add book review sections 
- Add recommendation system based on ratings and user preferences  
- Implement delivery tracking for orders  
- Introduce multi-language support  
- Include mobile app version of the platform

## Contact Us

This project was collaboratively developed by:

- [Nitika Maharjan](https://github.com/NitikaMaharjan)  
    - Designed Best Reads logo.
    - Developed the navigation bar, footer, and the main home page.  
    - Implemented the signup and login pages with styling and form validation.  
    - Created "Best Sellers” and “Top Rated” book sections on the shop page.  
    - Styled the Book Details page, added Bootstrap for accordion and drop down layout.  
    - Designed and implemented the cart page UI and increment/decrement logic for item quantity.  
    - Built user profile features including "Edit Personal Info" and "Change Password".  
    - Implemented Payment Success/Failure and Order Success/Fail response pages.  
    - Added filtering functionality by category during book search.  
    - Designed and styled the complete admin dashboard with custom CSS.  

- [Rohan Kasichhwa](https://github.com/Rohankasichhwa2023)  
    - Designed PostgreSQL database schema and implemented backend models.  
    - Built REST APIs using Django function-based views to connect frontend and backend.  
    - Implemented ratings and favorites features for user interaction with books.  
    - Developed the order placement system with status tracking.  
    - Integrated simulated payment gateways (eSewa and Khalti).  
    - Implemented a notification system for actions like successful orders or failed payments.  
    - Developed the admin dashboard for managing books, users, and orders.  
    - Implemented book request functionality for unavailable books.  
    - Added address selection and modification during the checkout process. 

Feel free to connect with us on GitHub for feedback, suggestions, or collaboration opportunities.
