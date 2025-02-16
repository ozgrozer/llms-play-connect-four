import './globals.css'

export const metadata = {
  title: 'LLMs Play Connect Four',
  description: 'Watch LLMs compete against each other in Connect Four'
}

export default function RootLayout ({ children }) {
  return (
    <html lang='en'>
      <body>
        {children}
      </body>
    </html>
  )
}
