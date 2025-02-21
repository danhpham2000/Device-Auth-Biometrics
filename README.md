# This is a repository for implementing the solution for authenticate email without any passkey technology
# Description:
- Tech stack: Simple with React, WebAuthn APIs, Python, FastAPI, and PostgreSQL
- Checklist:
  
      - Backend (OK)
  
      - Frontend (OK)
  
      - Logic (OK)
  
      - Trigger Touch ID (OK)

# Update process:  

    - Added new logic and the authentication process. For example, the user can log in without server checking without the help of local storage. 
    - Since the local storage has expired time on it. For example, within 3 minutes, they can log in without checking the  server side, local storage is acting like caching storage
    - Biometrics checking will always be required at the time of local storage checking
