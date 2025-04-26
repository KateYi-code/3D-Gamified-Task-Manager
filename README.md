# Next.js + Prisma + MongoDB

## Getting Started

Here are the complete steps from git clone to starting the project:

### Clone the Repository

```bash
git clone git@github.com:UOA-CS732-S1-2025/group-project-virtualdominated.git
cd group-project-virtualdominated
```

### Set Up Node.js with NVM

This project uses Node.js v22.14.0 as specified in the `.nvmrc` file.

#### Install NVM (Node Version Manager)

If you don't have NVM installed:

- On macOS/Linux:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

- On Windows:
  - Install [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)

Follow the installation instructions and restart your terminal.

#### Use the Correct Node.js Version

Once NVM is installed, navigate to the project directory and run:

```bash
nvm install    # Installs the Node.js version specified in .nvmrc
nvm use        # Switches to the version specified in .nvmrc
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file and set the database connection string, or copy the example provided: .env.sample

#### Generate the Prisma client

```
npm run prisma:generate
```

### Start the Development Server

```bash
npm run dev
```

### Access the Application

Open your browser and go to http://localhost:3000 to view the application.

### Other Database Commands

```bash
# Generate Prisma client after schema changes
npm run prisma:generate

# Open Prisma Studio for database visualization
npm run prisma:studio
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions
are welcome!

## CI/CD

### GitHub Workflow

This project includes a GitHub workflow that automatically runs on push to main and on pull requests:

- Runs `npm run build` to ensure the project builds successfully
- Runs `npm run lint` to check for code style issues
- Runs on Ubuntu with Node.js 20

The workflow configuration is in `.github/workflows/build.yml`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use
the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for
more details.

## FAQ

### How do I add a new third party component?

We are using the ui.shadcn.com. To add a new component, you can follow these steps:
1. Go to the [ui.shadcn.com](https://ui.shadcn.com/docs/components/accordion) website.
2. Find the component you want to add.
3. install the component using the command provided in the website.
   4. `npx shadcn@latest add progress`