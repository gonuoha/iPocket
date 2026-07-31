# Prisma + PostgreSQL Setup

## Overview

Set up Prisma ORM with PostgreSQL database.

## Requirements

- Use local PostgreSQL (running in docker)
- Create initial schema based on data models in project-overview.md (this will evolve)
- Include NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes

## References

- Initial data models: `@context/project-overview.md`
- Database standards: `@context/coding-standards.md`
- Prisma docs: https://prisma.io/docs (Prisma 7 has breaking changes - fetch latest)

## Notes

The connection string will be in DATABASE_URL different environments will specifiy the url by updating the env variable. So we ALWAYS create migrations and never push directly unless specified.

IMPORTANT! Use Prisma 7, which has some breaking changes. Read the entire upgrade guide at https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7 to get a good idea of the changes.

You can also look at the setup guide here - https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres