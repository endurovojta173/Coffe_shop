# Set up the Coffe shop app

Follow these steps after cloning the repository on a new computer.

## Requirements

- [Node.js](https://nodejs.org/) 20.19 or newer
- npm (included with Node.js)
- A [Supabase](https://supabase.com/) account and project

## 1. Clone and install

```sh
git clone <repository-url>
cd Coffe_shop
npm install
```

`npm install` installs the packages declared in `package.json`. The checked-in
`package-lock.json` keeps the dependency versions consistent across machines.

## 2. Configure Supabase

1. Create a project in the Supabase Dashboard, or open the project you want to
   use.
2. In the project dashboard, open **Project Settings → API** (or the
   **Connect** dialog) and copy the project URL and the publishable/anon key.
3. Create a local environment file from the template:

   ```sh
   cp .env.example .env
   ```

4. Replace the example values in `.env`:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

   Keep `.env` local; it is ignored by Git. Values prefixed with `VITE_` are
   included in the browser bundle, so use only the Supabase publishable/anon
   key here. **Never put a service-role key or other secret in a `VITE_`
   variable.** Protect data with Supabase Row Level Security (RLS) policies.

The ready-to-use Supabase client is exported from `src/lib/supabase.ts`. Import
it where needed:

```ts
import { supabase } from "./lib/supabase";
```

If the environment variables are missing, the client reports a configuration
error rather than silently connecting to an invalid project.

## 3. Start the app

```sh
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## 4. Validate or build

```sh
npm run typecheck
npm run build
npm run preview
```

The production build is written to `dist/`. `npm run preview` serves that
build locally.

## Environment variables

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | URL of the Supabase project |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable/anon key for browser access |

When deploying, set the same variables in the hosting provider's environment
configuration. Do not upload or commit your local `.env` file.
