# ByteMeds - Medical Appointment Management System

ByteMeds is a modern, full-stack medical appointment management system built with Next.js, Supabase, and TypeScript. The application provides a comprehensive platform for managing medical appointments, user registrations, and administrative controls.

## Features

### Authentication & User Management
- **Role-based Authentication**:
  - Patient accounts for booking appointments and managing health records
  - Doctor accounts with specialty-specific features
  - Administrator accounts with full system control
  - Secure session management with NextAuth.js
- **Registration System**:
  - Configurable registration system (can be enabled/disabled by administrators)
  - Email validation
  - Password strength requirements
  - Automatic role assignment
- **Profile Management**:
  - Personal information management
  - Medical history tracking
  - Contact information updates
  - Emergency contact management

### Patient Dashboard
- **Appointment Management**:
  - View upcoming and past appointments
  - Book new appointments with specialty-based doctor selection
  - Real-time availability checking
  - Appointment reminders
- **Medical History**:
  - Access to personal medical history
  - View test results and diagnoses
  - Track prescriptions and medications
  - Download medical reports
- **Doctor Search**:
  - Search doctors by specialty
  - View doctor availability
- **AI Powered Analysis**:
  - Learn more about your symptoms and what to do about them with the advice given by the AI
  - Get doctor suggestions
  - Get the analysis of your pictures

### Doctor Dashboard
- **Appointment Management**:
  - Daily, weekly, and monthly schedule views
  - Patient appointment history
  - Quick access to patient records
  - Appointment notes and follow-ups
  - Ability to move the appointments to a later date
- **Patient Management**:
  - View patient medical histories
  - Add medical notes and observations
  - Prescribe medications
  - Schedule follow-up appointments
- **Availability Settings**:
  - Set working hours
  - Mark vacation days
  - Block specific time slots
  - Set appointment duration preferences

### Administrative Panel
- **System Settings**:
  - Registration Control:
    - Enable/disable new user registration
    - Set registration requirements
    - Manage email verification settings
  - Appointment System:
    - Enable/disable appointment booking
    - Configure appointment types and durations
    - Set booking rules and restrictions
  - Maintenance Mode:
    - Enable/disable system maintenance mode
    - Set maintenance messages
    - Allow admin access during maintenance
- **User Management**:
  - Assign and modify user roles

### Appointment System Features
- **Smart Booking System**:
  - Intelligent conflict detection
  - Automatic time slot management
  - Multiple appointment types with varying durations:
    - Check-ups (30-45 minutes)
    - Follow-ups (15-30 minutes)
    - Consultations (45-60 minutes)
    - Tests/Screenings (30-45 minutes)
    - Vaccinations (15-30 minutes)
- **Scheduling Logic**:
  - Working hours enforcement
  - Weekend/holiday handling
  - Double-booking prevention

### Security Features
- **Protected Routes**:
  - Role-based access control (RBAC)
  - Session validation
  - Route protection middleware
  - Secure API endpoints
- **Maintenance Mode**:
  - System-wide maintenance control
  - Admin override capabilities
  - Maintenance page customization
  - Scheduled maintenance planning
- **Error Handling**:
  - Comprehensive error logging
  - User-friendly error messages
  - Form validation
  - API error handling
- **Data Protection**:
  - Encrypted data storage
  - Secure password hashing
  - HIPAA compliance measures
  - Regular security audits

### UI/UX Features
- **Responsive Design**:
  - Tablet/Mobile and Desktop optimization
  - Dark/light mode support (based on the system preference)
  - Accessible interface
- **Interactive Components**:
  - Real-time form validation
  - Dynamic loading states
  - Toast notifications
  - Modal confirmations
- **Navigation**:
  - Intuitive menu structure
  - Breadcrumb navigation
  - Quick action shortcuts
  - Search functionality

## Technical Stack

### Frontend
- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui Components
- Framer Motion for animations

### Backend
- Supabase (PostgreSQL)
- NextAuth.js for authentication
- Server Actions for API routes

### Key Libraries
- `date-fns` for date manipulation
- `zod` for schema validation
- `react-hook-form` for form management
- `lucide-react` for icons
- `sonner` for toast notifications

## Getting Started

### Prerequisites
- Node.js 16.8 or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ByteMeds.git
cd ByteMeds
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:
- users
- doctors
- appointments
- medical_records
- prescriptions
- system_settings

For detailed schema information, refer to the `types/supabase.ts` file.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request




## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
