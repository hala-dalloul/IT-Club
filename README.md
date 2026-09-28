# UCAS IT Club Platform

A web-based content management and administration platform for the IT Club, built with TypeScript and Supabase.

## Overview

The platform combines a public club website, an administration dashboard, and a centralized media library.

The current application exposes:

```text
/                -> Public IT Club website (Arabic)
/en              -> Public IT Club website (English)
/news/<slug>     -> A news item by its readable name (same under /en)
/admin           -> Administration dashboard
/club/...        -> Old addresses, permanently redirected to the ones above
```

Supabase provides authentication, PostgreSQL data management, Row Level Security, and media storage.

## Features

### Public Platform
- Club information and configurable content.
- Projects, members, events, achievements, and partners.
- Public media.
- Contact and membership submissions.

### Administration
- Authenticated administration.
- Editor and super administrator roles.
- Content creation and editing.
- Club settings management.
- Submission management.
- Member and project management.

### Media Library
- JPG, PNG, and WebP uploads.
- Maximum upload size of 5 MB.
- Image compression and resizing.
- Search and rename.
- Reuse existing media across content.
- Track media usage.
- Prevent deletion of referenced images.

## Architecture

```text
Web Application
├── Public Club Website
├── Administration Dashboard
└── Game
        |
        v
Supabase
├── Authentication
├── PostgreSQL
├── Row Level Security
└── Storage
```

## Data Model

| Table | Responsibility |
|---|---|
| `club_content` | Projects, members, events, achievements, partners |
| `club_settings` | Official club text and links |
| `club_submissions` | Membership and contact submissions |
| `club_admins` | Editor and super administrator roles |
| `club_media` | Media library records |
| `club_content_media` | Media/content relationships |

## Authorization

The security boundary is enforced at the PostgreSQL/Supabase layer.

Roles include `editor` and `super_admin`.

UI restrictions are complemented by Row Level Security so authorization does not depend only on hidden or disabled interface controls.

Public media is available to the club website, while media-library management requires an authorized account.

## Technology Stack

| Area | Technology |
|---|---|
| Language | TypeScript |
| Build Tool | Vite |
| Runtime / Package Manager | Bun |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Authorization | PostgreSQL RLS |
| Storage | Supabase Storage |
| Testing | PGlite |
| Formatting | Prettier |
| Linting | ESLint |

## Environment Configuration

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Never place service-role keys, database passwords, or other private credentials in `VITE_*` variables or source control.

## Development

```bash
bun install --frozen-lockfile
bun run dev
bun run typecheck
bun run test
bun run build
bun run build:static
```

## Database Setup

The repository includes Supabase SQL migrations for the required schema, policies, storage configuration, and related functions.

Administrative users are created through Supabase Authentication and then assigned their platform role through the provided SQL setup.

Production credentials should remain outside the repository.

## Testing

PGlite-based tests cover database-oriented behavior including visitor access, authenticated users, editor and administrator permissions, submission privacy, validation, role revocation, and media/content relationships.

Local database tests do not replace verification against a real Supabase deployment.

## Deployment

Before deployment:

1. Configure the required `VITE_SUPABASE_*` variables.
2. Apply the database migration to the intended Supabase project.
3. Configure administrative accounts.
4. Verify RLS policies.
5. Test authentication, media uploads, content editing, and submissions.
6. Build the client for the selected hosting platform.

Do not commit `.env.local` or production secrets.

## What This Project Demonstrates

- TypeScript web application development.
- Supabase integration.
- PostgreSQL schema design.
- Row Level Security.
- Authentication and role-based authorization.
- Storage and media workflows.
- Database validation.
- Automated database-oriented testing.
- Administration dashboard development.
- Translating organizational requirements into a working system.

## Contributing

1. Fork the repository.
2. Create a focused branch.
3. Configure a local development environment.
4. Implement and test the change.
5. Run type checking, tests, and a production build.
6. Open a pull request describing the change and any database migration impact.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Author

Hala Dalloul

GitHub: https://github.com/hala-dalloul
