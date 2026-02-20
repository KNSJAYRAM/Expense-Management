import './globals.css'

export const metadata = {
  title: 'Expense Management System',
  description: 'A comprehensive expense management and approval system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}
