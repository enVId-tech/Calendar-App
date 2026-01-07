# Calendar App

A full-stack calendar application built with React, TypeScript, and Express, featuring Google OAuth authentication and MongoDB for data persistence. Create, manage, and organize your events with an intuitive interface.

## Features

- **User Authentication** - Secure login with Google OAuth 2.0
- **Event Management** - Create, edit, and delete calendar events
- **Interactive Calendar** - Visual calendar interface for viewing and managing events
- **User Accounts** - Personal account management and settings
- **MongoDB Integration** - Persistent data storage with MongoDB
- **Session Management** - Secure cookie-based session handling
- **Responsive Design** - Modern, responsive UI built with React and SCSS

## Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **SCSS** - Styling with CSS preprocessor
- **React Helmet Async** - Document head management

### Backend
- **Express 5** - Node.js web framework
- **MongoDB** - NoSQL database
- **Passport.js** - Authentication middleware with Google OAuth 2.0
- **bcrypt** - Password hashing
- **Express Session** - Session management
- **TypeScript** - Type-safe server code

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance (local or cloud)
- Google OAuth 2.0 credentials

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Calendar-App
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `server/modules/credentials.env.local` file with the following:
```env
MONGODB_URI=your_mongodb_connection_string
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
APP_HOSTNAME=http://localhost:5173
SERVER_PORT=3000
```

4. Configure Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

## Development

Run the development environment with concurrent client and server:

```bash
# Start the Vite development server (client)
npm run dev

# In a separate terminal, start the Express server
npm run server
```

The client will be available at `http://localhost:5173` and the server at `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start Vite development server
- `npm run server` - Start Express server with nodemon (hot reload)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run ncu` - Update dependencies

## Building for Production

1. Build the client:
```bash
npm run build
```

2. The built files will be in the `public/` directory

3. Start the production server:
```bash
npm run server
```

The Express server will serve the static files from the `public/` directory.

## Project Structure

```
Calendar-App/
├── public/              # Built static files
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   └── modules/         # Server utilities
│       ├── encryption.ts    # Password hashing utilities
│       ├── env.ts           # Environment configuration
│       ├── interface.ts     # TypeScript interfaces
│       └── mongoDB.ts       # Database operations
├── src/                 # React frontend
│   ├── main.tsx         # Client entry point
│   ├── RenderPages.tsx  # Router configuration
│   ├── assets/          # Static assets
│   │   ├── components/  # Reusable components
│   │   ├── scss/        # Stylesheets
│   │   └── ts/          # Utility functions
│   └── pages/           # Application pages
│       ├── credentials/ # Login/logout pages
│       └── main/        # Main application pages
├── package.json
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Routes

- `/` - Homepage
- `/login` - User login with Google OAuth
- `/logout` - User logout
- `/calendar` - Calendar view
- `/events` - Events management
- `/account` - User account settings

## Security

- Passwords are hashed using bcrypt
- Sessions are secured with encrypted cookies
- Google OAuth 2.0 for authentication
- Environment variables for sensitive data
- CORS configuration for API security

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

### MongoDB Connection Issues
- Verify your MongoDB URI in the environment variables
- Ensure MongoDB is running (if using local instance)
- Check network connectivity to MongoDB Atlas (if using cloud)

### Google OAuth Errors
- Verify CLIENT_ID and CLIENT_SECRET are correct
- Check authorized redirect URIs in Google Cloud Console
- Ensure APP_HOSTNAME matches your development URL

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Ensure all TypeScript errors are resolved: `npm run lint`

## Support

For issues and questions, please open an issue on the GitHub repository.
