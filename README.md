
# microservices-Node.JS

Node.js Service: Handles User Authentication and User Profiles.

This is a Node.js backend service for user authentication and role-based access control in a real estate chat application. It uses JWT for secure authentication, allowing different roles (admin, landlord, tenant, agent) to access specific routes.

## Setup Instructions

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables in a `.env` file:
   ```plaintext
   CONNECTION_STRING=mongodb+srv://gtkandeya:tanatswa@cluster0.wa8fx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your_jwt_secret
   PORT=7001
   ```
4. Start the Django server first.
5. Then, start the Node.js server:
   ```bash
   npm run dev
   ```

### Communication Between Servers

The Node.js server will communicate with the Django server as a proxy using WebSockets. Ensure that the Django server is running before starting the Node.js server to facilitate this communication.

## API(s)

### Base URL

All endpoints are prefixed with `/api`:

```
http://localhost:7001/api
```

### Endpoints

---

### **Auth Endpoints**

#### 1. Register a New User

- **Endpoint**: `/auth/register`
- **Method**: `POST`
- **Description**: Registers a new user with `username`, `password`, `email`, `profile image (if available)` and role.
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "johndoe@example.com",
    "password": "yourpassword",
    "role": "tenant",
    "image": ""
  }
  ```
- **Response**:
  - **201 Created**:
    ```json
    {
      "message": "User registered successfully: johndoe"
    }
    ```
  - **500 Internal Server Error**: Error message if registration fails.

#### 2. Login a User

- **Endpoint**: `/auth/login`
- **Method**: `POST`
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "password": "yourpassword"
  }
  ```
- **Response**:
  - **200 OK**:
    ```json
    {
      "token": "your_jwt_token"
    }
    ```
  - **404 Not Found**: If the username is not found.
  - **400 Bad Request**: If the password is incorrect.

---

### **User Profile Endpoints**

#### 3. Edit User Profile

- **Endpoint**: `/user/profile`
- **Method**: `PUT`
- **Description**: Updates the authenticated user's profile.
- **Headers**:
  - `Authorization: Bearer <your_jwt_token>`
- **Request Body**: Only include fields to update.
  ```json
  {
    "username": "newUsername",
    "email": "newemail@example.com",
    "profilePicture": "https://example.com/profile.jpg"
  }
  ```
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "User profile updated successfully",
      "user": {
        "_id": "user_id",
        "username": "newUsername",
        "email": "newemail@example.com",
        "profilePicture": "https://example.com/profile.jpg"
      }
    }
    ```
  - **404 Not Found**: If the user does not exist.
  - **500 Internal Server Error**: If there is an error updating the profile.

---

### **Role-Based Access Control Endpoints**

These endpoints are accessible based on the user’s role. The `authorizedRoles` middleware ensures that only users with the specified roles can access each route.

#### 4. Admin Page (Admin Only)

- **Endpoint**: `/user/admin`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <your_jwt_token>`
- **Description**: Access restricted to `admin` role.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Admin page"
    }
    ```
  - **401 Unauthorized**: If the user is not an admin.

#### 5. Landlord Page (Admin, Landlord)

- **Endpoint**: `/user/landlord`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <your_jwt_token>`
- **Description**: Accessible by `admin` and `landlord` roles.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Landlord page"
    }
    ```
  - **401 Unauthorized**: If the user is not an admin or landlord.

#### 6. Tenant Page (Tenant Only)

- **Endpoint**: `/user/tenant`
- **Method**: `GET`
- **Description**: Public page, accessible by anyone.
- **Response**:
  ```json
  {
    "message": "Tenant page"
  }
  ```

#### 7. Agent Page (Admin, Landlord)

- **Endpoint**: `/user/agent`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <your_jwt_token>`
- **Description**: Accessible by `admin` and `landlord` roles.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Agent page"
    }
    ```
  - **401 Unauthorized**: If the user is not an admin or landlord.

---

## Error Codes

- **401 Unauthorized**: Access is denied due to missing or invalid JWT token.
- **404 Not Found**: The requested resource could not be found.
- **500 Internal Server Error**: The server encountered an error processing the request.

---

## Notes

- All endpoints requiring authentication must include the `Authorization` header with the JWT token.
- Ensure that roles are assigned correctly during registration to access the relevant role-based routes.

--- 
