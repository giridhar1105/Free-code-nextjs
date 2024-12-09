const express = require('express');
const cors = require('cors');
const axios = require('axios'); 

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json()) 

app.post('/gemini-1.5-flash', async (req, res) => {
  const { input, timestamp } = req.body;
  const Prompt = `
  Create a Next.js application with the following features:

  **Frontend**:
    - Framework: Next.js (with React 18 and Suspense/Concurrent Mode enabled)
    - Styling: Tailwind CSS (for utility-first CSS), with PostCSS for optimized build
    - Advanced Features: Utilize Next.js Image component for optimized image loading (with lazy loading and automatic image optimization)
    - SEO: Implement Next.js Head component for dynamic metadata management (e.g., title, meta tags) and use React Helmet for better control over SEO metadata

  **Backend (API Routes)**:
    - Framework: Next.js API routes, leveraging serverless functions for simplicity and scalability. 
    - If needed for advanced backend logic, integrate **Express.js** in a separate directory, and use **middleware** for logging, error handling, and security (like CORS or rate-limiting)
    - Data Fetching: Axios for HTTP requests to external APIs, with built-in request cancellation to prevent unnecessary API calls.
    - Database: Use **Prisma** (ORM for Node.js), enabling an efficient and type-safe interaction with the database (even though the prompt avoids TypeScript, Prisma has a lot of value in terms of ease of use, migrations, and schema definitions)
    - Database Connection: Use a connection pool for optimized database performance (e.g., Prisma with a connection manager).

  **Authentication**:
    - Library: **NextAuth.js** for authentication (supporting multiple providers like Google, GitHub, etc.), with JWT (JSON Web Tokens) for session management.
    - Add **CSRF protection** with NextAuth.js for enhanced security.
    - Enable **OAuth**, **email sign-ins**, and custom authentication flows based on business requirements.

  **Optional Features**:
    - **GraphQL API**: Implement **Apollo Server** or **GraphQL Yoga** if the app requires complex data interactions or real-time features (like subscriptions).
    - **Caching**: Use **Redis** for caching critical API data or sessions for performance optimization, or use **SWC** (Next.js's default compiler) for faster bundling and builds.
    - **File Handling**: Use **Multer** for handling file uploads, supporting different file storage options (local file storage, AWS S3, etc.). 
    - **Email Notifications**: Use **Nodemailer** for transactional email support (e.g., welcome emails, password resets).
    - **WebSockets**: Consider **Socket.io** for real-time data streaming (e.g., chat, live notifications).

  **Server-side Rendering (SSR) and Static Site Generation (SSG)**:
    - Utilize **Next.js's getServerSideProps** for SSR, enabling dynamic rendering for pages that need up-to-date content on each request.
    - Use **Next.js's getStaticProps** and **Incremental Static Regeneration (ISR)** for pre-rendering static content while keeping it fresh by revalidating pages at specified intervals.
    - Explore **Static Site Generation (SSG)** with static export for sites that don't require dynamic updates.

  **Project Structure**:
    - Organize the project with clear separation of **frontend** (pages, components, hooks, utils) and **backend** (API routes, database models, services) code.
    - Use **feature-based** project structure (e.g., separate directories for user, auth, product, etc.) to keep the codebase scalable.
    - Leverage **environment variables** for managing secrets (e.g., DB credentials, API keys) securely.

  **Deployment**:
    - Deploy the application to **Vercel** for ease of use, with continuous deployment from GitHub or GitLab.
    - Set up **CI/CD** pipelines (using GitHub Actions or similar) to automate testing and deployment workflows.
    - Ensure proper **caching headers** (for SSR/SSG) and use **CDN** for serving static assets globally.

  **Additional Enhancements**:
    - Implement **error monitoring** (e.g., Sentry or LogRocket) for tracking issues and user behavior in production.
    - Set up **performance monitoring** (e.g., Google Lighthouse, Next.js analytics) to track load times and optimize performance.
    - Use **Prerendering** for important SEO pages (e.g., homepage, product pages) for improved search engine rankings.

  Avoid:
    - Avoid using **TypeScript** in this project (follow standard JavaScript instead).

    Give the Project structure everytime.Strictly no text should be give only code and complete Project structure.
`;
  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'Invalid input text' });
  }

  try {
    const geminiApiResponse = await processWithGemini(Prompt,input);

    res.status(200).json({
      timestamp,
      input,
      aiResponse: geminiApiResponse,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error processing the request' });
  }
});

async function processWithGemini(Prompt , input) {
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyALNR541yuAafb95g6bf1_-7Pg7TTV_UBI`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: Prompt + input }] }],
        },
      });
 const aiResponse = response.data.candidates[0].content.parts[0].text;
 console.log(aiResponse)
      return aiResponse;
    } catch (error) {
      console.error('Error in calling Gemini 1.5 Flash API:', error);
      console.error('Server Response:', error.response.data); 
      throw new Error('Failed to process the request');
    }
  }

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});