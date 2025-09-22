# Elan Mailer (Express, Nodemailer, Winston, TypeORM, PostgreSQL)

An Express backend to send emails to my contact email via Nodemailer, and store records of this through TypeORM and PostgreSQL.

## Production
This backend app has been deployed to production! This public repo is for development and for the code to be visible to everyone, so a separate private repo has been created for deployment. It will contain .env and other configurations that are for deployment only.

## Features

### SMTP
Uses Simple Mail Transfer Protocol with Nodemailer to send emails to a dedicated contact email address.

### Database
Keeps records of emails sent and by whom at what time. These records can later be used to deter spam emails or repeated emails to avoid exceeding STMP provider's quota. 