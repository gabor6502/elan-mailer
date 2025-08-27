# Elan Mailer (Node.js, Nodemailer, TypeORM, PostgreSQL)

A node backend to send emails to my contact email via Nodemailer, and store records of this through TypeORM and PostgreSQL.

## SMTP
Uses Simple Mail Transfer Protocol with Nodemailer to send emails to a dedicated contact email address.

## Database
Keeps records of emails sent and by whom at what time. These records can later be used to deter spam emails or repeated emails to avoid exceeding STMP provider's quota. 