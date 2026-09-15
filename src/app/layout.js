import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Pollen Parque | Visão geral",
  description: "Gestão do programa de afiliados Pollen Parque",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
