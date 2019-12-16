# Document-Service-REST-API-MEN
 MEN (MongoDB - Express - Nodejs) Application: Document Service REST API that supports the document operations. 
 
# General requirements and descriptions

Design and implement a Document Service REST API that supports the operations. In particular, a document has a name, and one or more revisions. The system also stores user information, which includes at least a username and a password (stored as a bcrypt hash) for each user.

Each revision has a file uploaded by a user, some notes on the revision (optional), and a timestamp of when the revision was created or updated. The API should include the following endpoints (i.e. operations):

* Get all documents. For each document, include the document name, number of revisions, and the timestamp of the latest revision. 
* Get a document. The response should include the document name and all its revisions in order. For each revision, include the notes, the timestamp, and a link to download the file for that revision -- note that it's a link to download the file, not the file itself.
* Download the file of a revision. The response should include a Content-Disposition header with the value "attachment" and the original name of the uploaded file.
* Add a document, which creates the first revision of the document. The request should include the name of the document, some notes (optional), and a file.
* Add a new revision to a document.
* Edit a revision -- only the revision notes can be edited, not the file.
* Only authenticated users can perform any operation (no need authentication for login).
* Only the creator of a document can perform any operation on a document (including the revisions and files of the document).
Environment-specific information such as database information and JWT secrete should be placed in a .env file and set using the dotenv package.
* For login endpoint that authenticates a user, if authentication is successful, it sends back a JWT token which can be used in subsequent requests.

# Play around

1. Clone or download a project to your local machine.
2. Change ".env.sample" file name to ".env" 
3. Fill out information inside ".env" file
4. run comman **npm start** to start the server.
5. import **Homework4_cs5220.postman_collection.json** file to Postman to play around with REST API.

# Contact.
Email: phucaone@gmail.com (Kevin)
