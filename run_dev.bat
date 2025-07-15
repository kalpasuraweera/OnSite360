@echo off
echo Starting OnSite360 Development Environment...

REM Start the backend server in a new window
start cmd /k "cd backend && npx prisma generate && npm run start:dev"

REM Start the frontend server in a new window
start cmd /k "cd frontend && npm run dev"

echo Development servers started.
echo - Frontend: Running on default port (http://localhost:5173)
echo - Backend: Running on default port (http://localhost:3000)
echo.
echo Press any key to close this window. Development servers will continue running.
pause > nul