import type { Metadata } from "next";
import "./globals.css";
import { NotificationToast } from "@/components/NotificationToast";
import Header from "@/components/Header";
import ApolloWrapper from "@/components/ApolloWrapper";
import ClientBodyWrapper from "@/components/ClientBodyWrapper";

export const metadata: Metadata = {
  title: "frontend-take-home",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div id="client-wrapper">
          <ClientBodyWrapper>
            <ApolloWrapper>
              <div className="container rounded-xl mx-auto min-h-[calc(100vh-6rem)]">
                {children}
              </div>
            </ApolloWrapper>
            <NotificationToast />
          </ClientBodyWrapper>
        </div>
      </body>
    </html>
  );
}
