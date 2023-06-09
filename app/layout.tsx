import "./globals.css";
import {Roboto_Mono} from "next/font/google";
import {cx} from "class-variance-authority";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "PomoDuo | Shared pomodoro timer",
  description: "Simple Collaborative Pomodoro timer",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body
        className={cx(
          robotoMono.className,
          "bg-gradient-to-r from-yellow-200 via-green-200 to-green-300 animate-gradient-x",
        )}
      >
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
          <h1 className="text-6xl font-bold mb-8">PomoDuo</h1>

          {children}
        </main>
      </body>
    </html>
  );
}
