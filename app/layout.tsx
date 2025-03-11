import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { LogoutButton } from "@/components/logout-button"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Carga y Mapeo de Archivos",
  description: "Interfaz para cargar y mapear archivos CSV y XLSX",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-background">
            <header className="border-b">
              <div className="container mx-auto py-4 px-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-primary">UNERG | SOLICITUDES</h1>
                <LogoutButton />
              </div>
            </header>
            {children}
          </div>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'