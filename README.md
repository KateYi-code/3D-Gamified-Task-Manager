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

## Deployment

### Deploy on Vercel

Vercel is the easiest way to deploy your Next.js app, as it's built by the creators of Next.js.

1. **Create a Vercel Account**
   - Sign up at [vercel.com](https://vercel.com/signup) if you don't have an account

2. **Connect Your Repository**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Authorize Vercel to access your repository if prompted

3. **Configure Project**
   - Project Name: Enter a name for your deployment
   - Framework Preset: Next.js (should be auto-detected)
   - Root Directory: `./` (default)

4. **Environment Variables**
   - Add the following environment variables:
     - `DATABASE_URL`: Your MongoDB connection string
     - `BACKEND_URL`: The URL of your deployed application (will be provided by Vercel after deployment)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build and deployment to complete
   - Once deployed, Vercel will provide you with a URL for your application

6. **Update Environment Variables (if needed)**
   - After deployment, go to your project settings in Vercel
   - Update the `BACKEND_URL` to match your deployment URL
   - Redeploy the application for changes to take effect

### Deploy with Docker

You can also deploy the application using Docker, which allows you to run it on any platform that supports Docker containers.

1. **Prerequisites**
   - Install [Docker](https://docs.docker.com/get-docker/) on your machine
   - Make sure you have access to a MongoDB instance (local or cloud-based)

2. **Build the Docker Image**
   ```bash
   # Clone the repository (if you haven't already)
   git clone git@github.com:UOA-CS732-S1-2025/group-project-virtualdominated.git
   cd group-project-virtualdominated

   # Build the Docker image
   docker build -t virtualdominated .
   ```

3. **Run the Docker Container**
   ```bash
   # Run the container with environment variables
   docker run -d \
     -p 3000:3000 \
     -e DATABASE_URL="mongodb+srv://your-username:your-password@your-cluster-url/your-database" \
     -e BACKEND_URL="http://localhost:3000" \
     --name virtualdominated-app \
     virtualdominated
   ```

4. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`

5. **Stop and Remove the Container (when needed)**
   ```bash
   docker stop virtualdominated-app
   docker rm virtualdominated-app
   ```

6. **Deployment to Cloud Platforms**
   - You can deploy this Docker image to any cloud platform that supports Docker containers:
     - AWS ECS/ECR
     - Google Cloud Run
     - Azure Container Instances
     - Digital Ocean App Platform
     - Heroku (with Docker support)

   Make sure to set the appropriate environment variables when deploying to these platforms.

## FAQ

### How do I add a new third party component?

We are using the ui.shadcn.com. To add a new component, you can follow these steps:
1. Go to the [ui.shadcn.com](https://ui.shadcn.com/docs/components/accordion) website.
2. Find the component you want to add.
3. Install the component using the command provided in the website.
   1. `npx shadcn@latest add progress`
4. The component will be added to the `src/components/ui` folder.

### How to add a API/Service

In this repo, We have a `client` object which makes the API calls to the backend in a transparent way. You can add a new API by

1. Goto file `src/endpoints/index.ts`
2. Consider whether the API requires authentication.
3. If it does, add the service function to `authEndpoints`
4. If it doesn't, add the service function to `unauthEndpoints`
5. Now you can call the API in your component using the `client` object.
```typescript
import { client } from "@/endpoints/client";
// ...

const getUsers = async () => {
    return client.getUsers();
}
```
Under the hood, the `client` object will call the API in http POST and deserialize the reponse body into objects


### How to add icons?
we use `react-icons` in this project, you can add icons by following these steps:
1. Go to the [react-icons](https://react-icons.github.io/react-icons/) website.
2. Find the icon you want to add.
3. Click the icon to see the import statement.
4. Copy the import statement and paste it into your component file.


### How to add a modal?
1. Create a new component in which has a base prop of `ModalProps`, which is `isOpen: boolean, onClose: () => void`
2. Add the component to `src/components/modals.tsx`
3. Call `useModal` in your component to `openModal`, `modal`, `closeModal`
   1. `openModal` will open the modal, which you can call when you want to open the modal(with props)
   2. `modal` will return the modal component, which you should place it anywhere in your component
   3. `closeModal` will close the modal

Please refer to `src/components/target/TargetCreateModal.tsx` before you get started.

## Helpful resources

- [Prisma ER diagram](https://prisma-erd.simonknott.de/)
