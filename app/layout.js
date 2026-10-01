import "./globals.css";

export const metadata = {
  title: "Cinderwell",
  description: "A reading room that turns over with the hour.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
