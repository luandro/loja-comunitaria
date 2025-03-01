# Loja Comunitária

## Project info

**URL**: https://lovable.dev/projects/565dc03d-d5a3-4f3d-aafc-14a8862644aa

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/565dc03d-d5a3-4f3d-aafc-14a8862644aa) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Create a .env file with your environment variables (use .env.example as a template)
cp .env.example .env
# Edit the .env file with your actual values

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Environment Variables

This project uses environment variables for configuration. Copy the `.env.example` file to `.env` and edit the values as needed:

```sh
cp .env.example .env
```

### Available Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `VITE_PIX_RECIPIENT_NAME` | Name of the PIX payment recipient | "Artes Indígenas" |
| `VITE_PIX_RECIPIENT_CITY` | City of the PIX payment recipient | "São Paulo" |
| `VITE_PIX_RECIPIENT_KEY` | PIX key for payments | "example@email.com" |
| `VITE_PIX_API_URL` | URL for the PIX API | "https://gerarqrcodepix.com.br/api/v1" |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number for order confirmation (format: country code + number) | "5511999999999" |

If these variables are not set, the application will use default values and log warnings to the console.

> **Note about PIX Integration**: Due to CORS limitations with third-party PIX API services, this application attempts to use the API directly but falls back to local generation if needed. For production use, we've included an example backend proxy implementation in `src/server/api/proxy-pix.ts` that would need to be deployed as a serverless function or Express endpoint to fully utilize the PIX API without CORS issues.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/565dc03d-d5a3-4f3d-aafc-14a8862644aa) and click on Share -> Publish.

Remember to set the environment variables in your hosting platform for PIX payments to work correctly in production.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
