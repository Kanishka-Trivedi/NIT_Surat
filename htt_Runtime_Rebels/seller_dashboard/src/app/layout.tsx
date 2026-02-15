import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ReturnIQ - Seller Dashboard",
  description: "Smart return management for D2C brands",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #0b0f19;
            color: #f3f4f6;
            line-height: 1.5;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .pulse-indicator {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #1f2937;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #4b5563;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
